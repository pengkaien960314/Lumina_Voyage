/*
 * Design: Organic Naturalism — Travel Diary
 * - Like (heart) with animation, comments, visibility settings
 * - Date-based entries with friend/best-friend/public visibility
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, MapPin, Calendar, Heart, MessageCircle, ImagePlus, Globe, Users, Star, Send, ChevronDown, ChevronUp, Clock, Archive, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
}

interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  content: string;
  image: string;
  likes: number;
  liked: boolean;
  mood: string;
  visibility: "public" | "friends" | "bestFriends";
  comments: Comment[];
  author: string;
  authorAvatar: string;
  userId?: string;
}

const mockComments: Comment[][] = [
  [
    { id: "c1", author: "旅行達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=traveler1", text: "京都的秋天真的太美了！嵐山竹林是我的最愛", date: "2025-11-16" },
    { id: "c2", author: "美食家小王", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=foodie", text: "清水寺附近有家抹茶甜點店超推薦！", date: "2025-11-17" },
    { id: "c3", author: "攝影師阿明", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=photographer", text: "照片拍得好美，用什麼相機拍的？", date: "2025-11-18" },
  ],
  [
    { id: "c4", author: "海島控小美", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=island", text: "聖托里尼的日落真的是此生必看！", date: "2025-09-21" },
    { id: "c5", author: "背包客阿傑", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=backpacker", text: "推薦伊亞那邊的一家海鮮餐廳，超新鮮", date: "2025-09-22" },
  ],
  [
    { id: "c6", author: "瑜伽愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=yoga", text: "烏布的能量真的很特別，下次想去參加冥想營", date: "2025-08-06" },
    { id: "c7", author: "自然系小花", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=flower", text: "梯田的景色太療癒了！好想去", date: "2025-08-07" },
    { id: "c8", author: "旅遊部落客", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=blogger", text: "峇里島是我心中永遠的第一名度假勝地", date: "2025-08-08" },
    { id: "c9", author: "衝浪達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=surfer", text: "有去庫塔海灘衝浪嗎？那邊的浪超棒", date: "2025-08-09" },
  ],
];

const sampleEntries: DiaryEntry[] = [
  {
    id: "1", title: "京都的秋日私語", date: "2025-11-15", location: "日本京都",
    content: "走在嵐山竹林的小徑上，陽光透過竹葉灑下斑駁的光影。秋天的京都，楓葉如火般燃燒，每一步都是一幅畫。在清水寺的舞台上遠眺整座城市，紅葉與古寺交織成最動人的風景。傍晚時分，走進祇園的石板路，偶遇一位身著和服的藝妓，那一刻彷彿穿越了時空。",
    image: "/images/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp",
    likes: 42, liked: false, mood: "🍁", visibility: "public", comments: mockComments[0],
    author: "旅行者小林", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi",
  },
  {
    id: "2", title: "愛琴海的藍與白", date: "2025-09-20", location: "希臘聖托里尼",
    content: "聖托里尼的日落是我見過最美的。站在伊亞小鎮的懸崖邊，看著太陽緩緩沉入愛琴海，整片天空被染成了金色和粉紅色。白色的房屋在夕陽下閃耀著溫暖的光芒，藍色的穹頂與大海融為一體。這裡的每一個角落都是明信片般的風景。",
    image: "/images/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp",
    likes: 67, liked: true, mood: "🌅", visibility: "friends", comments: mockComments[1],
    author: "攝影師小陳", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chen",
  },
  {
    id: "3", title: "峇里島的晨間冥想", date: "2025-08-05", location: "印尼峇里島",
    content: "清晨五點，在烏布的梯田邊做瑜伽。晨霧繚繞在翠綠的稻田之間，遠處傳來寺廟的鐘聲。這是一種前所未有的寧靜，讓人忘記了所有的煩惱。午後，在叢林中的無邊際泳池裡，聽著蟬鳴和鳥叫，感受與大自然融為一體的美好。",
    image: "/images/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp",
    likes: 53, liked: false, mood: "🧘", visibility: "bestFriends", comments: mockComments[2],
    author: "花草控小美", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mei",
  },
];

const visibilityOptions = [
  { value: "public", label: "所有人可見", icon: Globe },
  { value: "friends", label: "好友可見", icon: Users },
  { value: "bestFriends", label: "摯友可見", icon: Star },
];

const historyEntries: DiaryEntry[] = [
  {
    id: "h1", title: "北海道的冬日童話", date: "2024-12-20", location: "日本北海道",
    content: "小樽運河的雪景如夢似幻，運河兩旁的石造倉庫在白雪覆蓋下格外浪漫。走在堺町通，品嚐了著名的 LeTAO 雙層起司蛋糕，入口即化的口感讓人難忘。晚上泡了登別的溫泉，在零下的氣溫中享受露天風呂，看著雪花飄落在溫泉水面上，這就是冬天的北海道。",
    image: "https://images.unsplash.com/photo-1551009175-15bdf9dcb580?w=800&q=80",
    likes: 89, liked: true, mood: "❄️", visibility: "public", comments: [
      { id: "hc1", author: "雪國愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=snow", text: "小樽運河的夜景超美的！", date: "2024-12-21" },
    ],
    author: "旅行者小林", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi",
  },
  {
    id: "h2", title: "倫敦的雨天漫步", date: "2024-10-05", location: "英國倫敦",
    content: "倫敦的秋天總是帶著一絲憂鬱的美。撐著傘走過泰晤士河畔，大笨鐘在雨霧中若隱若現。在Borough Market品嚐了正宗的Fish & Chips，外酥內嫩。下午在大英博物館待了整整三個小時，羅塞塔石碑和埃及木乃伊讓人嘆為觀止。",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    likes: 56, liked: false, mood: "🌧️", visibility: "friends", comments: [
      { id: "hc2", author: "英倫控", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=london", text: "Borough Market 的美食真的超多選擇！", date: "2024-10-06" },
      { id: "hc3", author: "博物館迷", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=museum", text: "大英博物館可以逛一整天都不夠", date: "2024-10-07" },
    ],
    author: "攝影師小陳", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chen",
  },
  {
    id: "h3", title: "紐約的不夜城", date: "2024-07-15", location: "美國紐約",
    content: "時代廣場的霓虹燈讓人目眩神迷，即使是深夜也人潮洶湧。在中央公園慢跑，感受這座城市難得的寧靜。登上帝國大廈的觀景台，俯瞰整個曼哈頓的天際線，那一刻真的覺得紐約是世界的中心。晚上在百老匯看了《歌劇魅影》，被震撼到說不出話。",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    likes: 73, liked: true, mood: "🗽", visibility: "public", comments: [
      { id: "hc4", author: "百老匯迷", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=broadway", text: "歌劇魅影真的是必看！", date: "2024-07-16" },
    ],
    author: "花草控小美", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mei",
  },
  {
    id: "h4", title: "首爾的美食之旅", date: "2024-04-10", location: "韓國首爾",
    content: "明洞的街頭小吃讓人停不下來，辣炒年糕、魚板串、雞蛋糕⋯⋯每一樣都好吃到不行。在北村韓屋村穿了韓服拍照，傳統建築配上春天的櫻花，美得像畫一樣。晚上去了弘大的夜市，看了街頭表演，感受首爾年輕人的活力。",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80",
    likes: 61, liked: false, mood: "🍜", visibility: "bestFriends", comments: [],
    author: "旅行者小林", authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi",
  },
];

export default function Diary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>(sampleEntries);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "friends" | "bestFriends">("public");
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [bookmarked, setBookmarked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("lumina_diary_bookmarks") || "[]"); } catch { return []; }
  });

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem("lumina_diary_bookmarks", JSON.stringify(next));
      if (next.includes(id)) toast.success("已收藏此日記");
      else toast.info("已取消收藏");
      return next;
    });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const stored = localStorage.getItem(`wanderlust_user_diaries_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries([...parsed, ...sampleEntries]);
      } catch { /* ignore */ }
    }
  }, [user?.id]);

  const toggleLike = (id: string) => {
    setEntries((prev) => prev.map((d) => d.id === id ? { ...d, liked: !d.liked, likes: d.liked ? d.likes - 1 : d.likes + 1 } : d));
  };

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const addComment = (diaryId: string) => {
    const text = commentInputs[diaryId]?.trim();
    if (!text) return;
    const newComment: Comment = { id: `c${Date.now()}`, author: user?.name || "我", avatar: user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=me", text, date: new Date().toISOString().split("T")[0] };
    setEntries((prev) => prev.map((d) => d.id === diaryId ? { ...d, comments: [...d.comments, newComment] } : d));
    setCommentInputs((prev) => ({ ...prev, [diaryId]: "" }));
    toast.success("留言已發送");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("圖片大小不能超過 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewImage(ev.target?.result as string);
      toast.success("圖片已上傳");
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error("請填寫標題與內容"); return; }
    const authorName = user?.name || "我";
    const authorAv = user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=me";
    const userId = user?.id || "anonymous";
    const entry: DiaryEntry = {
      id: `e${Date.now()}`, title: newTitle, date: new Date().toISOString().split("T")[0],
      location: newLocation || "未知地點", content: newContent,
      image: newImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      likes: 0, liked: false, mood: "✈️", visibility: newVisibility, comments: [],
      author: authorName, authorAvatar: authorAv, userId,
    };
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    const userEntries = newEntries.filter(e => (e as any).userId === userId);
    localStorage.setItem(`wanderlust_user_diaries_${userId}`, JSON.stringify(userEntries));
    setNewTitle(""); setNewContent(""); setNewLocation(""); setNewImage(""); setNewVisibility("public");
    setDialogOpen(false);
    toast.success("日記已發布！");
  };

  const getVisibilityBadge = (v: string) => {
    const opt = visibilityOptions.find((o) => o.value === v);
    if (!opt) return null;
    const Icon = opt.icon;
    const colors: Record<string, string> = { public: "bg-emerald-500/10 text-emerald-600 border-emerald-200", friends: "bg-blue-500/10 text-blue-600 border-blue-200", bestFriends: "bg-amber-500/10 text-amber-600 border-amber-200" };
    return <Badge variant="outline" className={`rounded-full text-[10px] gap-1 px-2 py-0.5 ${colors[v] || ""}`}><Icon className="w-3 h-3" />{opt.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>旅遊日記</h1>
              </div>
              <p className="text-muted-foreground">記錄旅途中的每一份感動與回憶</p>
              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setActiveTab("current")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "current" ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground hover:bg-accent"}`}>
                  <BookOpen className="w-4 h-4" />最新日記
                </button>
                <button onClick={() => setActiveTab("history")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground hover:bg-accent"}`}>
                  <Archive className="w-4 h-4" />歷史日記
                </button>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2" style={{ fontFamily: "var(--font-sans)" }}><Plus className="w-4 h-4" />寫日記</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>撰寫新日記</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>標題</Label>
                    <Input placeholder="為這篇日記取個名字..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>地點</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="你在哪裡？" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="pl-10 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>可見度</Label>
                    <Select value={newVisibility} onValueChange={(v) => setNewVisibility(v as any)}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            <span className="flex items-center gap-2"><o.icon className="w-4 h-4" />{o.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>內容</Label>
                    <Textarea placeholder="寫下你的旅行故事..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={6} className="rounded-xl" />
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" className="w-full rounded-xl gap-2 border-dashed h-20" onClick={() => fileInputRef.current?.click()}>
                    {newImage ? <img src={newImage} alt="preview" className="w-10 h-10 rounded-lg object-cover" /> : <ImagePlus className="w-5 h-5" />}
                    {newImage ? "更換照片" : "上傳照片"}
                  </Button>
                  <Button className="w-full rounded-xl" onClick={handleCreate}>發布日記</Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-2xl">
          {activeTab === "history" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {user ? `${user.name} 的旅行回憶` : "過往旅行回憶"}
                </h2>
              </div>
              {(() => {
                const userId = user?.id;
                const count = userId ? entries.filter(e => (e as any).userId === userId).length : 0;
                return count === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">還沒有寫過日記</p>
                    <p className="text-sm mt-1">點擊右上角「寫日記」開始記錄你的旅行吧！</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
          <div className="space-y-6">
            {(activeTab === "current" ? entries : (() => {
              const userId = user?.id;
              return userId ? entries.filter(e => (e as any).userId === userId) : [];
            })()).map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="overflow-hidden organic-card border-border/50">
                  {/* Author Header */}
                  <div className="p-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={entry.authorAvatar} />
                        <AvatarFallback>{entry.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{entry.author}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />{entry.date}
                          <span className="text-border">·</span>
                          <MapPin className="w-3 h-3" />{entry.location}
                        </div>
                      </div>
                    </div>
                    {getVisibilityBadge(entry.visibility)}
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4"><span className="text-3xl">{entry.mood}</span></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{entry.title}</h2>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <p className="text-foreground/80 leading-relaxed text-[15px] mb-4" style={{ fontFamily: "var(--font-body)" }}>{entry.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-5 py-3 border-t border-b border-border/30">
                      <button className="flex items-center gap-2 group" onClick={() => toggleLike(entry.id)}>
                        <motion.div whileTap={{ scale: 1.3 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                          <Heart className={`w-5 h-5 transition-all duration-300 ${entry.liked ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-red-400"}`} />
                        </motion.div>
                        <span className={`text-sm font-medium ${entry.liked ? "text-red-500" : "text-muted-foreground"}`}>{entry.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors" onClick={() => toggleComments(entry.id)}>
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{entry.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-2 ml-auto group" onClick={() => toggleBookmark(entry.id)}>
                        <motion.div whileTap={{ scale: 1.3 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                          <Bookmark className={`w-5 h-5 transition-all duration-300 ${bookmarked.includes(entry.id) ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                        </motion.div>
                      </button>
                    </div>

                    {/* Comments Toggle */}
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors" onClick={() => toggleComments(entry.id)}>
                      {expandedComments.includes(entry.id) ? <><ChevronUp className="w-3.5 h-3.5" />收起</> : <><ChevronDown className="w-3.5 h-3.5" />留言 ({entry.comments.length})</>}
                    </button>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {expandedComments.includes(entry.id) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <div className="mt-3 space-y-3">
                            {entry.comments.map((c) => (
                              <div key={c.id} className="flex gap-2.5">
                                <Avatar className="w-7 h-7 shrink-0">
                                  <AvatarImage src={c.avatar} />
                                  <AvatarFallback className="text-[10px]">{c.author[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-secondary/50 rounded-2xl rounded-tl-sm p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold">{c.author}</span>
                                    <span className="text-[10px] text-muted-foreground">{c.date}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Input
                              placeholder="寫下你的留言..."
                              value={commentInputs[entry.id] || ""}
                              onChange={(e) => setCommentInputs((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && addComment(entry.id)}
                              className="rounded-xl text-sm h-9"
                            />
                            <Button size="sm" className="rounded-xl h-9 px-3 shrink-0" onClick={() => addComment(entry.id)}>
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
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
