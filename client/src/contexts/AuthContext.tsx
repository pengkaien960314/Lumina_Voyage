import { nanoid } from "nanoid";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from "@/config";

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

// 解碼 Google JWT token 取得使用者資訊
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

// 初始化 Facebook SDK
function initFacebookSdk(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).FB) {
      resolve();
      return;
    }
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });
      resolve();
    };
    // 如果 SDK 已經載入但 fbAsyncInit 還沒被呼叫
    if (document.getElementById("facebook-jssdk")) {
      resolve();
    }
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lumina_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.linkedProviders) parsed.linkedProviders = [];
      if (!parsed.userId) parsed.userId = "LV" + nanoid(8);
      setUser(parsed);
    }
    setIsLoading(false);

    // 初始化 FB SDK
    initFacebookSdk().catch(() => {});
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
    userId: "LV" + nanoid(8),
    linkedProviders: overrides.linkedProviders || [],
  });

  const login = async (email: string, password: string) => {
    if (!password || password.length < 6) throw new Error("密碼不得少於6碼");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    persist(createUser({ name: email.split("@")[0], email, provider: "email", avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}` }));
    setIsLoading(false);
  };

  // ===== 真正的 Google 登入 =====
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new Error("Google SDK 尚未載入");
      }

      const tokenResponse = await new Promise<any>((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: (resp: any) => {
            if (resp.error) reject(new Error(resp.error));
            else resolve(resp);
          },
        });
        client.requestAccessToken();
      });

      // 用 access token 取得使用者資訊
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const profile = await res.json();

      persist(createUser({
        id: `g_${profile.sub}`,
        name: profile.name || profile.email,
        email: profile.email,
        provider: "google",
        avatar: profile.picture || undefined,
        linkedProviders: [{ provider: "google", email: profile.email, linkedAt: new Date().toISOString() }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ===== 真正的 Facebook 登入 =====
  const loginWithFacebook = async () => {
    setIsLoading(true);
    try {
      await initFacebookSdk();
      const FB = (window as any).FB;
      if (!FB) throw new Error("Facebook SDK 尚未載入");

      const authResponse = await new Promise<any>((resolve, reject) => {
        FB.login((response: any) => {
          if (response.authResponse) resolve(response.authResponse);
          else reject(new Error("Facebook 登入被取消"));
        }, { scope: "public_profile,email" });
      });

      const profile = await new Promise<any>((resolve, reject) => {
        FB.api("/me", { fields: "id,name,email,picture.width(200)" }, (response: any) => {
          if (response.error) reject(new Error(response.error.message));
          else resolve(response);
        });
      });

      persist(createUser({
        id: `f_${profile.id}`,
        name: profile.name,
        email: profile.email || `${profile.id}@facebook.com`,
        provider: "facebook",
        avatar: profile.picture?.data?.url || undefined,
        linkedProviders: [{ provider: "facebook", email: profile.email, linkedAt: new Date().toISOString() }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Apple / LINE / Twitter 保持模擬（需要後端才能實作完整 OAuth）
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

  const register = async (name: string, email: string, password: string) => {
    if (!password || password.length < 6) throw new Error("密碼不得少於6碼");
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
