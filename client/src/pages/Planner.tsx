/*
 * Design: Organic Naturalism — Trip Planner
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
import {
  Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp,
  Plane, Hotel, Camera, Coffee, UtensilsCrossed, Edit3, Trash2,
  ShoppingBag, Music, Bus, Train, Ship, Bike, Footprints, Ticket,
  X, Image as ImageIcon, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useBooking } from "@/contexts/BookingContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

  // Update dates when start date changes
  const updateDates = useCallback((newStart: string) => {
    setStartDate(newStart);
    const base = new Date(newStart);
    setDays((prev) =>
      prev.map((d, i) => {
        const nd = new Date(base);
        nd.setDate(nd.getDate() + i);
        return { ...d, date: nd.toISOString().split("T")[0] };
      })
    );
  }, []);

  const toggleDay = (dayId: string) => {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, expanded: !d.expanded } : d)));
  };

  const addActivity = (dayId: string) => {
    if (!newActivity.title || !newActivity.time) { toast.error("請填寫活動名稱與時間"); return; }
    const activity: Activity = {
      id: `a${Date.now()}`, time: newActivity.time || "12:00", title: newActivity.title || "",
      location: newActivity.location || "", type: newActivity.type || "sightseeing",
      notes: newActivity.notes || "", image: newActivity.image || "",
    };
    setDays((prev) => prev.map((d) => d.id === dayId ? { ...d, activities: [...d.activities, activity].sort((a, b) => a.time.localeCompare(b.time)) } : d));
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

  // Long press handlers for activity
  const handleActPointerDown = (dayId: string, act: Activity) => {
    longPressTimer.current = setTimeout(() => {
      setEditingAct({ dayId, activity: act });
      setEditForm({ ...act });
    }, 500);
  };
  const handleActPointerUp = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  // Long press handlers for day
  const handleDayPointerDown = (day: TripDay) => {
    longPressDayTimer.current = setTimeout(() => {
      setEditingDay(day);
      setEditDayForm({ title: day.title, date: day.date });
    }, 500);
  };
  const handleDayPointerUp = () => { if (longPressDayTimer.current) clearTimeout(longPressDayTimer.current); };

  // Save edited activity
  const saveEditedAct = () => {
    if (!editingAct) return;
    setDays((prev) => prev.map((d) =>
      d.id === editingAct.dayId ? {
        ...d, activities: d.activities.map((a) => a.id === editingAct.activity.id ? { ...a, ...editForm } as Activity : a).sort((a, b) => a.time.localeCompare(b.time))
      } : d
    ));
    setEditingAct(null);
    toast.success("已更新活動");
  };

  // Delete activity from edit dialog
  const deleteActFromEdit = () => {
    if (!editingAct) return;
    setDays((prev) => prev.map((d) =>
      d.id === editingAct.dayId ? { ...d, activities: d.activities.filter((a) => a.id !== editingAct.activity.id) } : d
    ));
    setEditingAct(null);
    toast.success("已刪除活動");
  };

  // Save edited day
  const saveEditedDay = () => {
    if (!editingDay) return;
    setDays((prev) => prev.map((d) => d.id === editingDay.id ? { ...d, title: editDayForm.title, date: editDayForm.date } : d));
    setEditingDay(null);
    toast.success("已更新行程日");
  };

  // Delete day
  const deleteDay = () => {
    if (!editingDay) return;
    setDays((prev) => prev.filter((d) => d.id !== editingDay.id));
    setEditingDay(null);
    toast.success("已刪除整日行程");
  };

  // Add booking to day
  const addBookingToDay = (dayId: string, type: "flight" | "hotel", idx: number) => {
    let act: Activity;
    if (type === "flight") {
      const fb = flightBookings[idx];
      act = { id: `ab${Date.now()}`, time: fb.departTime, title: `${fb.airline} ${fb.code}`, location: `${fb.from} → ${fb.to}`, type: "transport", notes: `${fb.date} | ${fb.class} | ${fb.passengers}人` };
    } else {
      const hb = hotelBookings[idx];
      act = { id: `ab${Date.now()}`, time: "15:00", title: hb.hotelName, location: hb.location, type: "hotel", notes: `${hb.checkIn} ~ ${hb.checkOut} | ${hb.guests}人` };
    }
    setDays((prev) => prev.map((d) => d.id === dayId ? { ...d, activities: [...d.activities, act].sort((a, b) => a.time.localeCompare(b.time)) } : d));
    setShowAddBooking(null);
    toast.success("已加入預訂項目");
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
            <p className="text-muted-foreground">規劃你的完美旅程，安排每一天的精彩行程</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          {/* Trip Header */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Input value={tripName} onChange={(e) => setTripName(e.target.value)} className="text-xl font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" style={{ fontFamily: "var(--font-display)" }} />
                  </div>
                  <Button variant="outline" className="rounded-full gap-2" onClick={addDay}><Plus className="w-4 h-4" />新增一天</Button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">起始日期</Label>
                    <Input type="date" value={startDate} onChange={(e) => updateDates(e.target.value)} className="w-44 h-9 rounded-xl text-sm" />
                  </div>
                  <span className="text-sm text-muted-foreground">{days.length} 天行程</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days */}
          <div className="space-y-4">
            {days.map((day, dayIndex) => (
              <motion.div key={day.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: dayIndex * 0.1 }}>
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
                            {day.activities.map((act) => {
                              const TypeIcon = getTypeIcon(act.type);
                              return (
                                <div key={act.id} className="relative group select-none"
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
                              );
                            })}
                          </div>

                          {/* Add buttons */}
                          <div className="flex gap-2 mt-4 ml-11">
                            <Dialog open={addingToDay === day.id} onOpenChange={(open) => setAddingToDay(open ? day.id : null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-full gap-2 border-dashed"><Plus className="w-3.5 h-3.5" />新增活動</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>新增活動</DialogTitle></DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>時間</Label><Input type="time" value={newActivity.time || ""} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} /></div>
                                    <div className="space-y-2">
                                      <Label>類型</Label>
                                      <Select value={newActivity.type || "sightseeing"} onValueChange={(v) => setNewActivity({ ...newActivity, type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{activityTypes.map((t) => { const TI = t.icon; return <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2"><TI className="w-3.5 h-3.5" />{t.label}</span></SelectItem>; })}</SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="space-y-2"><Label>活動名稱</Label><Input placeholder="例：參觀東京鐵塔" value={newActivity.title || ""} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} /></div>
                                  <div className="space-y-2"><Label>地點</Label><Input placeholder="例：東京都港區" value={newActivity.location || ""} onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })} /></div>
                                  <div className="space-y-2"><Label>圖片 URL</Label><Input placeholder="https://..." value={newActivity.image || ""} onChange={(e) => setNewActivity({ ...newActivity, image: e.target.value })} /></div>
                                  <div className="space-y-2"><Label>備註</Label><Textarea placeholder="任何補充說明..." value={newActivity.notes || ""} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} rows={3} /></div>
                                  <Button className="w-full rounded-xl" onClick={() => addActivity(day.id)}>新增</Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {(flightBookings.length > 0 || hotelBookings.length > 0) && (
                              <Dialog open={showAddBooking === day.id} onOpenChange={(open) => setShowAddBooking(open ? day.id : null)}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="rounded-full gap-2 border-dashed"><Ticket className="w-3.5 h-3.5" />加入預訂</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>加入已預訂項目</DialogTitle></DialogHeader>
                                  <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                                    {flightBookings.filter((f) => f.status === "confirmed").map((fb, i) => (
                                      <button key={fb.id} className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors" onClick={() => addBookingToDay(day.id, "flight", i)}>
                                        <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{fb.airline} {fb.code}</span></div>
                                        <p className="text-xs text-muted-foreground mt-1">{fb.from} → {fb.to} | {fb.date}</p>
                                      </button>
                                    ))}
                                    {hotelBookings.filter((h) => h.status === "confirmed").map((hb, i) => (
                                      <button key={hb.id} className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors" onClick={() => addBookingToDay(day.id, "hotel", i)}>
                                        <div className="flex items-center gap-2"><Hotel className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{hb.hotelName}</span></div>
                                        <p className="text-xs text-muted-foreground mt-1">{hb.checkIn} ~ {hb.checkOut}</p>
                                      </button>
                                    ))}
                                    {flightBookings.length === 0 && hotelBookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">尚無已預訂的項目</p>}
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
        </div>
      </section>

      {/* Edit Activity Dialog */}
      <Dialog open={!!editingAct} onOpenChange={() => setEditingAct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>編輯活動</DialogTitle></DialogHeader>
          {editingAct && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>時間</Label><Input type="time" value={editForm.time || ""} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>類型</Label>
                <Select value={editForm.type || "sightseeing"} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{activityTypes.map((t) => { const TI = t.icon; return <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2"><TI className="w-3.5 h-3.5" />{t.label}</span></SelectItem>; })}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>活動名稱</Label><Input value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>地點</Label><Input value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></div>
              <div className="space-y-2"><Label>圖片 URL</Label><Input value={editForm.image || ""} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="https://..." /></div>
              {editForm.image && <img src={editForm.image} alt="" className="rounded-xl w-full h-32 object-cover" />}
              <div className="space-y-2"><Label>備註</Label><Textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} /></div>
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
              <div className="space-y-2"><Label>標題</Label><Input value={editDayForm.title} onChange={(e) => setEditDayForm({ ...editDayForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>日期</Label><Input type="date" value={editDayForm.date} onChange={(e) => setEditDayForm({ ...editDayForm, date: e.target.value })} /></div>
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
