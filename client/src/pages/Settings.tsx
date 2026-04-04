/*
 * Design: Organic Naturalism — Settings Page
 * - Dark mode toggle
 * - Language, notification, privacy settings
 */
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Palette, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("zh-TW");
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                設定
              </h1>
            </div>
            <p className="text-muted-foreground">
              自訂你的 Wanderlust 使用體驗
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-2xl space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Palette className="w-5 h-5 text-primary" />
                  外觀設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      {theme === "dark" ? (
                        <Moon className="w-5 h-5 text-primary" />
                      ) : (
                        <Sun className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <Label className="font-medium">深色模式</Label>
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

                {/* Theme Preview */}
                <div>
                  <Label className="font-medium mb-3 block">主題預覽</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { if (theme === "dark") toggleTheme?.(); }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === "light" ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-[#F7F5F0] mb-2 flex items-end p-2">
                        <div className="flex gap-1">
                          <div className="w-6 h-3 rounded bg-[#8B7355]" />
                          <div className="w-8 h-3 rounded bg-[#6B8F71]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        <span className="text-sm font-medium">淺色</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { if (theme === "light") toggleTheme?.(); }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === "dark" ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-[#1A1A18] mb-2 flex items-end p-2">
                        <div className="flex gap-1">
                          <div className="w-6 h-3 rounded bg-[#D4A574]" />
                          <div className="w-8 h-3 rounded bg-[#6B8F71]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        <span className="text-sm font-medium">深色</span>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Globe className="w-5 h-5 text-primary" />
                  語言與地區
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">介面語言</Label>
                    <p className="text-xs text-muted-foreground">選擇應用程式的顯示語言</p>
                  </div>
                  <Select value={language} onValueChange={(v) => { setLanguage(v); toast.success("語言已更新"); }}>
                    <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="zh-CN">簡體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  <Bell className="w-5 h-5 text-primary" />
                  通知設定
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
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
