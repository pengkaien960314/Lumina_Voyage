/*
 * BottomNav — 手機底部 Tab Bar
 * 僅在 lg 以下顯示（lg+ 使用原本頂部 Navbar）
 */
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Map, BookOpen, PenLine, Wrench } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { path: "/",        label: t("nav.home"),    icon: Compass  },
    { path: "/spots",   label: t("nav.spots"),   icon: Map      },
    { path: "/planner", label: t("nav.planner"), icon: BookOpen },
    { path: "/diary",   label: t("nav.diary"),   icon: PenLine  },
    { path: "/tools",   label: t("nav.tools"),   icon: Wrench   },
  ];

  if (location === "/login" || location === "/forgot-password") return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;

          return (
            <Link key={tab.path} href={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 cursor-pointer"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
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
