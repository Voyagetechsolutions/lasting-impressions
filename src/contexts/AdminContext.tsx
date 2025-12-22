import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  material?: string;
  color?: string;
  inStock: boolean;
  stock: number;
  description: string;
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

interface AdminContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  
  // Bookings
  bookings: ClassBooking[];
  updateBookingStatus: (id: string, status: ClassBooking["status"]) => void;
  
  // Custom Bead Requests
  customRequests: CustomBeadRequest[];
  addCustomRequest: (request: Omit<CustomBeadRequest, "id" | "createdAt" | "updatedAt">) => void;
  updateCustomRequestStatus: (id: string, status: CustomBeadRequest["status"]) => void;
  addQuoteToRequest: (id: string, quote: CustomBeadRequest["quote"]) => void;
  
  // Analytics
  getAnalytics: () => {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalBookings: number;
    recentOrders: Order[];
    lowStockProducts: Product[];
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: "admin-products",
  ORDERS: "admin-orders", 
  BOOKINGS: "admin-bookings",
  CUSTOM_REQUESTS: "admin-custom-requests",
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomBeadRequest[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = (key: string, setter: (data: any) => void) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (e) {
          console.error(`Failed to parse ${key} data`);
        }
      }
    };

    loadData(STORAGE_KEYS.PRODUCTS, setProducts);
    loadData(STORAGE_KEYS.ORDERS, setOrders);
    loadData(STORAGE_KEYS.BOOKINGS, setBookings);
    loadData(STORAGE_KEYS.CUSTOM_REQUESTS, setCustomRequests);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_REQUESTS, JSON.stringify(customRequests));
  }, [customRequests]);

  // Product management
  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your inventory.`,
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    ));
    toast({
      title: "Product Updated",
      description: "Product has been successfully updated.",
    });
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Product Deleted",
      description: `${product?.name || "Product"} has been removed from your inventory.`,
      variant: "destructive",
    });
  };

  // Order management
  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders(prev => prev.map(order =>
      order.id === id
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ));
    toast({
      title: "Order Updated",
      description: `Order status changed to ${status}.`,
    });
  };

  // Booking management
  const updateBookingStatus = (id: string, status: ClassBooking["status"]) => {
    setBookings(prev => prev.map(booking =>
      booking.id === id
        ? { ...booking, status, updatedAt: new Date().toISOString() }
        : booking
    ));
    toast({
      title: "Booking Updated",
      description: `Booking status changed to ${status}.`,
    });
  };

  // Custom request management
  const addCustomRequest = (requestData: Omit<CustomBeadRequest, "id" | "createdAt" | "updatedAt">) => {
    const newRequest: CustomBeadRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCustomRequests(prev => [...prev, newRequest]);
    toast({
      title: "Custom Request Received",
      description: "New custom bead request has been submitted.",
    });
  };

  const updateCustomRequestStatus = (id: string, status: CustomBeadRequest["status"]) => {
    setCustomRequests(prev => prev.map(request =>
      request.id === id
        ? { ...request, status, updatedAt: new Date().toISOString() }
        : request
    ));
    toast({
      title: "Request Updated",
      description: `Custom request status changed to ${status}.`,
    });
  };

  const addQuoteToRequest = (id: string, quote: CustomBeadRequest["quote"]) => {
    setCustomRequests(prev => prev.map(request =>
      request.id === id
        ? { ...request, quote, status: "quoted", updatedAt: new Date().toISOString() }
        : request
    ));
    toast({
      title: "Quote Added",
      description: "Quote has been added to the custom request.",
    });
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

  return (
    <AdminContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        updateOrderStatus,
        bookings,
        updateBookingStatus,
        customRequests,
        addCustomRequest,
        updateCustomRequestStatus,
        addQuoteToRequest,
        getAnalytics,
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
