/*
 * BottomNav — 手機底部 Tab Bar
 * 整合：景點+行程 → 探索 | 飯店+機票 → 訂購
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Compass, Map, Plane, PenLine, Wrench, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const tabs = [
    { path: "/",        label: t("nav.home"),    icon: Compass },
    { path: "/spots",   label: "探索",            icon: Map     },
    { path: "/hotels",  label: "訂購",            icon: Plane   },
    { path: "/diary",   label: t("nav.diary"),   icon: PenLine },
    { path: "/tools",   label: t("nav.tools"),   icon: Wrench  },
  ];

  const profileTab = {
    path: "/profile",
    label: t("nav.profile"),
    icon: User,
  };

  const allTabs = isAuthenticated ? [...tabs, profileTab] : tabs;

  const isTabActive = (tabPath: string) => {
    if (tabPath === "/spots") return location === "/spots" || location === "/planner";
    if (tabPath === "/hotels") return location === "/hotels" || location === "/flights";
    return location === tabPath;
  };

  if (location === "/login" || location === "/forgot-password") return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {allTabs.map((tab) => {
          const isActive = isTabActive(tab.path);
          const Icon = tab.icon;

          return (
            <Link key={tab.path} href={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 cursor-pointer"
              >
                {tab.path === "/profile" && isAuthenticated ? (
                  <div className={`rounded-full transition-all duration-200 ${isActive ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
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
                  className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
