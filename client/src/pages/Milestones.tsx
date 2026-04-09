/*
 * Complete Milestone System
 * - Dynamic data from localStorage (trips, diaries, bookings)
 * - Unlockable achievements
 * - Manual spot check-in
 * - Level & XP system
 * - Regional progress tracking
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/contexts/FriendContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Trophy, MapPin, Star, Lock, CheckCircle, Globe, Mountain, Building2,
  Snowflake, Compass, Flame, Heart, BookOpen, Plane, Camera, Users,
  Award, Zap, Target, ChevronLeft, Plus, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ===== Regions & Spots =====
interface Region {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  spots: string[];
}

const regions: Region[] = [
  { id: "hokkaido", name: "北海道", icon: Snowflake, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30",
    spots: ["小樽運河", "富良野薰衣草", "函館山夜景", "旭山動物園", "美瑛青池", "登別地獄谷", "二世古滑雪場", "札幌狸小路", "洞爺湖", "白色戀人公園", "層雲峽溫泉", "積丹半島", "星野TOMAMU", "五稜郭公園", "支笏湖"] },
  { id: "kanto", name: "關東", icon: Building2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30",
    spots: ["東京鐵塔", "淺草寺", "晴空塔", "秋葉原", "澀谷十字路口", "新宿御苑", "鎌倉大佛", "箱根溫泉", "河口湖", "迪士尼海洋", "明治神宮", "築地市場"] },
  { id: "kansai", name: "關西", icon: Mountain, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30",
    spots: ["伏見稻荷大社", "金閣寺", "清水寺", "嵐山竹林", "奈良公園", "大阪城", "道頓堀", "姬路城", "有馬溫泉", "神戶港", "高野山", "天橋立"] },
  { id: "southeast_asia", name: "東南亞", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30",
    spots: ["峇里島烏布", "長灘島", "吳哥窟", "曼谷大皇宮", "新加坡濱海灣", "河內老城區", "清邁古城", "普吉島", "宿霧鯨鯊", "仙本那"] },
  { id: "europe", name: "歐洲", icon: Compass, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30",
    spots: ["艾菲爾鐵塔", "大英博物館", "聖托里尼", "羅馬競技場", "巴塞隆納聖家堂", "阿姆斯特丹", "布拉格", "瑞士少女峰", "維也納", "冰島藍湖"] },
  { id: "taiwan", name: "台灣", icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30",
    spots: ["九份老街", "日月潭", "阿里山", "太魯閣", "墾丁", "台北101", "淡水老街", "花蓮", "綠島", "蘭嶼", "合歡山", "高美濕地"] },
];

// ===== Achievements =====
interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  condition: (stats: UserStats) => boolean;
  xp: number;
}

interface UserStats {
  visited: number;
  diaries: number;
  trips: number;
  friends: number;
  regions: number;
  bookmarks: number;
}

const achievements: Achievement[] = [
  { id: "first_step", name: "踏出第一步", desc: "標記第一個造訪景點", icon: Compass, color: "text-emerald-500", condition: s => s.visited >= 1, xp: 50 },
  { id: "explorer_5", name: "初級探索者", desc: "造訪 5 個景點", icon: MapPin, color: "text-blue-500", condition: s => s.visited >= 5, xp: 100 },
  { id: "explorer_15", name: "資深旅人", desc: "造訪 15 個景點", icon: Globe, color: "text-violet-500", condition: s => s.visited >= 15, xp: 250 },
  { id: "explorer_30", name: "環球達人", desc: "造訪 30 個景點", icon: Award, color: "text-amber-500", condition: s => s.visited >= 30, xp: 500 },
  { id: "writer_1", name: "旅行作家", desc: "撰寫第一篇日記", icon: BookOpen, color: "text-teal-500", condition: s => s.diaries >= 1, xp: 50 },
  { id: "writer_5", name: "文字旅人", desc: "撰寫 5 篇日記", icon: BookOpen, color: "text-teal-600", condition: s => s.diaries >= 5, xp: 150 },
  { id: "planner_1", name: "行程規劃師", desc: "儲存第一個行程", icon: Target, color: "text-orange-500", condition: s => s.trips >= 1, xp: 50 },
  { id: "planner_5", name: "旅行策劃大師", desc: "儲存 5 個行程", icon: Target, color: "text-orange-600", condition: s => s.trips >= 5, xp: 200 },
  { id: "social_3", name: "旅伴召集", desc: "擁有 3 位好友", icon: Users, color: "text-pink-500", condition: s => s.friends >= 3, xp: 80 },
  { id: "social_10", name: "社交達人", desc: "擁有 10 位好友", icon: Users, color: "text-pink-600", condition: s => s.friends >= 10, xp: 200 },
  { id: "multi_region_3", name: "跨區旅行家", desc: "探索 3 個不同地區", icon: Plane, color: "text-sky-500", condition: s => s.regions >= 3, xp: 150 },
  { id: "collector", name: "收藏家", desc: "收藏 5 篇日記", icon: Heart, color: "text-red-500", condition: s => s.bookmarks >= 5, xp: 100 },
  { id: "photographer", name: "旅行攝影師", desc: "日記中上傳 3 張以上照片", icon: Camera, color: "text-cyan-500", condition: s => s.diaries >= 3, xp: 120 },
  { id: "fire", name: "熱情旅人", desc: "總 XP 達到 500", icon: Flame, color: "text-orange-500", condition: () => false, xp: 0 }, // Special: checked separately
  { id: "legend", name: "傳奇旅行家", desc: "解鎖 10 個成就", icon: Zap, color: "text-yellow-500", condition: () => false, xp: 0 }, // Special
];

const getLevel = (xp: number) => {
  if (xp >= 2000) return { level: 10, title: "傳奇旅行家", next: 2000, color: "text-yellow-500" };
  if (xp >= 1500) return { level: 9, title: "環球達人", next: 2000, color: "text-amber-500" };
  if (xp >= 1100) return { level: 8, title: "資深冒險家", next: 1500, color: "text-violet-500" };
  if (xp >= 800) return { level: 7, title: "旅行專家", next: 1100, color: "text-indigo-500" };
  if (xp >= 550) return { level: 6, title: "探險先鋒", next: 800, color: "text-blue-500" };
  if (xp >= 350) return { level: 5, title: "熟練旅人", next: 550, color: "text-teal-500" };
  if (xp >= 200) return { level: 4, title: "旅途中人", next: 350, color: "text-emerald-500" };
  if (xp >= 100) return { level: 3, title: "初階旅者", next: 200, color: "text-green-500" };
  if (xp >= 30) return { level: 2, title: "新手上路", next: 100, color: "text-lime-500" };
  return { level: 1, title: "旅行新手", next: 30, color: "text-stone-500" };
};

export default function Milestones() {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [visitedSpots, setVisitedSpots] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInRegion, setCheckInRegion] = useState<Region | null>(null);

  // Load visited spots
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumina_visited_spots");
      if (stored) setVisitedSpots(JSON.parse(stored));
    } catch {}
  }, []);

  const saveVisited = (spots: string[]) => {
    setVisitedSpots(spots);
    localStorage.setItem("lumina_visited_spots", JSON.stringify(spots));
  };

  const toggleSpot = (spot: string) => {
    const next = visitedSpots.includes(spot) ? visitedSpots.filter(s => s !== spot) : [...visitedSpots, spot];
    saveVisited(next);
    if (!visitedSpots.includes(spot)) toast.success(`已標記「${spot}」為造訪！`);
  };

  // Calculate stats
  const diaryCount = (() => { try { const d = localStorage.getItem(`wanderlust_user_diaries_${user?.id}`); return d ? JSON.parse(d).length : 0; } catch { return 0; } })();
  const tripCount = (() => { try { const t = localStorage.getItem("lumina_saved_trips"); return t ? JSON.parse(t).length : 0; } catch { return 0; } })();
  const bookmarkCount = (() => { try { const b = localStorage.getItem("lumina_diary_bookmarks"); return b ? JSON.parse(b).length : 0; } catch { return 0; } })();
  const visitedRegions = regions.filter(r => r.spots.some(s => visitedSpots.includes(s))).length;

  const stats: UserStats = {
    visited: visitedSpots.length,
    diaries: diaryCount,
    trips: tripCount,
    friends: friends.length,
    regions: visitedRegions,
    bookmarks: bookmarkCount,
  };

  // Calculate unlocked achievements & XP
  const unlocked = achievements.filter(a => {
    if (a.id === "fire") return totalXpCalc() >= 500;
    if (a.id === "legend") return achievements.filter(aa => aa.id !== "legend" && aa.id !== "fire" && aa.condition(stats)).length >= 10;
    return a.condition(stats);
  });

  function totalXpCalc() {
    return achievements.filter(a => a.id !== "fire" && a.id !== "legend" && a.condition(stats)).reduce((sum, a) => sum + a.xp, 0);
  }

  const totalXp = unlocked.reduce((sum, a) => sum + a.xp, 0) || totalXpCalc();
  const levelInfo = getLevel(totalXp);

  const selected = regions.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-6 bg-secondary/30">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header with Level */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Lv.{levelInfo.level}</h1>
                  <Badge className={`${levelInfo.color} bg-transparent border rounded-full text-xs`}>{levelInfo.title}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(totalXp / levelInfo.next) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground shrink-0">{totalXp}/{levelInfo.next} XP</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "造訪景點", value: stats.visited, icon: MapPin, color: "text-primary" },
                { label: "成就解鎖", value: `${unlocked.length}/${achievements.length}`, icon: Trophy, color: "text-amber-500" },
                { label: "日記篇數", value: stats.diaries, icon: BookOpen, color: "text-emerald-500" },
                { label: "探索地區", value: `${visitedRegions}/${regions.length}`, icon: Globe, color: "text-violet-500" },
              ].map(s => (
                <div key={s.label} className="p-3 bg-card rounded-xl border border-border/50 text-center">
                  <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6 flex-1">
        <div className="container max-w-3xl space-y-6">
          {/* Achievements */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Award className="w-5 h-5 text-amber-500" />成就系統
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map(a => {
                const isUnlocked = unlocked.some(u => u.id === a.id);
                const Icon = a.icon;
                return (
                  <motion.div key={a.id} whileHover={{ scale: 1.02 }}>
                    <Card className={`border-border/50 overflow-hidden ${isUnlocked ? "" : "opacity-50"}`}>
                      <CardContent className="p-3 text-center">
                        <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${isUnlocked ? "bg-amber-50 dark:bg-amber-950/30" : "bg-secondary"}`}>
                          {isUnlocked ? <Icon className={`w-5 h-5 ${a.color}`} /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <p className="text-xs font-semibold">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                        {isUnlocked && <Badge className="mt-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 rounded-full text-[9px]">+{a.xp} XP</Badge>}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Regional Progress */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Globe className="w-5 h-5 text-primary" />地區探索
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {regions.map(r => {
                const Icon = r.icon;
                const visited = r.spots.filter(s => visitedSpots.includes(s)).length;
                const pct = Math.round((visited / r.spots.length) * 100);
                return (
                  <Card key={r.id} className="border-border/50 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { setCheckInRegion(r); setCheckInOpen(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${r.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground">{visited}/{r.spots.length} 景點</p>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      {pct === 100 && <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0 rounded-full text-[9px]">✅ 完成</Badge>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Check-in Dialog */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              {checkInRegion && (() => { const Icon = checkInRegion.icon; return <Icon className={`w-5 h-5 ${checkInRegion.color}`} />; })()}
              {checkInRegion?.name} — 景點打卡
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 mt-2">
            {checkInRegion?.spots.map(spot => {
              const checked = visitedSpots.includes(spot);
              return (
                <button key={spot} onClick={() => toggleSpot(spot)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                    checked ? "bg-primary/10 border border-primary/30" : "bg-secondary/40 hover:bg-secondary/70 border border-transparent"
                  }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    checked ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {checked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <span className={`text-sm ${checked ? "font-medium" : "text-muted-foreground"}`}>{spot}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
