import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "email" | "google" | "facebook";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("wanderlust_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: "1",
      name: email.split("@")[0],
      email,
      provider: "email",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
    };
    setUser(u);
    localStorage.setItem("wanderlust_user", JSON.stringify(u));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: "g1",
      name: "Google 使用者",
      email: "user@gmail.com",
      provider: "google",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=google`,
    };
    setUser(u);
    localStorage.setItem("wanderlust_user", JSON.stringify(u));
    setIsLoading(false);
  };

  const loginWithFacebook = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: "f1",
      name: "Facebook 使用者",
      email: "user@facebook.com",
      provider: "facebook",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=facebook`,
    };
    setUser(u);
    localStorage.setItem("wanderlust_user", JSON.stringify(u));
    setIsLoading(false);
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: "new1",
      name,
      email,
      provider: "email",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
    };
    setUser(u);
    localStorage.setItem("wanderlust_user", JSON.stringify(u));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wanderlust_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
