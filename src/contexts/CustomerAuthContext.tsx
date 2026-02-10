import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface CustomerUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface OrderSummary {
  id: string;
  items: any[];
  total: number;
  status: string;
  shippingMethod: string;
  createdAt: string;
}

interface BookingSummary {
  id: string;
  className: string;
  date: string;
  time: string;
  attendees: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  orders: OrderSummary[];
  bookings: BookingSummary[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const API_URL = "/api";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      setToken(session.access_token);
      fetchProfile(session.access_token, session.user.id, session.user.email!);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setToken(session.access_token);
        fetchProfile(session.access_token, session.user.id, session.user.email!);
      } else {
        setUser(null);
        setToken(null);
        setOrders([]);
        setBookings([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authToken: string, supabaseId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, phone')
        .eq('id', supabaseId)
        .maybeSingle();

      if (error || !profile || profile.role !== 'customer') {
        setIsLoading(false);
        return;
      }

      setUser({
        id: supabaseId,
        email: email,
        name: profile.name || email.split('@')[0],
        role: profile.role,
        phone: profile.phone,
      });

      // Fetch orders and bookings from backend
      try {
        const ordersRes = await fetch(`${API_URL}/orders?email=${email}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const bookingsRes = await fetch(`${API_URL}/bookings?email=${email}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
        
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (err) {
        console.error('Failed to fetch orders/bookings:', err);
      }
    } catch (error) {
      console.error("Failed to fetch customer profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.access_token, session.user.id, session.user.email!);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      return { success: true, role: profile?.role };
    } catch (error) {
      console.error("Customer login failed:", error);
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If signup is successful, we might want to trigger a profile creation in our backend
      // But Supabase onAuthStateChange will handle the initial session setup
      return { success: true };
    } catch (error) {
      console.error("Customer signup failed:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        orders,
        bookings,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerAuthProvider");
  }
  return context;
}
