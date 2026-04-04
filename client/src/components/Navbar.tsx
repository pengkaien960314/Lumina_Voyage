/*
 * Design: Organic Naturalism
 * - Glass morphism navbar with subtle earth-tone accents
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Compass, Map, BookOpen, Hotel, Plane, Languages, Settings, LogOut, User, Menu, X, Leaf, CalendarCheck, Users, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/", label: "首頁", icon: Compass },
  { path: "/spots", label: "景點", icon: Map },
  { path: "/planner", label: "行程", icon: BookOpen },
  { path: "/diary", label: "日記", icon: BookOpen },
  { path: "/hotels", label: "旅館", icon: Hotel },
  { path: "/flights", label: "機票", icon: Plane },
  { path: "/tools", label: "工具", icon: Languages },
];

const aiItems = [
  { path: "/ai-planner", label: "AI 行程", icon: Sparkles },
  { path: "/ai-translate", label: "AI 翻譯", icon: Languages },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="glass-panel border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Lumina Voyage</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <span className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} style={{ fontFamily: "var(--font-sans)" }}>
                    <Icon className="w-4 h-4" />{item.label}
                  </span>
                </Link>
              );
            })}
            {/* AI Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${location.startsWith("/ai-") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} style={{ fontFamily: "var(--font-sans)" }}>
                  <Sparkles className="w-4 h-4" />AI
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                {aiItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <DropdownMenuItem>
                        <Icon className="mr-2 h-4 w-4" />{item.label}
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem><User className="mr-2 h-4 w-4" />個人資料</DropdownMenuItem></Link>
                  <Link href="/friends"><DropdownMenuItem><Users className="mr-2 h-4 w-4" />好友</DropdownMenuItem></Link>
                  <Link href="/my-bookings"><DropdownMenuItem><CalendarCheck className="mr-2 h-4 w-4" />我的預訂</DropdownMenuItem></Link>
                  <Link href="/settings"><DropdownMenuItem><Settings className="mr-2 h-4 w-4" />設定</DropdownMenuItem></Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />登出</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="rounded-full px-5" style={{ fontFamily: "var(--font-sans)" }}>登入</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="lg:hidden glass-panel border-b border-border/50">
            <div className="container py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <span onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} style={{ fontFamily: "var(--font-sans)" }}>
                      <Icon className="w-5 h-5" />{item.label}
                    </span>
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-border/30">
                <p className="px-4 py-1 text-xs text-muted-foreground font-medium">AI 功能</p>
                {aiItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <span onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} style={{ fontFamily: "var(--font-sans)" }}>
                        <Icon className="w-5 h-5" />{item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
