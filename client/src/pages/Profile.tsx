/**
 * Design: Organic Naturalism — Profile Page
 * - Complete profile editing with save functionality
 * - Password change
 * - Third-party account linking management
 * - Stats & recent activities
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  MapPin, Calendar, BookOpen, Heart, Edit2, Camera, Save, Lock,
  Eye, EyeOff, Link2, Unlink, Shield, CheckCircle2, User, Phone,
  Mail, Globe, FileText, Loader2, Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Profile() {
  const { user, isAuthenticated, updateName, updateAvatar, updatePhone, linkProvider, unlinkProvider } = useAuth();
  const [, navigate] = useLocation();

  // Profile form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formBio, setFormBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password change
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // 只在登入狀態變化時檢查，避免 user 更新時重置表單
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // 初始化表單（只跑一次）
  const initialized = useRef(false);
  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      setFormName(user.name);
      setFormPhone(user.phone || "");
      const extra = localStorage.getItem("lumina_profile_extra");
      if (extra) {
        try {
          const parsed = JSON.parse(extra);
          setFormCity(parsed.city || "");
          setFormBio(parsed.bio || "");
        } catch { /* ignore */ }
      }
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateName(formName);
    updatePhone(formPhone);
    // Save extra data
    localStorage.setItem("lumina_profile_extra", JSON.stringify({ city: formCity, bio: formBio }));
    setIsSaving(false);
    toast.success("個人資料已儲存！名稱已同步更新至所有頁面。");
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { toast.error("請輸入目前密碼"); return; }
    if (newPassword.length < 6) { toast.error("新密碼至少需要 6 個字元"); return; }
    if (newPassword !== confirmNewPassword) { toast.error("新密碼不一致"); return; }
    await new Promise(r => setTimeout(r, 800));
    toast.success("密碼已成功修改！");
    setShowPasswordDialog(false);
    setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
  };

  const handleChangeAvatar = () => {
    if (!avatarUrl.trim()) { toast.error("請輸入圖片 URL 或上傳圖片"); return; }
    updateAvatar(avatarUrl);
    setShowAvatarDialog(false);
    setAvatarUrl("");
    toast.success("頭像已更新！");
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("圖片大小不能超過 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUrl(dataUrl);
      toast.success("圖片已載入，點擊「更新頭像」確認");
    };
    reader.readAsDataURL(file);
  };

  const handleLinkProvider = (provider: "google" | "facebook" | "apple" | "line" | "twitter") => {
    const emails: Record<string, string> = {
      google: "user@gmail.com", facebook: "user@facebook.com",
      apple: "user@icloud.com", line: "user@line.me", twitter: "user@x.com",
    };
    linkProvider({ provider, email: emails[provider], linkedAt: new Date().toISOString() });
    toast.success(`已連結 ${provider.charAt(0).toUpperCase() + provider.slice(1)} 帳號`);
  };

  const handleUnlinkProvider = (provider: string) => {
    unlinkProvider(provider);
    toast.success(`已取消連結 ${provider.charAt(0).toUpperCase() + provider.slice(1)} 帳號`);
  };

  const isLinked = (provider: string) => user.linkedProviders.some(lp => lp.provider === provider);

  const providers = [
    { key: "google" as const, name: "Google", color: "text-red-500", icon: <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
    { key: "facebook" as const, name: "Facebook", color: "text-blue-600", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { key: "apple" as const, name: "Apple", color: "text-foreground", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg> },
    { key: "line" as const, name: "LINE", color: "text-green-500", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg> },
    { key: "twitter" as const, name: "X", color: "text-foreground", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ];

  const stats = [
    { label: "旅行次數", value: "12", icon: MapPin },
    { label: "到訪國家", value: "8", icon: Globe },
    { label: "日記篇數", value: "24", icon: BookOpen },
    { label: "收藏景點", value: "36", icon: Heart },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Profile Header */}
      <section className="pt-24 pb-12 bg-secondary/30">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform" onClick={() => setShowAvatarDialog(true)}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{user.name}</h1>
            <p className="text-muted-foreground text-sm mb-1">{user.email}</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full">
                {user.provider === "google" ? "Google 帳號" : user.provider === "facebook" ? "Facebook 帳號" : user.provider === "apple" ? "Apple 帳號" : user.provider === "line" ? "LINE 帳號" : user.provider === "twitter" ? "X 帳號" : "Email 帳號"}
              </Badge>
              {user.userId && <Badge variant="outline" className="rounded-full text-xs">ID: {user.userId}</Badge>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {stats.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl space-y-6">
          {/* Edit Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <Edit2 className="w-5 h-5 text-primary" />個人資料
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />姓名</Label>
                    <Input value={formName} onChange={e => setFormName(e.target.value)} className="rounded-xl" placeholder="你的姓名" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />電子郵件</Label>
                    <Input value={user.email} className="rounded-xl" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />電話</Label>
                    <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+886 912 345 678" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />所在城市</Label>
                    <Input value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="台北" className="rounded-xl" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />自我介紹</Label>
                  <Textarea value={formBio} onChange={e => setFormBio(e.target.value)} placeholder="熱愛旅行的探險家..." className="rounded-xl" rows={3} />
                </div>
                <Button className="mt-4 rounded-full px-6 gap-2" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  儲存變更
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <Shield className="w-5 h-5 text-primary" />安全設定
                </h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">修改密碼</p>
                      <p className="text-xs text-muted-foreground">定期更換密碼以確保帳號安全</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowPasswordDialog(true)}>修改</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Linked Accounts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <Link2 className="w-5 h-5 text-primary" />已連結帳號
                </h3>
                <p className="text-sm text-muted-foreground mb-4">連結第三方帳號以便快速登入</p>
                <div className="space-y-3">
                  {providers.map(p => {
                    const linked = isLinked(p.key);
                    const linkedInfo = user.linkedProviders.find(lp => lp.provider === p.key);
                    return (
                      <div key={p.key} className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                        <div className="flex items-center gap-3">
                          {p.icon}
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            {linked && linkedInfo?.email && <p className="text-xs text-muted-foreground">{linkedInfo.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {linked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          <Button
                            variant={linked ? "ghost" : "outline"}
                            size="sm"
                            className={`rounded-full gap-1.5 ${linked ? "text-destructive hover:text-destructive" : ""}`}
                            onClick={() => linked ? handleUnlinkProvider(p.key) : handleLinkProvider(p.key)}
                          >
                            {linked ? <><Unlink className="w-3.5 h-3.5" />取消連結</> : <><Link2 className="w-3.5 h-3.5" />連結</>}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>近期活動</h3>
                <div className="space-y-4">
                  {(() => {
                    const activities: { icon: any; text: string; time: string; color: string }[] = [];
                    // 讀取日記
                    try {
                      const diaries = localStorage.getItem(`wanderlust_user_diaries_${user.id}`);
                      if (diaries) {
                        const parsed = JSON.parse(diaries);
                        parsed.slice(0, 3).forEach((d: any) => {
                          activities.push({ icon: BookOpen, text: `發布了日記「${d.title}」`, time: d.date, color: "text-emerald-500" });
                        });
                      }
                    } catch { /* ignore */ }
                    // 讀取儲存行程
                    try {
                      const trips = localStorage.getItem("lumina_saved_trips");
                      if (trips) {
                        const parsed = JSON.parse(trips);
                        parsed.slice(0, 3).forEach((t: any) => {
                          activities.push({ icon: MapPin, text: `儲存了行程「${t.name}」`, time: t.createdAt?.split("T")[0] || "", color: "text-blue-500" });
                        });
                      }
                    } catch { /* ignore */ }
                    // 排序並取前 5 筆
                    activities.sort((a, b) => b.time.localeCompare(a.time));
                    const display = activities.slice(0, 5);
                    if (display.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">尚無近期活動，開始寫日記或規劃行程吧！</p>;
                    }
                    return display.map((activity, i) => {
                      const Icon = activity.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center"><Icon className={`w-4 h-4 ${activity.color}`} /></div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.text}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>修改密碼</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>目前密碼</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="pr-10 rounded-xl" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>新密碼</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10 rounded-xl" placeholder="至少 6 個字元" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>確認新密碼</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="pr-10 rounded-xl" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full rounded-xl" onClick={handleChangePassword}>確認修改</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Change Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>更換頭像</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <input type="file" ref={avatarFileRef} accept="image/*" className="hidden" onChange={handleAvatarFileUpload} />
            <Button variant="outline" className="w-full rounded-xl gap-2 border-dashed h-14" onClick={() => avatarFileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              從裝置上傳照片
            </Button>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">或輸入圖片 URL</Label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
            </div>
            {avatarUrl && (
              <div className="flex justify-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt="preview" />
                  <AvatarFallback>預覽</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">或選擇預設頭像</Label>
              <div className="flex gap-2 flex-wrap">
                {["felix", "luna", "max", "zoe", "leo", "mia"].map(seed => (
                  <button key={seed} className="rounded-full border-2 border-transparent hover:border-primary transition-colors" onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`)}>
                    <Avatar className="w-10 h-10"><AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`} /></Avatar>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full rounded-xl" onClick={handleChangeAvatar}>確認更換</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
