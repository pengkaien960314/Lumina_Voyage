/*
 * Design: Organic Naturalism — Milestones Page
 * - Travel milestone cards per region
 * - Shows visited places and achievements
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, MapPin, Star, Lock, CheckCircle, Globe, Mountain, Palmtree, Building2, Snowflake, TreePine, Compass } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MilestoneRegion {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  borderColor: string;
  image: string;
  totalSpots: number;
  visitedSpots: string[];
  allSpots: string[];
  achievements: { name: string; desc: string; unlocked: boolean }[];
}

const regions: MilestoneRegion[] = [
  {
    id: "hokkaido",
    name: "北海道",
    icon: <Snowflake className="w-6 h-6" />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/sjxMy1SHqrpv_20205869.jpg",
    totalSpots: 15,
    visitedSpots: ["小樽運河", "函館山夜景", "美瑛青池"],
    allSpots: ["小樽運河", "富良野薰衣草花田", "函館山夜景", "旭山動物園", "美瑛青池", "登別地獄谷", "二世古滑雪場", "札幌狸小路", "洞爺湖", "白色戀人公園", "層雲峽溫泉", "積丹半島", "星野度假村TOMAMU", "五稜郭公園", "支笏湖"],
    achievements: [
      { name: "北國初探", desc: "造訪北海道第一個景點", unlocked: true },
      { name: "粉雪獵人", desc: "在冬季造訪北海道", unlocked: true },
      { name: "花田漫步", desc: "造訪富良野薰衣草花田", unlocked: false },
      { name: "北海道達人", desc: "造訪北海道10個以上景點", unlocked: false },
    ],
  },
  {
    id: "kansai",
    name: "關西地區",
    icon: <Building2 className="w-6 h-6" />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp",
    totalSpots: 12,
    visitedSpots: ["伏見稻荷大社"],
    allSpots: ["伏見稻荷大社", "金閣寺", "清水寺", "嵐山竹林", "奈良公園", "大阪城", "道頓堀", "姬路城", "有馬溫泉", "天橋立", "神戶港", "高野山"],
    achievements: [
      { name: "千本鳥居", desc: "造訪伏見稻荷大社", unlocked: true },
      { name: "古都巡禮", desc: "造訪京都3個以上景點", unlocked: false },
      { name: "關西美食家", desc: "在大阪品嚐章魚燒和拉麵", unlocked: false },
      { name: "關西制霸", desc: "造訪關西10個以上景點", unlocked: false },
    ],
  },
  {
    id: "europe",
    name: "歐洲",
    icon: <Globe className="w-6 h-6" />,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp",
    totalSpots: 10,
    visitedSpots: ["聖托里尼"],
    allSpots: ["聖托里尼", "巴黎鐵塔", "羅馬競技場", "巴塞隆納聖家堂", "阿姆斯特丹運河", "布拉格老城", "維也納歌劇院", "瑞士少女峰", "冰島藍湖", "挪威峽灣"],
    achievements: [
      { name: "愛琴海之夢", desc: "造訪聖托里尼", unlocked: true },
      { name: "歐洲漫遊", desc: "造訪歐洲3個以上國家", unlocked: false },
      { name: "文藝復興", desc: "造訪歐洲5個文化景點", unlocked: false },
      { name: "歐洲達人", desc: "造訪歐洲8個以上景點", unlocked: false },
    ],
  },
  {
    id: "southeast-asia",
    name: "東南亞",
    icon: <Palmtree className="w-6 h-6" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp",
    totalSpots: 8,
    visitedSpots: ["烏布梯田"],
    allSpots: ["烏布梯田", "吳哥窟", "曼谷大皇宮", "長灘島", "下龍灣", "仙本那", "清邁古城", "新加坡濱海灣"],
    achievements: [
      { name: "熱帶天堂", desc: "造訪峇里島", unlocked: true },
      { name: "叢林探險家", desc: "造訪東南亞3個自然景點", unlocked: false },
      { name: "東南亞制霸", desc: "造訪東南亞6個以上景點", unlocked: false },
    ],
  },
  {
    id: "kanto",
    name: "關東地區",
    icon: <Building2 className="w-6 h-6" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/fK0QEKwLfLGJ_1ae98389.jpg",
    totalSpots: 10,
    visitedSpots: [],
    allSpots: ["東京鐵塔", "淺草寺", "澀谷十字路口", "明治神宮", "築地市場", "鎌倉大佛", "箱根溫泉", "日光東照宮", "富士山", "橫濱中華街"],
    achievements: [
      { name: "東京初體驗", desc: "造訪東京第一個景點", unlocked: false },
      { name: "富士山朝聖", desc: "造訪富士山", unlocked: false },
      { name: "關東達人", desc: "造訪關東8個以上景點", unlocked: false },
    ],
  },
  {
    id: "oceania",
    name: "大洋洲",
    icon: <Mountain className="w-6 h-6" />,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/wjGGKabeMPEH_11d64129.jpg",
    totalSpots: 6,
    visitedSpots: [],
    allSpots: ["雪梨歌劇院", "大堡礁", "紐西蘭皇后鎮", "烏魯魯", "墨爾本大洋路", "斐濟群島"],
    achievements: [
      { name: "南半球冒險", desc: "造訪大洋洲第一個景點", unlocked: false },
      { name: "大堡礁潛水", desc: "造訪大堡礁", unlocked: false },
      { name: "大洋洲探險家", desc: "造訪大洋洲4個以上景點", unlocked: false },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export default function Milestones() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const totalVisited = regions.reduce((sum, r) => sum + r.visitedSpots.length, 0);
  const totalSpots = regions.reduce((sum, r) => sum + r.totalSpots, 0);
  const totalAchievements = regions.reduce((sum, r) => sum + r.achievements.filter(a => a.unlocked).length, 0);
  const totalAchievementsAll = regions.reduce((sum, r) => sum + r.achievements.length, 0);

  const selected = regions.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>旅行里程碑</h1>
                <p className="text-muted-foreground">記錄你的旅行足跡與成就</p>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-card rounded-xl border border-border/50 text-center">
                <p className="text-2xl font-bold text-primary">{totalVisited}</p>
                <p className="text-xs text-muted-foreground">已造訪景點</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border/50 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalAchievements}</p>
                <p className="text-xs text-muted-foreground">已解鎖成就</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border/50 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{regions.filter(r => r.visitedSpots.length > 0).length}</p>
                <p className="text-xs text-muted-foreground">已探索地區</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">總進度</span>
                <span className="font-medium">{totalVisited}/{totalSpots} 景點</span>
              </div>
              <Progress value={(totalVisited / totalSpots) * 100} className="h-2" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container">
          {!selectedRegion ? (
            <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regions.map((region, i) => {
                const progress = (region.visitedSpots.length / region.totalSpots) * 100;
                const unlockedCount = region.achievements.filter(a => a.unlocked).length;
                return (
                  <motion.div
                    key={region.id}
                    variants={fadeUp}
                    custom={i}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className={`organic-card overflow-hidden bg-card border ${region.borderColor} group hover:shadow-lg transition-all duration-300`}>
                      <div className="relative h-40 overflow-hidden">
                        <img src={region.image} alt={region.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <div className={`w-10 h-10 rounded-xl ${region.bg} flex items-center justify-center backdrop-blur-sm`}>
                            <span className={region.color}>{region.icon}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <h3 className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>{region.name}</h3>
                          <p className="text-white/80 text-sm">{region.visitedSpots.length}/{region.totalSpots} 景點已造訪</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />{unlockedCount}/{region.achievements.length} 成就
                          </span>
                          <span className="text-primary font-medium">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : selected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Button variant="ghost" className="mb-6 gap-2" onClick={() => setSelectedRegion(null)}>
                <Compass className="w-4 h-4" />返回所有地區
              </Button>

              {/* Region Header */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-8">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${selected.bg} flex items-center justify-center`}>
                    <span className={selected.color}>{selected.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h2>
                    <p className="text-white/80 text-sm">{selected.visitedSpots.length}/{selected.totalSpots} 景點已造訪</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Trophy className="w-5 h-5 text-amber-500" />成就
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {selected.achievements.map((a) => (
                  <div key={a.name} className={`p-4 rounded-xl border ${a.unlocked ? `${selected.borderColor} ${selected.bg}` : "border-border/50 bg-muted/30"} flex items-start gap-3`}>
                    {a.unlocked ? (
                      <CheckCircle className={`w-5 h-5 mt-0.5 shrink-0 ${selected.color}`} />
                    ) : (
                      <Lock className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${a.unlocked ? "" : "text-muted-foreground"}`}>{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spots List */}
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <MapPin className="w-5 h-5 text-primary" />景點清單
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selected.allSpots.map((spot) => {
                  const visited = selected.visitedSpots.includes(spot);
                  return (
                    <div key={spot} className={`p-3 rounded-xl border flex items-center gap-3 ${visited ? `${selected.borderColor} ${selected.bg}` : "border-border/50 bg-card"}`}>
                      {visited ? (
                        <CheckCircle className={`w-4 h-4 shrink-0 ${selected.color}`} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={`text-sm ${visited ? "font-medium" : "text-muted-foreground"}`}>{spot}</span>
                      {visited && <Badge variant="outline" className="ml-auto text-xs rounded-full">已造訪</Badge>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
