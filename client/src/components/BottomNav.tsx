/*
 * BottomNav — 浮動橢圓形玻璃 Tab Bar
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
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
    >
      <nav className="pointer-events-auto bottom-nav-pill w-full max-w-md">
        <div className="flex items-center justify-around h-[60px] px-2">
          {allTabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            const Icon = tab.icon;

            return (
              <Link key={tab.path} href={tab.path}>
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-full cursor-pointer transition-all duration-300 ${
                    isActive ? "bg-white/20 dark:bg-white/10" : ""
                  }`}
                >
                  {tab.path === "/profile" && isAuthenticated ? (
                    <div className={`rounded-full transition-all duration-200 ${isActive ? "ring-2 ring-white/50 ring-offset-1 ring-offset-transparent" : ""}`}>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-white/20 text-foreground text-[8px]">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 ${
                        isActive ? "text-primary scale-110" : "text-muted-foreground"
                      }`}
                    />
                  )}
                  <span
                    className={`text-[9px] font-semibold leading-none transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {tab.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="pill-indicator"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
