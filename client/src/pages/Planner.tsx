/**
 * Design: Organic Naturalism — Trip Planner
 * - AI itinerary generation with Gemini API
 * - Historical itineraries
 * - Date change, auto-increment when adding days
 * - Long-press activity to enlarge & edit (time, location, image, delete inside edit)
 * - Activity type icons
 * - Long-press day header to edit title, date, delete day
 * - Add booked hotels, flights, itineraries
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp,
  Plane, Hotel, Camera, Coffee, UtensilsCrossed, Edit3, Trash2,
  ShoppingBag, Music, Bus, Train, Ship, Bike, Footprints, Ticket,
  Image as ImageIcon, Save, Sparkles, Loader2, History, Archive,
  Download, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useBooking } from "@/contexts/BookingContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GEMINI_API_KEY = "AIzaSyB_tEx6ILOy6U7NOwtYmclHwLWqNXyRQmQ";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  type: string;
  notes: string;
  image?: string;
}

interface TripDay {
  id: string;
  date: string;
  title: string;
  activities: Activity[];
  expanded: boolean;
}

interface SavedTrip {
  id: string;
  name: string;
  startDate: string;
  days: TripDay[];
  createdAt: string;
  isAiGenerated?: boolean;
}

const activityTypes = [
  { value: "sightseeing", label: "觀光", icon: Camera },
  { value: "food", label: "美食", icon: UtensilsCrossed },
  { value: "hotel", label: "住宿", icon: Hotel },
  { value: "transport", label: "交通", icon: Plane },
  { value: "cafe", label: "咖啡廳", icon: Coffee },
  { value: "shopping", label: "購物", icon: ShoppingBag },
  { value: "entertainment", label: "娛樂", icon: Music },
  { value: "bus", label: "巴士", icon: Bus },
  { value: "train", label: "火車", icon: Train },
  { value: "ferry", label: "渡輪", icon: Ship },
  { value: "cycling", label: "騎車", icon: Bike },
  { value: "walking", label: "步行", icon: Footprints },
  { value: "ticket", label: "門票", icon: Ticket },
];

const sampleTrip: TripDay[] = [
  {
    id: "d1", date: "2026-05-01", title: "第一天 — 抵達東京", expanded: true,
    activities: [
      { id: "a1", time: "14:00", title: "抵達成田機場", location: "成田國際機場", type: "transport", notes: "搭乘 Skyliner 前往市區" },
      { id: "a2", time: "16:00", title: "入住飯店", location: "新宿華盛頓酒店", type: "hotel", notes: "Check-in 後稍作休息" },
      { id: "a3", time: "18:30", title: "新宿歌舞伎町散步", location: "新宿歌舞伎町", type: "sightseeing", notes: "感受東京夜生活的繁華" },
      { id: "a4", time: "19:30", title: "一蘭拉麵晚餐", location: "一蘭拉麵 新宿店", type: "food", notes: "必吃的豚骨拉麵" },
    ],
  },
  {
    id: "d2", date: "2026-05-02", title: "第二天 — 淺草與晴空塔", expanded: false,
    activities: [
      { id: "a5", time: "09:00", title: "淺草寺參拜", location: "淺草寺", type: "sightseeing", notes: "仲見世通購買伴手禮" },
      { id: "a6", time: "11:00", title: "晴空塔展望台", location: "東京晴空塔", type: "sightseeing", notes: "天望甲板 350m 高空景觀" },
      { id: "a7", time: "13:00", title: "鰻魚飯午餐", location: "色川鰻魚飯", type: "food", notes: "百年老店的炭烤鰻魚" },
    ],
  },
  {
    id: "d3", date: "2026-05-03", title: "第三天 — 鎌倉一日遊", expanded: false,
    activities: [
      { id: "a8", time: "08:30", title: "前往鎌倉", location: "JR 橫須賀線", type: "train", notes: "從東京站出發約 1 小時" },
      { id: "a9", time: "10:00", title: "鎌倉大佛", location: "高德院", type: "sightseeing", notes: "日本三大佛像之一" },
      { id: "a10", time: "12:00", title: "江之島海鮮丼", location: "江之島", type: "food", notes: "新鮮的生魚片蓋飯" },
    ],
  },
];

export default function Planner() {
  const { flightBookings, hotelBookings } = useBooking();
  const [activeTab, setActiveTab] = useState("current");
  const [days, setDays] = useState<TripDay[]>(sampleTrip);
  const [tripName, setTripName] = useState("東京五日遊");
  const [startDate, setStartDate] = useState("2026-05-01");
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [addingToDay, setAddingToDay] = useState<string | null>(null);

  // Edit activity state
  const [editingAct, setEditingAct] = useState<{ dayId: string; activity: Activity } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});

  // Edit day state
  const [editingDay, setEditingDay] = useState<TripDay | null>(null);
  const [editDayForm, setEditDayForm] = useState({ title: "", date: "" });

  // Long press
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressDayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add booking dialog
  const [showAddBooking, setShowAddBooking] = useState<string | null>(null);

  // AI Planner state
  const [aiDest, setAiDest] = useState("");
  const [aiDays, setAiDays] = useState("3");
  const [aiBudget, setAiBudget] = useState("medium");
  const [aiStyle, setAiStyle] = useState("balanced");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<TripDay[] | null>(null);

  // History state
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  // Load saved trips from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumina_saved_trips");
      if (saved) setSavedTrips(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveTripsToStorage = (trips: SavedTrip[]) => {
    setSavedTrips(trips);
    localStorage.setItem("lumina_saved_trips", JSON.stringify(trips));
  };

  // Update dates when start date changes
  const updateDates = useCallback((newStart: string) => {
    setStartDate(newStart);
    const base = new Date(newStart);
    setDays(prev => prev.map((d, i) => {
      const nd = new Date(base);
      nd.setDate(nd.getDate() + i);
      return { ...d, date: nd.toISOString().split("T")[0] };
    }));
  }, []);

  const toggleDay = (dayId: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, expanded: !d.expanded } : d));
  };

  const addActivity = (dayId: string) => {
    if (!newActivity.title || !newActivity.time) { toast.error("請填寫活動名稱與時間"); return; }
    const activity: Activity = {
      id: `a${Date.now()}`, time: newActivity.time || "12:00", title: newActivity.title || "",
      location: newActivity.location || "", type: newActivity.type || "sightseeing",
      notes: newActivity.notes || "", image: newActivity.image || "",
    };
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, activity].sort((a, b) => a.time.localeCompare(b.time)) } : d));
    setNewActivity({}); setAddingToDay(null);
    toast.success("已新增活動");
  };

  const addDay = () => {
    const lastDate = days.length > 0 ? new Date(days[days.length - 1].date) : new Date(startDate);
    lastDate.setDate(lastDate.getDate() + 1);
    const newDay: TripDay = {
      id: `d${Date.now()}`, date: lastDate.toISOString().split("T")[0],
      title: `第${days.length + 1}天 — 新行程`, expanded: true, activities: [],
    };
    setDays([...days, newDay]);
    toast.success("已新增一天行程");
  };

  // Long press handlers
  const handleActPointerDown = (dayId: string, act: Activity) => {
    longPressTimer.current = setTimeout(() => {
      setEditingAct({ dayId, activity: act });
      setEditForm({ ...act });
    }, 500);
  };
  const handleActPointerUp = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const handleDayPointerDown = (day: TripDay) => {
    longPressDayTimer.current = setTimeout(() => {
      setEditingDay(day);
      setEditDayForm({ title: day.title, date: day.date });
    }, 500);
  };
  const handleDayPointerUp = () => { if (longPressDayTimer.current) clearTimeout(longPressDayTimer.current); };

  const saveEditedAct = () => {
    if (!editingAct) return;
    setDays(prev => prev.map(d =>
      d.id === editingAct.dayId ? { ...d, activities: d.activities.map(a => a.id === editingAct.activity.id ? { ...a, ...editForm } as Activity : a).sort((a, b) => a.time.localeCompare(b.time)) } : d
    ));
    setEditingAct(null);
    toast.success("已更新活動");
  };

  const deleteActFromEdit = () => {
    if (!editingAct) return;
    setDays(prev => prev.map(d =>
      d.id === editingAct.dayId ? { ...d, activities: d.activities.filter(a => a.id !== editingAct.activity.id) } : d
    ));
    setEditingAct(null);
    toast.success("已刪除活動");
  };

  const saveEditedDay = () => {
    if (!editingDay) return;
    setDays(prev => prev.map(d => d.id === editingDay.id ? { ...d, title: editDayForm.title, date: editDayForm.date } : d));
    setEditingDay(null);
    toast.success("已更新行程日");
  };

  const deleteDay = () => {
    if (!editingDay) return;
    setDays(prev => prev.filter(d => d.id !== editingDay.id));
    setEditingDay(null);
    toast.success("已刪除整日行程");
  };

  const addBookingToDay = (dayId: string, type: "flight" | "hotel", idx: number) => {
    let act: Activity;
    if (type === "flight") {
      const fb = flightBookings[idx];
      act = { id: `ab${Date.now()}`, time: fb.departTime, title: `${fb.airline} ${fb.code}`, location: `${fb.from} → ${fb.to}`, type: "transport", notes: `${fb.date} | ${fb.class} | ${fb.passengers}人` };
    } else {
      const hb = hotelBookings[idx];
      act = { id: `ab${Date.now()}`, time: "15:00", title: hb.hotelName, location: hb.location, type: "hotel", notes: `${hb.checkIn} ~ ${hb.checkOut} | ${hb.guests}人` };
    }
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, act].sort((a, b) => a.time.localeCompare(b.time)) } : d));
    setShowAddBooking(null);
    toast.success("已加入預訂項目");
  };

  const getTypeIcon = (type: string) => {
    const found = activityTypes.find(t => t.value === type);
    return found ? found.icon : Camera;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sightseeing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      food: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      hotel: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      transport: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      cafe: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      shopping: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
      entertainment: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
      bus: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
      train: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
      ferry: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
      cycling: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
      walking: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      ticket: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Save current trip to history
  const saveCurrentTrip = () => {
    const trip: SavedTrip = {
      id: `trip_${Date.now()}`, name: tripName, startDate, days,
      createdAt: new Date().toISOString(), isAiGenerated: false,
    };
    const updated = [trip, ...savedTrips].slice(0, 50);
    saveTripsToStorage(updated);
    toast.success("行程已儲存到歷史紀錄");
  };

  // Load trip from history
  const loadTrip = (trip: SavedTrip) => {
    setTripName(trip.name);
    setStartDate(trip.startDate);
    setDays(trip.days.map(d => ({ ...d, expanded: false })));
    setActiveTab("current");
    toast.success(`已載入行程：${trip.name}`);
  };

  // Delete trip from history
  const deleteTrip = (tripId: string) => {
    const updated = savedTrips.filter(t => t.id !== tripId);
    saveTripsToStorage(updated);
    toast.success("已刪除歷史行程");
  };

  // AI Generate Itinerary
  const aiGenerateItinerary = async () => {
    if (!aiDest.trim()) { toast.error("請輸入目的地"); return; }
    setAiLoading(true);
    setAiResult(null);
    const budgetMap: Record<string, string> = { low: "經濟實惠", medium: "中等預算", high: "高級奢華" };
    const styleMap: Record<string, string> = { culture: "文化歷史", nature: "自然風景", food: "美食探索", adventure: "冒險刺激", balanced: "均衡多元" };
    const numDays = parseInt(aiDays) || 3;
    const prompt = `你是專業旅行規劃師。請為「${aiDest}」規劃 ${numDays} 天的旅行行程。
預算偏好：${budgetMap[aiBudget] || "中等"}
旅行風格：${styleMap[aiStyle] || "均衡"}

請以 JSON 格式回覆（不要加 markdown 代碼塊標記），格式如下：
[{"title":"第1天 — 標題","activities":[{"time":"09:00","title":"活動名稱","location":"地點","type":"sightseeing","notes":"說明"}]}]

type 只能是：sightseeing, food, hotel, transport, cafe, shopping, entertainment, bus, train, ferry, cycling, walking, ticket
每天安排 4-6 個活動，時間從早到晚排列。`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );
      if (!response.ok) throw new Error(`API 錯誤: ${response.status}`);
      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let jsonStr = raw;
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) jsonStr = m[1];
      const bs = jsonStr.indexOf("[");
      const be = jsonStr.lastIndexOf("]");
      if (bs !== -1 && be !== -1) jsonStr = jsonStr.substring(bs, be + 1);
      const parsed = JSON.parse(jsonStr);
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 7);
      const tripDays: TripDay[] = parsed.map((day: any, i: number) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        return {
          id: `ai_d${i}`, date: d.toISOString().split("T")[0], title: day.title || `第${i + 1}天`,
          expanded: i === 0,
          activities: (day.activities || []).map((a: any, j: number) => ({
            id: `ai_a${i}_${j}`, time: a.time || "12:00", title: a.title || "",
            location: a.location || "", type: a.type || "sightseeing", notes: a.notes || "",
          })),
        };
      });
      setAiResult(tripDays);
      toast.success("AI 行程已生成！");
    } catch {
      toast.error("AI 生成失敗，請重試");
    }
    setAiLoading(false);
  };

  // Apply AI result to current trip
  const applyAiResult = () => {
    if (!aiResult) return;
    setDays(aiResult);
    setTripName(`${aiDest} ${aiDays}日遊`);
    setStartDate(aiResult[0]?.date || new Date().toISOString().split("T")[0]);
    // Save to history as AI-generated
    const trip: SavedTrip = {
      id: `trip_${Date.now()}`, name: `${aiDest} ${aiDays}日遊（AI）`,
      startDate: aiResult[0]?.date || "", days: aiResult,
      createdAt: new Date().toISOString(), isAiGenerated: true,
    };
    const updated = [trip, ...savedTrips].slice(0, 50);
    saveTripsToStorage(updated);
    setActiveTab("current");
    setAiResult(null);
    toast.success("AI 行程已套用！");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>行程規劃</h1>
            </div>
            <p className="text-muted-foreground">規劃你的完美旅程，或讓 AI 為你量身打造</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 h-12 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger value="current" className="rounded-lg gap-1.5 data-[state=active]:bg-background"><Calendar className="w-4 h-4" />目前行程</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-lg gap-1.5 data-[state=active]:bg-background"><Sparkles className="w-4 h-4" />AI 規劃</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg gap-1.5 data-[state=active]:bg-background"><History className="w-4 h-4" />歷史行程</TabsTrigger>
            </TabsList>

            {/* Current Trip Tab */}
            <TabsContent value="current">
              {/* Trip Header */}
              <Card className="mb-6 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Input value={tripName} onChange={e => setTripName(e.target.value)} className="text-xl font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" style={{ fontFamily: "var(--font-display)" }} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full gap-2" onClick={saveCurrentTrip}><Save className="w-4 h-4" />儲存</Button>
                        <Button variant="outline" className="rounded-full gap-2" onClick={addDay}><Plus className="w-4 h-4" />新增一天</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">起始日期</Label>
                        <Input type="date" value={startDate} onChange={e => updateDates(e.target.value)} className="w-44 h-9 rounded-xl text-sm" />
                      </div>
                      <span className="text-sm text-muted-foreground">{days.length} 天行程</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Days */}
              <div className="space-y-4">
                {days.map((day, dayIndex) => (
                  <motion.div key={day.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: dayIndex * 0.05 }}>
                    <Card className="overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors text-left select-none"
                        onClick={() => toggleDay(day.id)}
                        onPointerDown={() => handleDayPointerDown(day)}
                        onPointerUp={handleDayPointerUp}
                        onPointerLeave={handleDayPointerUp}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{dayIndex + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>{day.title}</h3>
                            <p className="text-xs text-muted-foreground">{day.date} · {day.activities.length} 個活動</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                          {day.expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {day.expanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <CardContent className="pt-0 pb-5 px-5">
                              <div className="space-y-3 ml-5 border-l-2 border-border pl-6">
                                {day.activities.map((act, actIdx) => {
                                  const TypeIcon = getTypeIcon(act.type);
                                  const prevAct = actIdx > 0 ? day.activities[actIdx - 1] : null;
                                  let travelMinutes = 0;
                                  if (prevAct) {
                                    const [ph, pm] = prevAct.time.split(":").map(Number);
                                    const [ch, cm] = act.time.split(":").map(Number);
                                    travelMinutes = (ch * 60 + cm) - (ph * 60 + pm);
                                    if (travelMinutes < 0) travelMinutes += 24 * 60;
                                  }
                                  return (
                                    <div key={act.id}>
                                      {prevAct && travelMinutes > 0 && (
                                        <div className="flex items-center gap-2 py-1.5 -ml-1">
                                          <div className="w-px h-3 bg-border ml-[3px]" />
                                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground">
                                            <Clock className="w-2.5 h-2.5" />
                                            <span>{travelMinutes >= 60 ? `${Math.floor(travelMinutes/60)}h${travelMinutes%60 > 0 ? `${travelMinutes%60}m` : ""}` : `${travelMinutes}分鐘`}</span>
                                          </div>
                                        </div>
                                      )}
                                      <div className="relative group select-none"
                                        onPointerDown={() => handleActPointerDown(day.id, act)}
                                        onPointerUp={handleActPointerUp}
                                        onPointerLeave={handleActPointerUp}
                                      >
                                        <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
                                        <div className="p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
                                          <div className="flex items-start gap-3">
                                            <Badge className={`rounded-lg px-2 py-1 ${getTypeColor(act.type)}`}>
                                              <TypeIcon className="w-3.5 h-3.5" />
                                            </Badge>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-medium">{act.time}</span>
                                                <span className="text-[10px] text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">長按編輯</span>
                                              </div>
                                              <h4 className="font-semibold text-sm">{act.title}</h4>
                                              {act.location && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="w-3 h-3" />{act.location}</div>}
                                              {act.notes && <p className="text-xs text-muted-foreground mt-2 italic">{act.notes}</p>}
                                              {act.image && <img src={act.image} alt="" className="mt-2 rounded-lg w-full h-24 object-cover" />}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex gap-2 mt-4 ml-11">
                                <Dialog open={addingToDay === day.id} onOpenChange={open => setAddingToDay(open ? day.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-dashed"><Plus className="w-3.5 h-3.5" />新增活動</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>新增活動</DialogTitle></DialogHeader>
                                    <div className="space-y-4 mt-4">
                                      <div className="space-y-2"><Label>時間</Label><Input type="time" value={newActivity.time || ""} onChange={e => setNewActivity({ ...newActivity, time: e.target.value })} /></div>
                                      <div className="space-y-2">
                                        <Label>類型</Label>
                                        <Select value={newActivity.type || "sightseeing"} onValueChange={v => setNewActivity({ ...newActivity, type: v })}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>{activityTypes.map(t => { const TI = t.icon; return <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2"><TI className="w-3.5 h-3.5" />{t.label}</span></SelectItem>; })}</SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2"><Label>活動名稱</Label><Input placeholder="例：參觀東京鐵塔" value={newActivity.title || ""} onChange={e => setNewActivity({ ...newActivity, title: e.target.value })} /></div>
                                      <div className="space-y-2"><Label>地點</Label><Input placeholder="例：東京都港區" value={newActivity.location || ""} onChange={e => setNewActivity({ ...newActivity, location: e.target.value })} /></div>
                                      <div className="space-y-2">
                                        <Label>圖片</Label>
                                        <div className="flex gap-2">
                                          <Input placeholder="https://... 或上傳圖片" value={newActivity.image || ""} onChange={e => setNewActivity({ ...newActivity, image: e.target.value })} className="flex-1" />
                                          <Button variant="outline" size="sm" className="shrink-0" onClick={() => {
                                            const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
                                            inp.onchange = (ev: any) => {
                                              const f = ev.target.files?.[0]; if (!f) return;
                                              if (f.size > 5*1024*1024) { toast.error("圖片不能超過 5MB"); return; }
                                              const r = new FileReader(); r.onload = (e2) => setNewActivity(prev => ({ ...prev, image: e2.target?.result as string })); r.readAsDataURL(f);
                                            }; inp.click();
                                          }}><ImageIcon className="w-4 h-4" aria-label="上傳圖片" /></Button>
                                        </div>
                                      </div>
                                      <div className="space-y-2"><Label>備註</Label><Textarea placeholder="任何補充說明..." value={newActivity.notes || ""} onChange={e => setNewActivity({ ...newActivity, notes: e.target.value })} rows={3} /></div>
                                      <Button className="w-full rounded-xl" onClick={() => addActivity(day.id)}>新增</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {(flightBookings.length > 0 || hotelBookings.length > 0) && (
                                  <Dialog open={showAddBooking === day.id} onOpenChange={open => setShowAddBooking(open ? day.id : null)}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="rounded-full gap-2 border-dashed"><Ticket className="w-3.5 h-3.5" />加入預訂</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>加入已預訂項目</DialogTitle></DialogHeader>
                                      <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                                        {flightBookings.filter(f => f.status === "confirmed").map((fb, i) => (
                                          <button key={fb.id} className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors" onClick={() => addBookingToDay(day.id, "flight", i)}>
                                            <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{fb.airline} {fb.code}</span></div>
                                            <p className="text-xs text-muted-foreground mt-1">{fb.from} → {fb.to} | {fb.date}</p>
                                          </button>
                                        ))}
                                        {hotelBookings.filter(h => h.status === "confirmed").map((hb, i) => (
                                          <button key={hb.id} className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors" onClick={() => addBookingToDay(day.id, "hotel", i)}>
                                            <div className="flex items-center gap-2"><Hotel className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{hb.hotelName}</span></div>
                                            <p className="text-xs text-muted-foreground mt-1">{hb.checkIn} ~ {hb.checkOut}</p>
                                          </button>
                                        ))}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* AI Planner Tab */}
            <TabsContent value="ai">
              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>AI 智慧行程規劃</h2>
                      <p className="text-xs text-muted-foreground">告訴 AI 你的旅行偏好，自動生成完整行程</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>目的地</Label>
                    <Input placeholder="例：北海道、東京、巴黎..." value={aiDest} onChange={e => setAiDest(e.target.value)} className="rounded-xl" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>天數</Label>
                      <Input type="text" inputMode="numeric" value={aiDays} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setAiDays(v); }} placeholder="3" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>預算</Label>
                      <Select value={aiBudget} onValueChange={setAiBudget}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">💰 經濟</SelectItem>
                          <SelectItem value="medium">💎 中等</SelectItem>
                          <SelectItem value="high">👑 奢華</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>風格</Label>
                      <Select value={aiStyle} onValueChange={setAiStyle}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="culture">🏛️ 文化</SelectItem>
                          <SelectItem value="nature">🌿 自然</SelectItem>
                          <SelectItem value="food">🍜 美食</SelectItem>
                          <SelectItem value="adventure">🏔️ 冒險</SelectItem>
                          <SelectItem value="balanced">⚖️ 均衡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full rounded-xl h-12 gap-2 text-base" onClick={aiGenerateItinerary} disabled={aiLoading}>
                    {aiLoading ? <><Loader2 className="w-5 h-5 animate-spin" />AI 正在規劃中...</> : <><Sparkles className="w-5 h-5" />生成 AI 行程</>}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Result Preview */}
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>AI 生成結果</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-full gap-2" onClick={() => setAiResult(null)}><X className="w-4 h-4" />取消</Button>
                      <Button className="rounded-full gap-2" onClick={applyAiResult}><Download className="w-4 h-4" />套用行程</Button>
                    </div>
                  </div>

                  {aiResult.map((day, i) => (
                    <Card key={day.id} className="overflow-hidden border-primary/10">
                      <div className="p-4 bg-primary/5">
                        <h4 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>{day.title}</h4>
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {day.activities.map(act => {
                            const TypeIcon = getTypeIcon(act.type);
                            return (
                              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/20">
                                <Badge className={`rounded-lg px-2 py-1 shrink-0 ${getTypeColor(act.type)}`}><TypeIcon className="w-3.5 h-3.5" /></Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{act.time}</span>
                                    <span className="font-medium text-sm">{act.title}</span>
                                  </div>
                                  {act.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{act.location}</p>}
                                  {act.notes && <p className="text-xs text-muted-foreground mt-1 italic">{act.notes}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              {savedTrips.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Archive className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>尚無歷史行程</h3>
                    <p className="text-sm text-muted-foreground">儲存目前行程或使用 AI 生成行程後，會自動出現在這裡</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {savedTrips.map(trip => (
                    <Card key={trip.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{trip.name}</h3>
                              {trip.isAiGenerated && <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[10px]"><Sparkles className="w-2.5 h-2.5 mr-0.5" />AI</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {trip.startDate} · {trip.days.length} 天 · {trip.days.reduce((s, d) => s + d.activities.length, 0)} 個活動
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              建立於 {new Date(trip.createdAt).toLocaleDateString("zh-TW")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => loadTrip(trip)}>載入</Button>
                            <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => deleteTrip(trip.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Activity Dialog */}
      <Dialog open={!!editingAct} onOpenChange={() => setEditingAct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>編輯活動</DialogTitle></DialogHeader>
          {editingAct && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>時間</Label><Input type="time" value={editForm.time || ""} onChange={e => setEditForm({ ...editForm, time: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>類型</Label>
                <Select value={editForm.type || "sightseeing"} onValueChange={v => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{activityTypes.map(t => { const TI = t.icon; return <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2"><TI className="w-3.5 h-3.5" />{t.label}</span></SelectItem>; })}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>活動名稱</Label><Input value={editForm.title || ""} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>地點</Label><Input value={editForm.location || ""} onChange={e => setEditForm({ ...editForm, location: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>圖片</Label>
                <div className="flex gap-2">
                  <Input value={editForm.image || ""} onChange={e => setEditForm({ ...editForm, image: e.target.value })} placeholder="https://... 或上傳圖片" className="flex-1" />
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => {
                    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
                    inp.onchange = (ev: any) => {
                      const f = ev.target.files?.[0]; if (!f) return;
                      if (f.size > 5*1024*1024) { toast.error("圖片不能超過 5MB"); return; }
                      const r = new FileReader(); r.onload = (e2) => setEditForm(prev => ({ ...prev, image: e2.target?.result as string })); r.readAsDataURL(f);
                    }; inp.click();
                  }}><ImageIcon className="w-4 h-4" aria-label="上傳圖片" /></Button>
                </div>
              </div>
              {editForm.image && <img src={editForm.image} alt="" className="rounded-xl w-full h-32 object-cover" />}
              <div className="space-y-2"><Label>備註</Label><Textarea value={editForm.notes || ""} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3} /></div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2" onClick={saveEditedAct}><Save className="w-4 h-4" />儲存</Button>
                <Button variant="destructive" className="rounded-xl gap-2" onClick={deleteActFromEdit}><Trash2 className="w-4 h-4" />刪除</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Day Dialog */}
      <Dialog open={!!editingDay} onOpenChange={() => setEditingDay(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>編輯行程日</DialogTitle></DialogHeader>
          {editingDay && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>標題</Label><Input value={editDayForm.title} onChange={e => setEditDayForm({ ...editDayForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>日期</Label><Input type="date" value={editDayForm.date} onChange={e => setEditDayForm({ ...editDayForm, date: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2" onClick={saveEditedDay}><Save className="w-4 h-4" />儲存</Button>
                <Button variant="destructive" className="rounded-xl gap-2" onClick={deleteDay}><Trash2 className="w-4 h-4" />刪除</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
