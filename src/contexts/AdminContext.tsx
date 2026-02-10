import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

const API_URL = "/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  image?: string;
  category: string;
  material?: string;
  color?: string;
  size?: string;
  quantity?: string;
  inStock: boolean;
  stock: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingMethod: "delivery" | "pickup";
  shippingAddress?: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: "card" | "eft";
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  id: string;
  title: string;
  description: string;
  level: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  instructor: string;
  spots: number;
  spotsLeft: number;
  type: "in-person" | "online";
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassBooking {
  id: string;
  classId: string;
  className: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  date: string;
  time: string;
  attendees: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CustomBeadRequest {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  description: string;
  specifications: {
    material?: string;
    color?: string;
    size?: string;
    quantity?: string;
    budget?: number;
  };
  images?: string[];
  status: "pending" | "reviewing" | "quoted" | "approved" | "in_production" | "completed" | "cancelled";
  quote?: {
    price: number;
    deliveryTime: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminContextType {
  // Products
  products: Product[];
  loadProducts: () => Promise<void>;
  addProduct: (product: FormData) => Promise<void>;
  updateProduct: (id: string, updates: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  loadCategories: () => Promise<void>;
  addCategory: (category: { name: string; description?: string }) => Promise<void>;
  updateCategory: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  loadOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;

  // Classes
  classes: ClassItem[];
  loadClasses: () => Promise<void>;
  addClass: (classItem: Omit<ClassItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateClass: (id: string, updates: Partial<ClassItem>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Bookings
  bookings: ClassBooking[];
  loadBookings: () => Promise<void>;
  updateBookingStatus: (id: string, status: ClassBooking["status"]) => Promise<void>;

  // Custom Bead Requests
  customRequests: CustomBeadRequest[];
  loadCustomRequests: () => Promise<void>;
  updateCustomRequestStatus: (id: string, status: CustomBeadRequest["status"]) => Promise<void>;
  addQuoteToRequest: (id: string, quote: CustomBeadRequest["quote"]) => Promise<void>;

  // Contact Messages
  contactMessages: ContactMessage[];
  loadContactMessages: () => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Analytics
  getAnalytics: () => {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalBookings: number;
    recentOrders: Order[];
    lowStockProducts: Product[];
  };

  // Loading state
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomBeadRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Products
  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data.map((p: any) => ({
        ...p,
        price: parseFloat(p.price),
        originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
        inStock: p.in_stock,
        image: p.images?.[0] || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })));
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }, []);

  const addProduct = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      const imageFiles = formData.getAll('images') as File[];
      
      for (const file of imageFiles) {
        if (file instanceof File) {
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        }
      }

      // Insert product
      const { error } = await supabase.from('products').insert({
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price') as string),
        original_price: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null,
        category: formData.get('category'),
        material: formData.get('material'),
        color: formData.get('color'),
        stock: parseInt(formData.get('stock') as string) || 0,
        in_stock: formData.get('inStock') === 'true',
        images: imageUrls
      });

      if (error) throw error;

      await loadProducts();
      toast({ title: "Product Added", description: "Product has been added to inventory." });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (response.ok) {
        await loadProducts();
        toast({ title: "Product Updated", description: "Product has been updated." });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error || "Failed to update product.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast({ title: "Product Deleted", description: "Product has been removed.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  // Categories
  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCategories(data.map((c: any) => ({
        ...c,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })));
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const addCategory = async (category: { name: string; description?: string }) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      if (response.ok) {
        await loadCategories();
        toast({ title: "Category Added", description: "Category has been created." });
      }
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const updateCategory = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await loadCategories();
        toast({ title: "Category Updated" });
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast({ title: "Category Deleted", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Orders
  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  }, [token, getAuthHeaders]);

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        toast({ title: "Order Updated", description: `Status changed to ${status}.` });
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  // Classes
  const loadClasses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  }, []);

  const addClass = async (classItem: Omit<ClassItem, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch(`${API_URL}/classes`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(classItem),
      });
      if (response.ok) {
        await loadClasses();
        toast({ title: "Class Added", description: "New class has been created." });
      }
    } catch (error) {
      console.error("Failed to add class:", error);
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassItem>) => {
    try {
      const response = await fetch(`${API_URL}/classes/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await loadClasses();
        toast({ title: "Class Updated" });
      }
    } catch (error) {
      console.error("Failed to update class:", error);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/classes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setClasses(prev => prev.filter(c => c.id !== id));
        toast({ title: "Class Deleted", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  // Bookings
  const loadBookings = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  }, [token, getAuthHeaders]);

  const updateBookingStatus = async (id: string, status: ClassBooking["status"]) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast({ title: "Booking Updated", description: `Status changed to ${status}.` });
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  // Custom Requests
  const loadCustomRequests = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/custom-requests`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCustomRequests(data);
      }
    } catch (error) {
      console.error("Failed to load custom requests:", error);
    }
  }, [token, getAuthHeaders]);

  const updateCustomRequestStatus = async (id: string, status: CustomBeadRequest["status"]) => {
    try {
      const response = await fetch(`${API_URL}/custom-requests/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        toast({ title: "Request Updated", description: `Status changed to ${status}.` });
      }
    } catch (error) {
      console.error("Failed to update request:", error);
    }
  };

  const addQuoteToRequest = async (id: string, quote: CustomBeadRequest["quote"]) => {
    try {
      const response = await fetch(`${API_URL}/custom-requests/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ quote, status: "quoted" }),
      });
      if (response.ok) {
        setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, quote, status: "quoted" } : r));
        toast({ title: "Quote Added" });
      }
    } catch (error) {
      console.error("Failed to add quote:", error);
    }
  };

  // Contact Messages
  const loadContactMessages = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/contact-messages`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data);
      }
    } catch (error) {
      console.error("Failed to load contact messages:", error);
    }
  }, [token, getAuthHeaders]);

  const markMessageAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/contact-messages/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (response.ok) {
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/contact-messages/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setContactMessages(prev => prev.filter(m => m.id !== id));
        toast({ title: "Message Deleted", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Analytics
  const getAnalytics = () => {
    const totalRevenue = orders
      .filter(order => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0);

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const lowStockProducts = products.filter(product => product.stock < 10);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalBookings: bookings.length,
      recentOrders,
      lowStockProducts,
    };
  };

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadClasses();
  }, [loadProducts, loadCategories, loadClasses]);

  // Load protected data when authenticated
  useEffect(() => {
    if (token) {
      loadOrders();
      loadBookings();
      loadCustomRequests();
      loadContactMessages();
    }
  }, [token, loadOrders, loadBookings, loadCustomRequests, loadContactMessages]);

  return (
    <AdminContext.Provider
      value={{
        products,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        loadCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        orders,
        loadOrders,
        updateOrderStatus,
        classes,
        loadClasses,
        addClass,
        updateClass,
        deleteClass,
        bookings,
        loadBookings,
        updateBookingStatus,
        customRequests,
        loadCustomRequests,
        updateCustomRequestStatus,
        addQuoteToRequest,
        contactMessages,
        loadContactMessages,
        markMessageAsRead,
        deleteMessage,
        getAnalytics,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
