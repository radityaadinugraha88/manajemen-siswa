"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.name || session.user.email || "User",
          email: session.user.email || "",
        });
      } else {
        const storedDemo = typeof window !== "undefined" ? localStorage.getItem("demo_user") : null;
        if (storedDemo) {
          try {
            setUser(JSON.parse(storedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.name || session.user.email || "User",
          email: session.user.email || "",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (data?.user) {
        setUser({
          name: data.user.user_metadata?.name || data.user.email || "User",
          email: data.user.email || "",
        });
        if (typeof window !== "undefined") localStorage.removeItem("demo_user");
        setLoading(false);
        return true;
      }

      // Special fallback for Demo Account (admin@sekolah.com / admin123)
      if (cleanEmail === "admin@sekolah.com" && password === "admin123") {
        const signUpRes = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: "Admin Sekolah" },
          },
        });

        const demoUser = {
          name: signUpRes.data?.user?.user_metadata?.name || "Admin Sekolah",
          email: "admin@sekolah.com",
        };
        setUser(demoUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user", JSON.stringify(demoUser));
        }
        setLoading(false);
        return true;
      }

      if (error) {
        setLoading(false);
        throw new Error(error.message);
      }
    } catch (err: any) {
      if (cleanEmail === "admin@sekolah.com" && password === "admin123") {
        const demoUser = { name: "Admin Sekolah", email: "admin@sekolah.com" };
        setUser(demoUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user", JSON.stringify(demoUser));
        }
        setLoading(false);
        return true;
      }
      setLoading(false);
      throw err;
    }

    setLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (data.user) {
      setUser({
        name: data.user.user_metadata?.name || data.user.email || "User",
        email: data.user.email || "",
      });
      if (typeof window !== "undefined") localStorage.removeItem("demo_user");
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo_user");
    }
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
