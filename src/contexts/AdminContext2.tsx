import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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

interface AdminContextType {
  products: Product[];
  loadProducts: () => Promise<void>;
  addProduct: (product: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        category: formData.get('category'),
        material: formData.get('material'),
        color: formData.get('color'),
        stock: parseInt(formData.get('stock') as string) || 0,
        in_stock: formData.get('inStock') === 'true',
        images: imageUrls
      });

      if (error) throw error;

      await loadProducts();
      toast({ title: "Product Added" });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product Deleted" });
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <AdminContext.Provider value={{ products, loadProducts, addProduct, deleteProduct, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
