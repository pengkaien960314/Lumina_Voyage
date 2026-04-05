/*
 * BottomNav — 手機底部 Tab Bar
 * 取代首頁右上角折疊式漢堡選單
 * 僅在 lg 以下顯示（lg+ 使用原本頂部 Navbar）
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Compass, Map, BookOpen, PenLine, Wrench, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // 底部 Tab 只放最核心的 5 項，其餘收進「我的」
  const tabs = [
    { path: "/",        label: t("nav.home"),    icon: Compass  },
    { path: "/spots",   label: t("nav.spots"),   icon: Map      },
    { path: "/planner", label: t("nav.planner"), icon: BookOpen },
    { path: "/diary",   label: t("nav.diary"),   icon: PenLine  },
    { path: "/tools",   label: t("nav.tools"),   icon: Wrench   },
  ];

  // 登入後最後一個 tab 改為頭像／個人頁面
  const profileTab = {
    path: "/profile",
    label: t("nav.profile"),
    icon: User,
  };

  const allTabs = isAuthenticated ? [...tabs, profileTab] : [...tabs, { path: "/login", label: t("nav.login"), icon: User }];

  // 不在登入頁顯示底部 Tab（登入頁有自己的全屏 layout）
  if (location === "/login" || location === "/forgot-password") return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {allTabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;

          return (
            <Link key={tab.path} href={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 cursor-pointer"
              >
                {/* 頭像 tab（個人頁面，已登入時） */}
                {tab.path === "/profile" && isAuthenticated ? (
                  <div
                    className={`rounded-full transition-all duration-200 ${
                      isActive ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {/* 選中時底部指示點 */}
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                )}
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
