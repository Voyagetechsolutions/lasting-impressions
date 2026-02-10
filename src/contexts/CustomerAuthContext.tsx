import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    const storedToken = localStorage.getItem("customer-token");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/customer-me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone,
        });
        setOrders(data.orders || []);
        setBookings(data.bookings || []);
      } else {
        localStorage.removeItem("customer-token");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch customer profile:", error);
      localStorage.removeItem("customer-token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/customer-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("customer-token", data.token);
        // Fetch full profile with orders/bookings
        fetchProfile(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (error) {
      console.error("Customer login failed:", error);
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/customer-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("customer-token", data.token);
        return { success: true };
      }
      return { success: false, error: data.error || "Signup failed" };
    } catch (error) {
      console.error("Customer signup failed:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrders([]);
    setBookings([]);
    localStorage.removeItem("customer-token");
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
