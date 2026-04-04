import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface LinkedProvider {
  provider: "google" | "facebook" | "apple" | "line" | "twitter";
  email?: string;
  linkedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "email" | "google" | "facebook" | "apple" | "line" | "twitter";
  phone?: string;
  userId?: string;
  linkedProviders: LinkedProvider[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithLine: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  updatePhone: (phone: string) => void;
  linkProvider: (p: LinkedProvider) => void;
  unlinkProvider: (provider: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lumina_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.linkedProviders) parsed.linkedProviders = [];
      if (!parsed.userId) parsed.userId = "WL" + Math.floor(1000 + Math.random() * 9000);
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem("lumina_user", JSON.stringify(u));
  }, []);

  const createUser = (overrides: Partial<User>): User => ({
    id: overrides.id || `u${Date.now()}`,
    name: overrides.name || "旅行者",
    email: overrides.email || "user@luminavoyage.com",
    provider: overrides.provider || "email",
    avatar: overrides.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${Date.now()}`,
    phone: overrides.phone || "",
    userId: "WL" + Math.floor(1000 + Math.random() * 9000),
    linkedProviders: overrides.linkedProviders || [],
  });

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ name: email.split("@")[0], email, provider: "email", avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}` }));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ id: "g1", name: "Google 使用者", email: "user@gmail.com", provider: "google", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=google", linkedProviders: [{ provider: "google", email: "user@gmail.com", linkedAt: new Date().toISOString() }] }));
    setIsLoading(false);
  };

  const loginWithFacebook = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ id: "f1", name: "Facebook 使用者", email: "user@facebook.com", provider: "facebook", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=facebook", linkedProviders: [{ provider: "facebook", email: "user@facebook.com", linkedAt: new Date().toISOString() }] }));
    setIsLoading(false);
  };

  const loginWithApple = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ id: "a1", name: "Apple 使用者", email: "user@icloud.com", provider: "apple", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=apple", linkedProviders: [{ provider: "apple", email: "user@icloud.com", linkedAt: new Date().toISOString() }] }));
    setIsLoading(false);
  };

  const loginWithLine = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ id: "l1", name: "LINE 使用者", email: "user@line.me", provider: "line", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=line", linkedProviders: [{ provider: "line", email: "user@line.me", linkedAt: new Date().toISOString() }] }));
    setIsLoading(false);
  };

  const loginWithTwitter = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ id: "t1", name: "X 使用者", email: "user@x.com", provider: "twitter", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=twitter", linkedProviders: [{ provider: "twitter", email: "user@x.com", linkedAt: new Date().toISOString() }] }));
    setIsLoading(false);
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ name, email, provider: "email", avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}` }));
    setIsLoading(false);
  };

  const logout = () => { setUser(null); localStorage.removeItem("lumina_user"); };

  const updateName = (name: string) => { if (user) persist({ ...user, name }); };
  const updateAvatar = (avatar: string) => { if (user) persist({ ...user, avatar }); };
  const updatePhone = (phone: string) => { if (user) persist({ ...user, phone }); };

  const linkProvider = (p: LinkedProvider) => {
    if (user) {
      const existing = user.linkedProviders.filter((lp) => lp.provider !== p.provider);
      persist({ ...user, linkedProviders: [...existing, p] });
    }
  };

  const unlinkProvider = (provider: string) => {
    if (user) persist({ ...user, linkedProviders: user.linkedProviders.filter((lp) => lp.provider !== provider) });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, loginWithFacebook, loginWithApple, loginWithLine, loginWithTwitter, register, logout, updateName, updateAvatar, updatePhone, linkProvider, unlinkProvider, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
