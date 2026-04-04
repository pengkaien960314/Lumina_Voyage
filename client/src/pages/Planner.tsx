/*
 * Design: Organic Naturalism — Trip Planner
 * - Interactive itinerary builder
 * - Day-by-day planning with drag-like feel
 * - Calendar integration
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, MapPin, Clock, Trash2, Calendar, ChevronDown, ChevronUp,
  Plane, Hotel, Camera, Coffee, UtensilsCrossed,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  type: string;
  notes: string;
}

interface TripDay {
  id: string;
  date: string;
  title: string;
  activities: Activity[];
  expanded: boolean;
}

const activityTypes = [
  { value: "sightseeing", label: "觀光", icon: Camera },
  { value: "food", label: "美食", icon: UtensilsCrossed },
  { value: "hotel", label: "住宿", icon: Hotel },
  { value: "transport", label: "交通", icon: Plane },
  { value: "cafe", label: "咖啡廳", icon: Coffee },
];

const sampleTrip: TripDay[] = [
  {
    id: "d1",
    date: "2026-05-01",
    title: "第一天 — 抵達東京",
    expanded: true,
    activities: [
      { id: "a1", time: "14:00", title: "抵達成田機場", location: "成田國際機場", type: "transport", notes: "搭乘 Skyliner 前往市區" },
      { id: "a2", time: "16:00", title: "入住飯店", location: "新宿華盛頓酒店", type: "hotel", notes: "Check-in 後稍作休息" },
      { id: "a3", time: "18:30", title: "新宿歌舞伎町散步", location: "新宿歌舞伎町", type: "sightseeing", notes: "感受東京夜生活的繁華" },
      { id: "a4", time: "19:30", title: "一蘭拉麵晚餐", location: "一蘭拉麵 新宿店", type: "food", notes: "必吃的豚骨拉麵" },
    ],
  },
  {
    id: "d2",
    date: "2026-05-02",
    title: "第二天 — 淺草與晴空塔",
    expanded: false,
    activities: [
      { id: "a5", time: "09:00", title: "淺草寺參拜", location: "淺草寺", type: "sightseeing", notes: "仲見世通購買伴手禮" },
      { id: "a6", time: "11:00", title: "晴空塔展望台", location: "東京晴空塔", type: "sightseeing", notes: "天望甲板 350m 高空景觀" },
      { id: "a7", time: "13:00", title: "鰻魚飯午餐", location: "色川鰻魚飯", type: "food", notes: "百年老店的炭烤鰻魚" },
    ],
  },
  {
    id: "d3",
    date: "2026-05-03",
    title: "第三天 — 鎌倉一日遊",
    expanded: false,
    activities: [
      { id: "a8", time: "08:30", title: "前往鎌倉", location: "JR 橫須賀線", type: "transport", notes: "從東京站出發約 1 小時" },
      { id: "a9", time: "10:00", title: "鎌倉大佛", location: "高德院", type: "sightseeing", notes: "日本三大佛像之一" },
      { id: "a10", time: "12:00", title: "江之島海鮮丼", location: "江之島", type: "food", notes: "新鮮的生魚片蓋飯" },
    ],
  },
];

export default function Planner() {
  const [days, setDays] = useState<TripDay[]>(sampleTrip);
  const [tripName, setTripName] = useState("東京五日遊");
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [addingToDay, setAddingToDay] = useState<string | null>(null);

  const toggleDay = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, expanded: !d.expanded } : d))
    );
  };

  const removeActivity = (dayId: string, actId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      )
    );
    toast.success("已移除活動");
  };

  const addActivity = (dayId: string) => {
    if (!newActivity.title || !newActivity.time) {
      toast.error("請填寫活動名稱與時間");
      return;
    }
    const activity: Activity = {
      id: `a${Date.now()}`,
      time: newActivity.time || "12:00",
      title: newActivity.title || "",
      location: newActivity.location || "",
      type: newActivity.type || "sightseeing",
      notes: newActivity.notes || "",
    };
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, activities: [...d.activities, activity].sort((a, b) => a.time.localeCompare(b.time)) }
          : d
      )
    );
    setNewActivity({});
    setAddingToDay(null);
    toast.success("已新增活動");
  };

  const getTypeIcon = (type: string) => {
    const found = activityTypes.find((t) => t.value === type);
    return found ? found.icon : Camera;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sightseeing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      food: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      hotel: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      transport: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      cafe: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

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
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                行程規劃
              </h1>
            </div>
            <p className="text-muted-foreground">
              規劃你的完美旅程，安排每一天的精彩行程
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          {/* Trip Header */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Input
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="text-xl font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    2026/05/01 — 2026/05/05 · {days.length} 天
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full gap-2"
                  onClick={() => {
                    const newDay: TripDay = {
                      id: `d${Date.now()}`,
                      date: "2026-05-04",
                      title: `第${days.length + 1}天 — 新行程`,
                      expanded: true,
                      activities: [],
                    };
                    setDays([...days, newDay]);
                    toast.success("已新增一天行程");
                  }}
                >
                  <Plus className="w-4 h-4" />
                  新增一天
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Days */}
          <div className="space-y-4">
            {days.map((day, dayIndex) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleDay(day.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{dayIndex + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                          {day.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{day.date} · {day.activities.length} 個活動</p>
                      </div>
                    </div>
                    {day.expanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {day.expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0 pb-5 px-5">
                          <div className="space-y-3 ml-5 border-l-2 border-border pl-6">
                            {day.activities.map((act) => {
                              const TypeIcon = getTypeIcon(act.type);
                              return (
                                <div
                                  key={act.id}
                                  className="relative group"
                                >
                                  <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
                                  <div className="p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        <Badge className={`rounded-lg px-2 py-1 ${getTypeColor(act.type)}`}>
                                          <TypeIcon className="w-3.5 h-3.5" />
                                        </Badge>
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground font-medium">{act.time}</span>
                                          </div>
                                          <h4 className="font-semibold text-sm">{act.title}</h4>
                                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {act.location}
                                          </div>
                                          {act.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                              {act.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                        onClick={() => removeActivity(day.id, act.id)}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Activity */}
                          <Dialog open={addingToDay === day.id} onOpenChange={(open) => setAddingToDay(open ? day.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 ml-11 rounded-full gap-2 border-dashed"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                新增活動
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle style={{ fontFamily: "var(--font-display)" }}>新增活動</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>時間</Label>
                                    <Input
                                      type="time"
                                      value={newActivity.time || ""}
                                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>類型</Label>
                                    <Select
                                      value={newActivity.type || "sightseeing"}
                                      onValueChange={(v) => setNewActivity({ ...newActivity, type: v })}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {activityTypes.map((t) => (
                                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>活動名稱</Label>
                                  <Input
                                    placeholder="例：參觀東京鐵塔"
                                    value={newActivity.title || ""}
                                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>地點</Label>
                                  <Input
                                    placeholder="例：東京都港區"
                                    value={newActivity.location || ""}
                                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>備註</Label>
                                  <Textarea
                                    placeholder="任何補充說明..."
                                    value={newActivity.notes || ""}
                                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                                    rows={3}
                                  />
                                </div>
                                <Button className="w-full rounded-xl" onClick={() => addActivity(day.id)}>
                                  新增
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
