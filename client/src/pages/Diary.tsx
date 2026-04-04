/*
 * Design: Organic Naturalism — Travel Diary
 * - Journal-like layout with warm tones
 * - Photo + text entries
 * - Create new diary entries
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, MapPin, Calendar, Heart, MessageCircle, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  mood: string;
}

const sampleEntries: DiaryEntry[] = [
  {
    id: "1",
    title: "京都的秋日私語",
    date: "2025-11-15",
    location: "日本京都",
    content: "走在嵐山竹林的小徑上，陽光透過竹葉灑下斑駁的光影。秋天的京都，楓葉如火般燃燒，每一步都是一幅畫。在清水寺的舞台上遠眺整座城市，紅葉與古寺交織成最動人的風景。傍晚時分，走進祇園的石板路，偶遇一位身著和服的藝妓，那一刻彷彿穿越了時空。",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp",
    likes: 42,
    comments: 8,
    mood: "🍁",
  },
  {
    id: "2",
    title: "愛琴海的藍與白",
    date: "2025-09-20",
    location: "希臘聖托里尼",
    content: "聖托里尼的日落是我見過最美的。站在伊亞小鎮的懸崖邊，看著太陽緩緩沉入愛琴海，整片天空被染成了金色和粉紅色。白色的房屋在夕陽下閃耀著溫暖的光芒，藍色的穹頂與大海融為一體。這裡的每一個角落都是明信片般的風景。",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp",
    likes: 67,
    comments: 15,
    mood: "🌅",
  },
  {
    id: "3",
    title: "峇里島的晨間冥想",
    date: "2025-08-05",
    location: "印尼峇里島",
    content: "清晨五點，在烏布的梯田邊做瑜伽。晨霧繚繞在翠綠的稻田之間，遠處傳來寺廟的鐘聲。這是一種前所未有的寧靜，讓人忘記了所有的煩惱。午後，在叢林中的無邊際泳池裡，聽著蟬鳴和鳥叫，感受與大自然融為一體的美好。",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp",
    likes: 53,
    comments: 11,
    mood: "🧘",
  },
];

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(sampleEntries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<DiaryEntry>>({});

  const handleCreate = () => {
    if (!newEntry.title || !newEntry.content) {
      toast.error("請填寫標題與內容");
      return;
    }
    const entry: DiaryEntry = {
      id: `e${Date.now()}`,
      title: newEntry.title || "",
      date: new Date().toISOString().split("T")[0],
      location: newEntry.location || "未知地點",
      content: newEntry.content || "",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      likes: 0,
      comments: 0,
      mood: "✈️",
    };
    setEntries([entry, ...entries]);
    setNewEntry({});
    setDialogOpen(false);
    toast.success("日記已發布！");
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
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  旅遊日記
                </h1>
              </div>
              <p className="text-muted-foreground">
                記錄旅途中的每一份感動與回憶
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2" style={{ fontFamily: "var(--font-sans)" }}>
                  <Plus className="w-4 h-4" />
                  寫日記
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: "var(--font-display)" }}>撰寫新日記</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>標題</Label>
                    <Input
                      placeholder="為這篇日記取個名字..."
                      value={newEntry.title || ""}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>地點</Label>
                    <Input
                      placeholder="你在哪裡？"
                      value={newEntry.location || ""}
                      onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>內容</Label>
                    <Textarea
                      placeholder="寫下你的旅行故事..."
                      value={newEntry.content || ""}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2 border-dashed h-20"
                    onClick={() => toast.info("圖片上傳功能開發中")}
                  >
                    <ImagePlus className="w-5 h-5" />
                    上傳照片
                  </Button>
                  <Button className="w-full rounded-xl" onClick={handleCreate}>
                    發布日記
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="overflow-hidden organic-card border-border/50">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="text-3xl">{entry.mood}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
                        {entry.title}
                      </h2>
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {entry.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {entry.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <p className="text-foreground/80 leading-relaxed text-[15px]" style={{ fontFamily: "var(--font-body)" }}>
                      {entry.content}
                    </p>
                    <div className="leaf-divider" />
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors text-sm">
                        <Heart className="w-4 h-4" />
                        {entry.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
                        <MessageCircle className="w-4 h-4" />
                        {entry.comments}
                      </button>
                    </div>
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
