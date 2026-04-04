import { motion } from "framer-motion";
import { Leaf, Globe, Heart, Shield, Users, Award, MapPin, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const team = [
  { name: "林雅琪", role: "創辦人 & CEO", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=yaqi", desc: "熱愛旅行的資管系學生，走過 20 個國家" },
  { name: "陳柏翰", role: "技術長 CTO", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bohan", desc: "全端工程師，專注於打造優質使用者體驗" },
  { name: "王思涵", role: "設計總監", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sihan", desc: "UI/UX 設計師，用設計讓旅行更美好" },
  { name: "張宇軒", role: "產品經理", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=yuxuan", desc: "深耕旅遊產業，了解旅行者的每一個需求" },
];

const values = [
  { icon: Globe, title: "探索無界", desc: "我們相信旅行不應有邊界，每個人都值得擁有一段精彩的旅程。" },
  { icon: Heart, title: "用心服務", desc: "從行程規劃到旅途記錄，我們用心打造每一個功能細節。" },
  { icon: Shield, title: "安全可靠", desc: "您的資料安全是我們的首要任務，採用最高等級的加密保護。" },
  { icon: Users, title: "社群連結", desc: "透過旅遊日記與好友系統，讓旅行的感動可以被分享。" },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero */}
      <section className="pt-24 pb-16 bg-secondary/30 watercolor-wash">
        <div className="container text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>關於 Lumina Voyage</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Lumina Voyage 是一個由資管系學生團隊打造的旅行探索平台。我們的使命是讓每一次旅行都成為生命中最美好的篇章，從規劃到出發，從探索到記錄，陪伴你走過每一段旅途。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ num: "50,000+", label: "活躍用戶" }, { num: "120+", label: "覆蓋國家" }, { num: "10,000+", label: "旅遊日記" }, { num: "4.9", label: "用戶評分" }].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.num}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>我們的核心價值</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50 h-full text-center organic-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <v.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-secondary/20">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>團隊成員</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50 text-center organic-card">
                  <CardContent className="p-6">
                    <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full mx-auto mb-4 bg-secondary" loading="lazy" />
                    <h3 className="font-bold">{t.name}</h3>
                    <p className="text-sm text-primary mb-2">{t.role}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>聯絡我們</h2>
          <p className="text-muted-foreground mb-6">有任何問題或建議？歡迎與我們聯繫</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />台灣台北市大安區</span>
            <span className="flex items-center gap-2"><Compass className="w-4 h-4" />contact@luminavoyage.app</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
