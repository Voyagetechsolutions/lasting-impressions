import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsLoading(false);
                return;
            }

            setToken(session.access_token);
            fetchUser(session.access_token, session.user.id, session.user.email!);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setToken(session.access_token);
                fetchUser(session.access_token, session.user.id, session.user.email!);
            } else {
                setUser(null);
                setToken(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUser = async (authToken: string, supabaseId: string, email: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role, name')
                .eq('id', supabaseId)
                .maybeSingle();

            if (error || !profile || profile.role !== 'admin') {
                setIsLoading(false);
                return;
            }

            setUser({
                id: supabaseId,
                email: email,
                name: profile.name || email.split('@')[0],
                role: profile.role,
            });
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login failed:", error.message);
                return { success: false };
            }

            // Check role from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .maybeSingle();

            return { success: true, role: profile?.role };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
