/*
 * Design: Organic Naturalism — Settings Page
 * - Dark mode toggle with preview
 * - Multi-language support (10 languages)
 * - Notification & privacy settings
 */
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Palette, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t, languages } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {t("settings.title")}
              </h1>
            </div>
            <p className="text-muted-foreground">
              自訂你的 Lumina Voyage 使用體驗
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-2xl space-y-6">
          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Palette className="w-5 h-5 text-primary" />
                  {t("settings.theme")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <Label className="font-medium">{t("settings.dark")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {theme === "dark" ? "目前使用深色主題" : "目前使用淺色主題"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={() => {
                      toggleTheme?.();
                      toast.success(theme === "dark" ? "已切換為淺色模式" : "已切換為深色模式");
                    }}
                  />
                </div>

                <Separator />

                {/* Theme Preview - Liquid Glass Style */}
                <div>
                  <Label className="font-medium mb-3 block">主題預覽</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { if (theme === "dark") toggleTheme?.(); }}
                      className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${theme === "light" ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"}`}
                    >
                      {/* Glass effect background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-amber-50/40 to-emerald-50/30 backdrop-blur-xl" />
                      <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-amber-200/30 blur-2xl -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-emerald-200/30 blur-2xl translate-x-1/3 translate-y-1/3" />
                      <div className="relative">
                        <div className="w-full h-24 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-inner mb-3 flex items-end p-3">
                          <div className="flex gap-1.5">
                            <div className="w-7 h-3.5 rounded-full bg-[#8B7355]/60 backdrop-blur-sm" />
                            <div className="w-9 h-3.5 rounded-full bg-[#6B8F71]/60 backdrop-blur-sm" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("settings.light")}</span>
                        </div>
                        {theme === "light" && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                      </div>
                    </button>
                    <button
                      onClick={() => { if (theme === "light") toggleTheme?.(); }}
                      className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${theme === "dark" ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"}`}
                    >
                      {/* Glass effect background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl" />
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-violet-500/10 blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-sky-500/10 blur-2xl" />
                      <div className="relative">
                        <div className="w-full h-24 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner mb-3 flex items-end p-3">
                          <div className="flex gap-1.5">
                            <div className="w-7 h-3.5 rounded-full bg-[#D4A574]/50 backdrop-blur-sm" />
                            <div className="w-9 h-3.5 rounded-full bg-[#6B8F71]/50 backdrop-blur-sm" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Moon className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("settings.dark")}</span>
                        </div>
                        {theme === "dark" && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Globe className="w-5 h-5 text-primary" />
                  {t("settings.language")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">選擇應用程式的顯示語言</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); toast.success(`語言已切換為 ${l.nativeName}`); }}
                      className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                        lang === l.code
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-accent/30"
                      }`}
                    >
                      {lang === l.code && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                      <p className="font-medium text-sm">{l.nativeName}</p>
                      {l.name !== l.nativeName && (
                        <p className="text-xs text-muted-foreground">{l.name}</p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Bell className="w-5 h-5 text-primary" />
                  {t("settings.notifications") || "通知設定"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">推播通知</Label>
                    <p className="text-xs text-muted-foreground">接收行程提醒與優惠通知</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">電子郵件通知</Label>
                    <p className="text-xs text-muted-foreground">接收電子郵件更新</p>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Shield className="w-5 h-5 text-primary" />
                  隱私與安全
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">位置存取</Label>
                    <p className="text-xs text-muted-foreground">允許應用程式存取你的位置</p>
                  </div>
                  <Switch checked={locationAccess} onCheckedChange={setLocationAccess} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">使用分析</Label>
                    <p className="text-xs text-muted-foreground">協助我們改善產品體驗</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
