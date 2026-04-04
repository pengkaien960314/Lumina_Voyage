/*
 * Design: Organic Naturalism — Profile Page
 * - User profile card
 * - Stats, recent activities
 */
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, BookOpen, Heart, Settings, Edit2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const stats = [
    { label: "旅行次數", value: "12" },
    { label: "到訪國家", value: "8" },
    { label: "日記篇數", value: "24" },
    { label: "收藏景點", value: "36" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Profile Header */}
      <section className="pt-24 pb-12 bg-secondary/30">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                onClick={() => toast.info("頭像上傳功能開發中")}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {user.name}
            </h1>
            <p className="text-muted-foreground text-sm mb-1">{user.email}</p>
            <Badge variant="outline" className="rounded-full">
              {user.provider === "google" ? "Google 帳號" : user.provider === "facebook" ? "Facebook 帳號" : "Email 帳號"}
            </Badge>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl space-y-6">
          {/* Edit Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <Edit2 className="w-5 h-5 text-primary" />
                  個人資料
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>姓名</Label>
                    <Input defaultValue={user.name} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>電子郵件</Label>
                    <Input defaultValue={user.email} className="rounded-xl" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>電話</Label>
                    <Input placeholder="+886 912 345 678" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>所在城市</Label>
                    <Input placeholder="台北" className="rounded-xl" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>自我介紹</Label>
                  <Input placeholder="熱愛旅行的探險家..." className="rounded-xl" />
                </div>
                <Button
                  className="mt-4 rounded-full px-6"
                  onClick={() => toast.success("個人資料已更新")}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  儲存變更
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  近期活動
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: BookOpen, text: "發布了日記「京都的秋日私語」", time: "2 天前", color: "text-emerald-500" },
                    { icon: Heart, text: "收藏了「聖托里尼・伊亞小鎮」", time: "3 天前", color: "text-red-500" },
                    { icon: MapPin, text: "規劃了「東京五日遊」行程", time: "5 天前", color: "text-blue-500" },
                    { icon: Calendar, text: "預訂了「京都嵐山翠嵐酒店」", time: "1 週前", color: "text-amber-500" },
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
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
