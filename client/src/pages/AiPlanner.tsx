/*
 * Design: Organic Naturalism — AI Trip Planner
 * Uses Google Gemini API to generate travel itineraries
 */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, Send, Loader2, MapPin, Calendar, Clock, Camera,
  UtensilsCrossed, Hotel, Plane, Coffee, ShoppingBag, Music,
  Train, Bus, Footprints, Copy, Download, ChevronDown, ChevronUp,
  RefreshCw, Wand2, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface AiActivity {
  time: string;
  title: string;
  location: string;
  type: string;
  description: string;
  tips?: string;
}

interface AiDay {
  day: number;
  date: string;
  title: string;
  activities: AiActivity[];
}

interface AiItinerary {
  tripName: string;
  destination: string;
  days: AiDay[];
  tips: string[];
  budget: string;
}

const typeIcons: Record<string, typeof Camera> = {
  sightseeing: Camera, food: UtensilsCrossed, hotel: Hotel,
  transport: Plane, cafe: Coffee, shopping: ShoppingBag,
  entertainment: Music, train: Train, bus: Bus, walking: Footprints,
};

const travelStyles = [
  { value: "balanced", label: "均衡旅行" },
  { value: "culture", label: "文化深度" },
  { value: "food", label: "美食之旅" },
  { value: "nature", label: "自然探索" },
  { value: "adventure", label: "冒險體驗" },
  { value: "relaxation", label: "悠閒放鬆" },
  { value: "photography", label: "攝影之旅" },
  { value: "budget", label: "經濟實惠" },
  { value: "luxury", label: "奢華享受" },
];

const popularDestinations = [
  "東京", "大阪", "京都", "北海道", "沖繩", "首爾", "曼谷",
  "新加坡", "巴黎", "倫敦", "紐約", "羅馬", "巴塞隆納",
  "峇里島", "馬爾地夫", "雪梨", "溫哥華", "冰島",
];

export default function AiPlanner() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState("2026-05-01");
  const [style, setStyle] = useState("balanced");
  const [budget, setBudget] = useState("medium");
  const [specialRequests, setSpecialRequests] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<AiItinerary | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [streamText, setStreamText] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itinerary) {
      setExpandedDays(itinerary.days.map((d) => d.day));
    }
  }, [itinerary]);

  const generateItinerary = async () => {
    if (!destination.trim()) {
      toast.error("請輸入目的地");
      return;
    }
    setLoading(true);
    setItinerary(null);
    setStreamText("AI 正在為您規劃行程...");

    const styleLabel = travelStyles.find((s) => s.value === style)?.label || "均衡旅行";
    const budgetLabel = budget === "low" ? "經濟實惠" : budget === "medium" ? "中等預算" : "高端奢華";

    const prompt = `你是一位專業的旅行規劃師。請為以下旅行需求生成詳細的行程規劃：

目的地：${destination}
天數：${days}天
出發日期：${startDate}
旅行風格：${styleLabel}
預算等級：${budgetLabel}
旅客人數：${travelers}人
${specialRequests ? `特殊需求：${specialRequests}` : ""}

請以 JSON 格式回覆，格式如下（不要加 markdown 代碼塊標記）：
{
  "tripName": "行程名稱",
  "destination": "目的地",
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "第一天標題",
      "activities": [
        {
          "time": "09:00",
          "title": "活動名稱",
          "location": "地點",
          "type": "sightseeing|food|hotel|transport|cafe|shopping|entertainment|train|bus|walking",
          "description": "活動描述",
          "tips": "小提示（可選）"
        }
      ]
    }
  ],
  "tips": ["旅行小提示1", "旅行小提示2"],
  "budget": "預估總預算說明"
}

每天安排 5-7 個活動，包含交通、餐飲、景點、住宿等。時間要合理，活動之間要有足夠的移動時間。請用繁體中文回覆。`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Parse JSON from response (handle potential markdown code blocks)
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      // Also try to find raw JSON
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) {
        jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
      }

      const parsed: AiItinerary = JSON.parse(jsonStr);
      setItinerary(parsed);
      setStreamText("");
      toast.success("行程規劃完成！");

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err: any) {
      console.error("AI Error:", err);
      setStreamText("");
      toast.error("生成行程時發生錯誤，請重試");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const copyItinerary = () => {
    if (!itinerary) return;
    let text = `${itinerary.tripName}\n${"=".repeat(30)}\n\n`;
    itinerary.days.forEach((day) => {
      text += `📅 ${day.title} (${day.date})\n`;
      day.activities.forEach((act) => {
        text += `  ${act.time} - ${act.title} @ ${act.location}\n`;
        if (act.description) text += `    ${act.description}\n`;
      });
      text += "\n";
    });
    if (itinerary.tips.length > 0) {
      text += `💡 旅行小提示\n`;
      itinerary.tips.forEach((t) => (text += `  • ${t}\n`));
    }
    text += `\n💰 ${itinerary.budget}`;
    navigator.clipboard.writeText(text);
    toast.success("行程已複製到剪貼簿");
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type] || Camera;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/5 to-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  AI 行程規劃
                </h1>
                <p className="text-muted-foreground text-sm">
                  讓 AI 為你量身打造完美旅行計畫
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="sticky top-24 border-border/50">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">目的地</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="輸入目的地..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {popularDestinations.slice(0, 8).map((d) => (
                        <Badge
                          key={d}
                          variant={destination === d ? "default" : "outline"}
                          className="cursor-pointer rounded-full text-xs"
                          onClick={() => setDestination(d)}
                        >
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">出發日期</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        天數: {days} 天
                      </Label>
                      <Slider
                        value={[days]}
                        onValueChange={(v) => setDays(v[0])}
                        min={1}
                        max={14}
                        step={1}
                        className="mt-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">旅行風格</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {travelStyles.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">預算等級</Label>
                      <Select value={budget} onValueChange={setBudget}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">經濟實惠</SelectItem>
                          <SelectItem value="medium">中等預算</SelectItem>
                          <SelectItem value="high">高端奢華</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">旅客人數</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={travelers === 0 ? "" : String(travelers)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          setTravelers(v === "" ? 0 : parseInt(v));
                        }}
                        placeholder="1"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      特殊需求（選填）
                    </Label>
                    <Textarea
                      placeholder="例：素食者、帶小孩、想去特定景點..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    className="w-full rounded-xl h-12 gap-2 text-base"
                    onClick={generateItinerary}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI 規劃中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        生成行程
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Result Panel */}
            <div ref={resultRef}>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
                    {streamText}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    正在分析最佳路線與景點...
                  </p>
                </motion.div>
              )}

              {!loading && !itinerary && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    準備好出發了嗎？
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    填寫左側的旅行偏好，讓 AI 為你打造專屬的完美行程
                  </p>
                </motion.div>
              )}

              {itinerary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2
                            className="text-2xl font-bold"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {itinerary.tripName}
                          </h2>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {itinerary.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {itinerary.days.length} 天
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-1.5"
                            onClick={copyItinerary}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            複製
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-1.5"
                            onClick={generateItinerary}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            重新生成
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Days */}
                  {itinerary.days.map((day, i) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card className="border-border/50 overflow-hidden">
                        <button
                          className="w-full p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
                          onClick={() => toggleDay(day.day)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                D{day.day}
                              </span>
                            </div>
                            <div className="text-left">
                              <h3
                                className="font-bold text-sm"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {day.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {day.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-full text-xs"
                            >
                              {day.activities.length} 項活動
                            </Badge>
                            {expandedDays.includes(day.day) ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedDays.includes(day.day) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <CardContent className="pt-0 pb-4 px-4">
                                <div className="space-y-3 ml-5 border-l-2 border-primary/20 pl-4">
                                  {day.activities.map((act, j) => (
                                    <motion.div
                                      key={j}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        delay: j * 0.05,
                                      }}
                                      className="relative"
                                    >
                                      <div className="absolute -left-[1.35rem] top-2 w-2.5 h-2.5 rounded-full bg-primary/60 border-2 border-background" />
                                      <div className="bg-secondary/30 rounded-xl p-3 hover:bg-secondary/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                                            {getTypeIcon(act.type)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-xs font-mono text-primary">
                                                {act.time}
                                              </span>
                                              <h4 className="text-sm font-semibold truncate">
                                                {act.title}
                                              </h4>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                              <MapPin className="w-3 h-3 shrink-0" />
                                              <span className="truncate">
                                                {act.location}
                                              </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                              {act.description}
                                            </p>
                                            {act.tips && (
                                              <p className="text-xs text-primary/70 mt-1 italic">
                                                💡 {act.tips}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Tips & Budget */}
                  {(itinerary.tips.length > 0 || itinerary.budget) && (
                    <Card className="border-border/50">
                      <CardContent className="p-5 space-y-4">
                        {itinerary.tips.length > 0 && (
                          <div>
                            <h3
                              className="font-bold text-sm mb-3 flex items-center gap-2"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              旅行小提示
                            </h3>
                            <div className="space-y-2">
                              {itinerary.tips.map((tip, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="text-primary font-bold shrink-0">
                                    {i + 1}.
                                  </span>
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {itinerary.budget && (
                          <div className="pt-3 border-t border-border/50">
                            <h3
                              className="font-bold text-sm mb-2 flex items-center gap-2"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              💰 預估預算
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {itinerary.budget}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
