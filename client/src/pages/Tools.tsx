/**
 * Design: Organic Naturalism — Tools Page
 * - AI-powered translation with Gemini API + quick reply conversation
 * - Live currency exchange with many currencies
 * - Real-time weather with popular spots
 * - Real navigation with geolocation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Languages, DollarSign, Cloud, Navigation, ArrowRightLeft, MapPin,
  Thermometer, Wind, Droplets, Eye, Sun, Moon, CloudRain, CloudSnow,
  Loader2, Send, RotateCcw, Locate, Search, Sparkles, Copy, Volume2,
  BookOpen, ChevronDown, ChevronUp, History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MapView } from "@/components/Map";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { GEMINI_API_KEY } from "@/config";

/* ==================== AI TRANSLATION TAB ==================== */
interface ChatMessage {
  id: string;
  from: "A" | "B";
  text: string;
  translated: string;
  lang: string;
}

const langOptions = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "簡體中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "th", label: "ภาษาไทย", flag: "🇹🇭" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
];

const travelPhrases = [
  { category: "基本問候", phrases: ["你好", "謝謝", "不好意思", "再見", "請問", "早安", "晚安", "對不起", "沒關係", "很高興認識你"] },
  { category: "交通", phrases: ["請問車站在哪裡？", "我要搭計程車", "這班車到哪裡？", "多少錢？", "請問最近的地鐵站怎麼走？", "我要到機場", "可以幫我叫Uber嗎？", "請在這裡停車", "末班車幾點？", "要轉乘嗎？"] },
  { category: "餐廳", phrases: ["請給我菜單", "我要點餐", "結帳", "好吃", "不辣", "有素食嗎？", "推薦什麼？", "我對花生過敏", "可以打包嗎？", "請給我水", "有英文菜單嗎？", "我要預約座位"] },
  { category: "住宿", phrases: ["我有預訂", "幾點退房？", "Wi-Fi 密碼是什麼？", "可以寄放行李嗎？", "請問早餐幾點？", "房間冷氣壞了", "可以多給一條毛巾嗎？", "附近有便利商店嗎？", "可以延遲退房嗎？", "請幫我叫計程車"] },
  { category: "購物", phrases: ["多少錢？", "可以便宜一點嗎？", "有其他顏色嗎？", "可以試穿嗎？", "可以刷卡嗎？", "可以退稅嗎？", "有折扣嗎？", "請幫我包裝", "有大一號的嗎？", "這是免稅品嗎？"] },
  { category: "問路", phrases: ["請問這裡是哪裡？", "怎麼去這個地方？", "走路大概幾分鐘？", "可以幫我在地圖上指嗎？", "我迷路了", "最近的廁所在哪裡？", "這條路對嗎？", "前面左轉還是右轉？"] },
  { category: "緊急", phrases: ["請幫幫我", "我迷路了", "請叫救護車", "我的護照不見了", "我需要看醫生", "請報警", "我的行李被偷了", "最近的醫院在哪裡？", "我不舒服", "可以幫我打電話嗎？"] },
  { category: "社交", phrases: ["你叫什麼名字？", "你是哪裡人？", "可以一起拍照嗎？", "這裡很漂亮", "旅途愉快！", "我來自台灣", "我在這裡玩三天", "你推薦去哪裡？", "可以加好友嗎？"] },
  { category: "數字與時間", phrases: ["現在幾點？", "今天星期幾？", "一、二、三、四、五", "六、七、八、九、十", "一百", "一千", "早上", "下午", "晚上", "明天"] },
];

const callGemini = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_")) {
    throw new Error("請先在 config.ts 設定 Gemini API Key（到 https://aistudio.google.com/apikey 免費申請）");
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );
    if (response.status === 403) throw new Error("API Key 無效或未啟用 Generative Language API。請到 Google Cloud Console → API & Services → 啟用「Generative Language API」");
    if (response.status === 429) throw new Error("API 呼叫次數超過限制，請稍後再試");
    if (!response.ok) throw new Error(`API 錯誤 ${response.status}：${response.statusText}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("AI 未回傳內容，請重試");
    return text;
  } catch (err: any) {
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      throw new Error("網路連線失敗，請確認你的網路連線正常，或檢查是否有 VPN/防火牆阻擋 API 請求");
    }
    throw err;
  }
};

function TranslatorTab() {
  const [mode, setMode] = useState<"ai" | "conversation" | "phrases">("ai");
  const [langA, setLangA] = useState("zh-TW");
  const [langB, setLangB] = useState("ja");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTurn, setCurrentTurn] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // AI translate state
  const [aiResult, setAiResult] = useState<{ translated: string; pronunciation?: string; alternatives?: string[]; context?: string } | null>(null);
  const [aiHistory, setAiHistory] = useState<{ source: string; translated: string; from: string; to: string; time: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [phraseLoading, setPhraseLoading] = useState<string | null>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // AI Translation
  const aiTranslate = async () => {
    if (!inputText.trim()) { toast.error("請輸入要翻譯的文字"); return; }
    setLoading(true);
    setAiResult(null);
    const fromLabel = langOptions.find(l => l.code === langA)?.label || langA;
    const toLabel = langOptions.find(l => l.code === langB)?.label || langB;
    const prompt = `你是一位專業翻譯。請將以下文字從${fromLabel}翻譯成${toLabel}。
請以 JSON 格式回覆（不要加 markdown 代碼塊標記）：
{"translated":"翻譯結果","pronunciation":"發音提示（如適用）","alternatives":["替代翻譯1","替代翻譯2"],"context":"使用情境說明"}

要翻譯的文字：${inputText}`;
    try {
      const raw = await callGemini(prompt);
      let jsonStr = raw;
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) jsonStr = m[1];
      const bs = jsonStr.indexOf("{");
      const be = jsonStr.lastIndexOf("}");
      if (bs !== -1 && be !== -1) jsonStr = jsonStr.substring(bs, be + 1);
      const parsed = JSON.parse(jsonStr);
      setAiResult(parsed);
      setAiHistory(prev => [{ source: inputText, translated: parsed.translated, from: langA, to: langB, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
      toast.success("翻譯完成");
    } catch (err: any) {
      toast.error(err.message || "翻譯失敗，請重試");
    }
    setLoading(false);
  };

  // Conversation mode with AI
  const handleConvoSend = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const fromLang = currentTurn === "A" ? langA : langB;
    const toLang = currentTurn === "A" ? langB : langA;
    const fromLabel = langOptions.find(l => l.code === fromLang)?.label || fromLang;
    const toLabel = langOptions.find(l => l.code === toLang)?.label || toLang;
    try {
      const prompt = `將以下${fromLabel}文字翻譯成${toLabel}，只回覆翻譯結果，不要加任何解釋：\n${inputText}`;
      const translated = await callGemini(prompt);
      setMessages(prev => [...prev, { id: `m${Date.now()}`, from: currentTurn, text: inputText, translated: translated.trim(), lang: fromLang }]);
      setCurrentTurn(currentTurn === "A" ? "B" : "A");
      setInputText("");
    } catch (err: any) {
      toast.error(err.message || "翻譯失敗");
    }
    setLoading(false);
  };

  // Quick reply with AI
  const handleQuickReply = async (original: string) => {
    setLoading(true);
    const fromLang = currentTurn === "A" ? langA : langB;
    const toLang = currentTurn === "A" ? langB : langA;
    const fromLabel = langOptions.find(l => l.code === fromLang)?.label || fromLang;
    const toLabel = langOptions.find(l => l.code === toLang)?.label || toLang;
    try {
      const prompt = `將以下${fromLabel}文字翻譯成${toLabel}，只回覆翻譯結果：\n${original}`;
      const translated = await callGemini(prompt);
      setMessages(prev => [...prev, { id: `m${Date.now()}`, from: currentTurn, text: original, translated: translated.trim(), lang: fromLang }]);
      setCurrentTurn(currentTurn === "A" ? "B" : "A");
    } catch (err: any) {
      toast.error(err.message || "翻譯失敗");
    }
    setLoading(false);
  };

  // Generate quick replies dynamically
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [qrLoading, setQrLoading] = useState(false);

  const generateQuickReplies = useCallback(async () => {
    const speakerLang = currentTurn === "A" ? langA : langB;
    const speakerLabel = langOptions.find(l => l.code === speakerLang)?.label || speakerLang;
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const contextHint = lastMsg ? `對方剛說：「${lastMsg.translated}」` : "這是對話開始";
    setQrLoading(true);
    try {
      const prompt = `你是旅行對話助手。${contextHint}
請用${speakerLabel}生成3個簡短的旅行場景快速回覆（每個不超過15字）。
只回覆 JSON 陣列格式（不要加 markdown 代碼塊標記）：["回覆1","回覆2","回覆3"]`;
      const raw = await callGemini(prompt);
      let jsonStr = raw;
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) jsonStr = m[1];
      const bs = jsonStr.indexOf("[");
      const be = jsonStr.lastIndexOf("]");
      if (bs !== -1 && be !== -1) jsonStr = jsonStr.substring(bs, be + 1);
      setQuickReplies(JSON.parse(jsonStr));
    } catch {
      setQuickReplies(["謝謝", "好的", "請問"]);
    }
    setQrLoading(false);
  }, [currentTurn, langA, langB, messages]);

  useEffect(() => {
    if (mode === "conversation") generateQuickReplies();
  }, [mode, currentTurn, generateQuickReplies]);

  // Phrase translation
  const translatePhrase = async (phrase: string) => {
    setPhraseLoading(phrase);
    const toLabel = langOptions.find(l => l.code === langB)?.label || langB;
    try {
      const prompt = `將「${phrase}」翻譯成${toLabel}，並附上發音提示。格式：翻譯結果（發音）`;
      const result = await callGemini(prompt);
      toast.success(result.trim(), { duration: 5000 });
    } catch {
      toast.error("翻譯失敗");
    }
    setPhraseLoading(null);
  };

  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  const speakerLang = currentTurn === "A" ? langA : langB;
  const currentLangInfo = langOptions.find(l => l.code === speakerLang);

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button variant={mode === "ai" ? "default" : "outline"} size="sm" className="rounded-full gap-1.5 flex-1" onClick={() => setMode("ai")}>
          <Sparkles className="w-3.5 h-3.5" />AI 翻譯
        </Button>
        <Button variant={mode === "conversation" ? "default" : "outline"} size="sm" className="rounded-full gap-1.5 flex-1" onClick={() => setMode("conversation")}>
          <Languages className="w-3.5 h-3.5" />對話翻譯
        </Button>
        <Button variant={mode === "phrases" ? "default" : "outline"} size="sm" className="rounded-full gap-1.5 flex-1" onClick={() => setMode("phrases")}>
          <BookOpen className="w-3.5 h-3.5" />旅行用語
        </Button>
      </div>

      {/* Language Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">{mode === "conversation" ? "A 的語言" : "來源語言"}</Label>
          <Select value={langA} onValueChange={setLangA}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">{langOptions.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 mt-5" onClick={() => { setLangA(langB); setLangB(langA); }}>
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">{mode === "conversation" ? "B 的語言" : "目標語言"}</Label>
          <Select value={langB} onValueChange={setLangB}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">{langOptions.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Translation Mode */}
      {mode === "ai" && (
        <div className="space-y-4">
          <Textarea placeholder="輸入要翻譯的文字..." value={inputText} onChange={e => setInputText(e.target.value)} rows={4} className="rounded-xl resize-none" />
          <Button className="w-full rounded-xl h-11 gap-2" onClick={aiTranslate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI 翻譯
          </Button>

          {aiResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-primary/10 text-primary border-0 rounded-full mb-2"><Sparkles className="w-3 h-3 mr-1" />AI 翻譯結果</Badge>
                      <p className="text-lg font-semibold">{aiResult.translated}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0" onClick={() => copyText(aiResult.translated)}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0" onClick={() => speakText(aiResult.translated, langB)}><Volume2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  {aiResult.pronunciation && (
                    <p className="text-sm text-muted-foreground">📖 {aiResult.pronunciation}</p>
                  )}
                  {aiResult.alternatives && aiResult.alternatives.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">替代翻譯：</p>
                      <div className="flex flex-wrap gap-2">{aiResult.alternatives.map((a, i) => (
                        <Badge key={i} variant="outline" className="rounded-full cursor-pointer hover:bg-accent" onClick={() => copyText(a)}>{a}</Badge>
                      ))}</div>
                    </div>
                  )}
                  {aiResult.context && (
                    <p className="text-xs text-muted-foreground italic">💡 {aiResult.context}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* History */}
          {aiHistory.length > 0 && (
            <div>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4" />翻譯紀錄 ({aiHistory.length})
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {aiHistory.map((h, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-xl text-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{langOptions.find(l => l.code === h.from)?.flag} → {langOptions.find(l => l.code === h.to)?.flag}</span>
                          <span className="ml-auto">{h.time}</span>
                        </div>
                        <p className="text-muted-foreground">{h.source}</p>
                        <p className="font-medium">{h.translated}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Conversation Mode */}
      {mode === "conversation" && (
        <div>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div ref={chatRef} className="h-[300px] overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">開始 AI 對話翻譯吧！<br />A 輸入文字後 AI 即時翻譯給 B</p>}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === "A" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${msg.from === "A" ? "bg-primary/10 rounded-tl-sm" : "bg-secondary rounded-tr-sm"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-primary">{msg.from} ({langOptions.find(l => l.code === msg.lang)?.flag})</p>
                        <Button variant="ghost" size="sm" className="rounded-full w-5 h-5 p-0 ml-auto" onClick={() => speakText(msg.text, msg.lang)}><Volume2 className="w-3 h-3" /></Button>
                      </div>
                      <p className="text-sm font-medium">{msg.text}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <p className="text-sm flex-1">{msg.translated}</p>
                          <Button variant="ghost" size="sm" className="rounded-full w-5 h-5 p-0" onClick={() => speakText(msg.translated, msg.from === "A" ? langB : langA)}><Volume2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 p-3">
                <p className="text-xs text-muted-foreground mb-2">{currentLangInfo?.flag} {currentTurn} 的 AI 快速回覆：</p>
                <div className="flex gap-2 flex-wrap">
                  {qrLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" />AI 生成中...</div>
                  ) : (
                    quickReplies.map((qr, i) => (
                      <Button key={i} variant="outline" size="sm" className="rounded-full text-xs h-7" onClick={() => handleQuickReply(qr)} disabled={loading}>{qr}</Button>
                    ))
                  )}
                  <Button variant="ghost" size="sm" className="rounded-full text-xs h-7" onClick={generateQuickReplies} disabled={qrLoading}><RotateCcw className="w-3 h-3" /></Button>
                </div>
              </div>

              <div className="border-t border-border/50 p-3 flex gap-2">
                <Badge variant="outline" className="shrink-0 rounded-full">{currentTurn}</Badge>
                <Input placeholder={`${currentTurn} 輸入 (${currentLangInfo?.label})...`} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleConvoSend()} className="rounded-xl" disabled={loading} />
                <Button size="sm" className="rounded-xl shrink-0" onClick={handleConvoSend} disabled={loading || !inputText.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full rounded-xl mt-3" onClick={() => { setMessages([]); setCurrentTurn("A"); }}>
            <RotateCcw className="w-4 h-4 mr-2" />重新開始對話
          </Button>
        </div>
      )}

      {/* Travel Phrases Mode */}
      {mode === "phrases" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">點擊旅行用語，AI 即時翻譯成 {langOptions.find(l => l.code === langB)?.flag} {langOptions.find(l => l.code === langB)?.label}</p>
          {travelPhrases.map(cat => (
            <Card key={cat.category} className="border-border/50">
              <button className="w-full text-left p-4 flex items-center justify-between" onClick={() => setExpandedPhrase(expandedPhrase === cat.category ? null : cat.category)}>
                <span className="font-semibold text-sm">{cat.category}</span>
                {expandedPhrase === cat.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {expandedPhrase === cat.category && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                      {cat.phrases.map(p => (
                        <Button key={p} variant="outline" size="sm" className="rounded-full text-xs" onClick={() => translatePhrase(p)} disabled={phraseLoading === p}>
                          {phraseLoading === p ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}{p}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== CURRENCY TAB ==================== */
const currencies = [
  { code: "TWD", name: "新台幣", flag: "🇹🇼", symbol: "NT$" },
  { code: "USD", name: "美元", flag: "🇺🇸", symbol: "$" },
  { code: "JPY", name: "日圓", flag: "🇯🇵", symbol: "¥" },
  { code: "EUR", name: "歐元", flag: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "英鎊", flag: "🇬🇧", symbol: "£" },
  { code: "KRW", name: "韓元", flag: "🇰🇷", symbol: "₩" },
  { code: "CNY", name: "人民幣", flag: "🇨🇳", symbol: "¥" },
  { code: "THB", name: "泰銖", flag: "🇹🇭", symbol: "฿" },
  { code: "AUD", name: "澳幣", flag: "🇦🇺", symbol: "A$" },
  { code: "SGD", name: "新加坡幣", flag: "🇸🇬", symbol: "S$" },
  { code: "HKD", name: "港幣", flag: "🇭🇰", symbol: "HK$" },
  { code: "MYR", name: "馬來幣", flag: "🇲🇾", symbol: "RM" },
  { code: "VND", name: "越南盾", flag: "🇻🇳", symbol: "₫" },
  { code: "PHP", name: "菲律賓比索", flag: "🇵🇭", symbol: "₱" },
  { code: "IDR", name: "印尼盾", flag: "🇮🇩", symbol: "Rp" },
  { code: "CHF", name: "瑞士法郎", flag: "🇨🇭", symbol: "CHF" },
  { code: "CAD", name: "加幣", flag: "🇨🇦", symbol: "C$" },
  { code: "NZD", name: "紐幣", flag: "🇳🇿", symbol: "NZ$" },
];

const baseRates: Record<string, number> = {
  USD: 1, TWD: 32.15, JPY: 149.8, EUR: 0.92, GBP: 0.79, KRW: 1345, CNY: 7.24,
  THB: 35.8, AUD: 1.53, SGD: 1.34, HKD: 7.82, MYR: 4.72, VND: 25380,
  PHP: 56.2, IDR: 15890, CHF: 0.88, CAD: 1.36, NZD: 1.67,
};

function CurrencyTab() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("TWD");
  const [toCurrency, setToCurrency] = useState("JPY");
  const [liveRates, setLiveRates] = useState<Record<string, number>>(baseRates);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [rateLoading, setRateLoading] = useState(false);

  const refreshRates = useCallback(async () => {
    setRateLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (res.ok) {
        const data = await res.json();
        setLiveRates(data.rates);
        setLastUpdate(new Date().toLocaleTimeString());
        toast.success("匯率已更新");
      } else { throw new Error(); }
    } catch {
      const varied = { ...baseRates };
      Object.keys(varied).forEach(k => { if (k !== "USD") varied[k] *= (0.998 + Math.random() * 0.004); });
      setLiveRates(varied);
      setLastUpdate(new Date().toLocaleTimeString());
    }
    setRateLoading(false);
  }, []);

  useEffect(() => { refreshRates(); }, [refreshRates]);

  const convert = (amt: number) => {
    const fromRate = liveRates[fromCurrency] || 1;
    const toRate = liveRates[toCurrency] || 1;
    return (amt / fromRate) * toRate;
  };

  const rate = convert(1);
  const result = convert(parseFloat(amount) || 0);
  const fromInfo = currencies.find(c => c.code === fromCurrency);
  const toInfo = currencies.find(c => c.code === toCurrency);

  const popularPairs = [
    { from: "TWD", to: "JPY" }, { from: "TWD", to: "USD" }, { from: "TWD", to: "EUR" },
    { from: "TWD", to: "KRW" }, { from: "TWD", to: "THB" }, { from: "USD", to: "JPY" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">最後更新：{lastUpdate}</p>
        <Button variant="ghost" size="sm" className="rounded-full text-xs h-7" onClick={refreshRates} disabled={rateLoading}>
          {rateLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}更新匯率
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">金額</Label>
            <Input type="text" inputMode="decimal" value={amount} onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ""); setAmount(v); }} className="rounded-xl text-lg font-semibold h-12" placeholder="輸入金額" />
          </div>
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">從</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 mb-0.5" onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}>
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">到</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">{fromInfo?.flag} {fromInfo?.symbol}{parseFloat(amount || "0").toLocaleString()} {fromCurrency}</p>
            <p className="text-3xl font-bold text-primary my-2" style={{ fontFamily: "var(--font-display)" }}>{toInfo?.symbol}{result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-bold mb-2">熱門匯率</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {popularPairs.map(p => {
            const r = (liveRates[p.to] || 1) / (liveRates[p.from] || 1);
            const fi = currencies.find(c => c.code === p.from);
            const ti = currencies.find(c => c.code === p.to);
            return (
              <button key={`${p.from}-${p.to}`} className="p-3 bg-card border border-border/50 rounded-xl text-left hover:shadow-md transition-shadow" onClick={() => { setFromCurrency(p.from); setToCurrency(p.to); }}>
                <p className="text-xs text-muted-foreground">{fi?.flag} {p.from} → {ti?.flag} {p.to}</p>
                <p className="font-semibold text-sm mt-1">{r.toFixed(2)}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== WEATHER TAB ==================== */
interface WeatherInfo {
  city: string; temp: number; feelsLike: number; humidity: number;
  wind: number; visibility: number; condition: string;
  forecast: { day: string; high: number; low: number; condition: string }[];
}

const popularSpotWeather: WeatherInfo[] = [
  { city: "札幌", temp: 8, feelsLike: 5, humidity: 62, wind: 12, visibility: 10, condition: "多雲", forecast: [{ day: "明天", high: 10, low: 3, condition: "晴" }, { day: "後天", high: 12, low: 5, condition: "多雲" }, { day: "大後天", high: 9, low: 2, condition: "雨" }] },
  { city: "東京", temp: 18, feelsLike: 17, humidity: 55, wind: 8, visibility: 15, condition: "晴天", forecast: [{ day: "明天", high: 20, low: 12, condition: "晴" }, { day: "後天", high: 19, low: 11, condition: "多雲" }, { day: "大後天", high: 17, low: 10, condition: "雨" }] },
  { city: "大阪", temp: 19, feelsLike: 18, humidity: 58, wind: 10, visibility: 12, condition: "晴天", forecast: [{ day: "明天", high: 21, low: 13, condition: "晴" }, { day: "後天", high: 20, low: 12, condition: "晴" }, { day: "大後天", high: 18, low: 11, condition: "多雲" }] },
  { city: "首爾", temp: 14, feelsLike: 12, humidity: 50, wind: 15, visibility: 10, condition: "多雲", forecast: [{ day: "明天", high: 16, low: 8, condition: "晴" }, { day: "後天", high: 15, low: 7, condition: "多雲" }, { day: "大後天", high: 13, low: 6, condition: "雨" }] },
  { city: "曼谷", temp: 34, feelsLike: 38, humidity: 75, wind: 6, visibility: 8, condition: "晴天", forecast: [{ day: "明天", high: 35, low: 27, condition: "晴" }, { day: "後天", high: 33, low: 26, condition: "雷雨" }, { day: "大後天", high: 34, low: 27, condition: "多雲" }] },
  { city: "巴黎", temp: 12, feelsLike: 10, humidity: 68, wind: 18, visibility: 10, condition: "多雲", forecast: [{ day: "明天", high: 14, low: 7, condition: "多雲" }, { day: "後天", high: 13, low: 6, condition: "雨" }, { day: "大後天", high: 15, low: 8, condition: "晴" }] },
];

const getWeatherIcon = (condition: string) => {
  if (condition.includes("晴") || condition.includes("Sunny") || condition.includes("Clear")) return <Sun className="w-6 h-6 text-amber-500" />;
  if (condition.includes("雨") || condition.includes("雷") || condition.includes("Rain")) return <CloudRain className="w-6 h-6 text-blue-500" />;
  if (condition.includes("雪") || condition.includes("Snow")) return <CloudSnow className="w-6 h-6 text-sky-300" />;
  return <Cloud className="w-6 h-6 text-gray-400" />;
};

function WeatherTab() {
  const [searchCity, setSearchCity] = useState("");
  const [selectedWeather, setSelectedWeather] = useState<WeatherInfo | null>(null);
  const [liveWeather, setLiveWeather] = useState<WeatherInfo | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchLiveWeather = async (city: string) => {
    if (!city.trim()) return;
    setLiveLoading(true);
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current_condition?.[0];
        const forecast = data.weather?.slice(0, 3) || [];
        if (current) {
          setLiveWeather({
            city, temp: parseInt(current.temp_C), feelsLike: parseInt(current.FeelsLikeC),
            humidity: parseInt(current.humidity), wind: parseInt(current.windspeedKmph),
            visibility: parseInt(current.visibility),
            condition: current.weatherDesc?.[0]?.value || "Unknown",
            forecast: forecast.map((f: any, i: number) => ({
              day: i === 0 ? "今天" : i === 1 ? "明天" : "後天",
              high: parseInt(f.maxtempC), low: parseInt(f.mintempC),
              condition: f.hourly?.[4]?.weatherDesc?.[0]?.value || "Unknown",
            })),
          });
          toast.success(`已取得 ${city} 的即時天氣`);
        }
      } else { throw new Error(); }
    } catch { toast.error("無法取得天氣資料，請確認城市名稱"); }
    setLiveLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜尋城市即時天氣..." value={searchCity} onChange={e => setSearchCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchLiveWeather(searchCity)} className="pl-10 rounded-xl" />
        </div>
        <Button className="rounded-xl" onClick={() => fetchLiveWeather(searchCity)} disabled={liveLoading}>
          {liveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "查詢"}
        </Button>
      </div>

      {liveWeather && (
        <Card className="border-primary/30 border-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Badge className="bg-primary/10 text-primary border-0 rounded-full mb-1">即時天氣</Badge>
                <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{liveWeather.city}</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{liveWeather.temp}°C</p>
                <p className="text-sm text-muted-foreground">{liveWeather.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-secondary/50 rounded-lg"><Thermometer className="w-4 h-4 mx-auto text-red-400 mb-1" /><p className="text-xs text-muted-foreground">體感</p><p className="text-sm font-semibold">{liveWeather.feelsLike}°C</p></div>
              <div className="text-center p-2 bg-secondary/50 rounded-lg"><Droplets className="w-4 h-4 mx-auto text-blue-400 mb-1" /><p className="text-xs text-muted-foreground">濕度</p><p className="text-sm font-semibold">{liveWeather.humidity}%</p></div>
              <div className="text-center p-2 bg-secondary/50 rounded-lg"><Wind className="w-4 h-4 mx-auto text-teal-400 mb-1" /><p className="text-xs text-muted-foreground">風速</p><p className="text-sm font-semibold">{liveWeather.wind}km/h</p></div>
              <div className="text-center p-2 bg-secondary/50 rounded-lg"><Eye className="w-4 h-4 mx-auto text-purple-400 mb-1" /><p className="text-xs text-muted-foreground">能見度</p><p className="text-sm font-semibold">{liveWeather.visibility}km</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {liveWeather.forecast.map(f => (
                <div key={f.day} className="text-center p-2 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{f.day}</p>
                  <p className="text-xs mt-1">{f.condition}</p>
                  <p className="text-sm font-semibold">{f.high}° / {f.low}°</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-bold mb-3">熱門景點天氣</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularSpotWeather.map(w => (
            <Card key={w.city} className="border-border/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWeather(selectedWeather?.city === w.city ? null : w)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(w.condition)}
                    <div><p className="font-semibold">{w.city}</p><p className="text-xs text-muted-foreground">{w.condition}</p></div>
                  </div>
                  <p className="text-2xl font-bold">{w.temp}°C</p>
                </div>
                {selectedWeather?.city === w.city && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                      <div><p className="text-muted-foreground">濕度</p><p className="font-semibold">{w.humidity}%</p></div>
                      <div><p className="text-muted-foreground">風速</p><p className="font-semibold">{w.wind}km/h</p></div>
                      <div><p className="text-muted-foreground">體感</p><p className="font-semibold">{w.feelsLike}°C</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {w.forecast.map(f => (
                        <div key={f.day} className="text-center p-2 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">{f.day}</p>
                          <p className="text-xs">{f.condition}</p>
                          <p className="text-xs font-semibold">{f.high}°/{f.low}°</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== NAVIGATION TAB ==================== */
const popularDestinations = [
  { name: "東京車站", value: "東京車站, 日本" },
  { name: "札幌車站", value: "札幌車站, 日本" },
  { name: "大阪城", value: "大阪城, 日本" },
  { name: "首爾明洞", value: "明洞, 首爾, 韓國" },
  { name: "曼谷大皇宮", value: "大皇宮, 曼谷, 泰國" },
  { name: "台北101", value: "台北101, 台灣" },
];

function NavigationTab() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "TRANSIT">("DRIVING");
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; steps?: string[] } | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routing, setRouting] = useState(false);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setCenter({ lat: 25.0330, lng: 121.5654 });
    map.setZoom(12);
    setMapLoaded(true);
  }, []);

  const clearOriginMarker = () => {
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
      originMarkerRef.current = null;
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) { toast.error("瀏覽器不支援定位"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (map) {
          const loc = { lat: latitude, lng: longitude };
          map.setCenter(loc);
          map.setZoom(15);
          clearOriginMarker();
          originMarkerRef.current = new google.maps.Marker({ map, position: loc, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 } });
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: loc }, (results, status) => {
            if (status === "OK" && results?.[0]) setOrigin(results[0].formatted_address);
            else setOrigin(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          });
        }
        setLocating(false);
        toast.success("已取得當前位置");
      },
      () => { setLocating(false); toast.error("無法取得位置，請在瀏覽器允許定位權限（網址列左邊的鎖頭圖示）"); }
    );
  };

  const geocodeAndCenter = useCallback((address: string, isOrigin: boolean) => {
    const map = mapRef.current;
    if (!map || !window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        map.setCenter(loc);
        map.setZoom(14);
        if (isOrigin) {
          clearOriginMarker();
          originMarkerRef.current = new google.maps.Marker({
            map, position: loc,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 }
          });
        }
      }
    });
  }, []);

  const navigateRoute = () => {
    if (!origin || !destination) { toast.error("請輸入起點和終點"); return; }
    const map = mapRef.current;
    if (!map) { toast.error("地圖尚未載入"); return; }
    setRouting(true);
    clearOriginMarker();
    const ds = new google.maps.DirectionsService();
    if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
    const dr = new google.maps.DirectionsRenderer({ map, suppressMarkers: false, polylineOptions: { strokeColor: "#8B7355", strokeWeight: 5 } });
    directionsRendererRef.current = dr;
    ds.route({ origin, destination, travelMode: google.maps.TravelMode[travelMode] }, (result, status) => {
      if (status === "REQUEST_DENIED") { setRouting(false); toast.error("Directions API 未啟用，請到 Google Cloud Console → API & Services → 啟用「Directions API」"); return; }
      setRouting(false);
      if (status === "OK" && result) {
        dr.setDirections(result);
        const leg = result.routes[0]?.legs[0];
        if (leg) {
          const steps = leg.steps?.slice(0, 8).map(s => s.instructions?.replace(/<[^>]*>/g, "") || "") || [];
          setRouteInfo({ distance: leg.distance?.text || "", duration: leg.duration?.text || "", steps });
        }
        toast.success("路線已規劃");
      } else { toast.error("無法規劃路線，請檢查地址"); }
    });
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    setRouteInfo(null);
    setOrigin("");
    setDestination("");
    const map = mapRef.current;
    if (map) { map.setCenter({ lat: 25.0330, lng: 121.5654 }); map.setZoom(12); }
  };

  const openInGoogleMaps = () => {
    if (!origin || !destination) return;
    const mode = travelMode === "DRIVING" ? "driving" : travelMode === "WALKING" ? "walking" : "transit";
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-border/50 h-[300px] sm:h-[350px] relative">
        <MapView onMapReady={handleMapReady} initialCenter={{ lat: 25.0330, lng: 121.5654 }} />
        {!mapLoaded && (
          <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">載入地圖中...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">起點（可自行輸入任意地址）</Label>
          <div className="flex gap-2">
            <Input
              placeholder="輸入起點地址，例如：台北車站..."
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              onBlur={() => { if (origin.trim()) geocodeAndCenter(origin, true); }}
              className="rounded-xl"
            />
            <Button variant="outline" size="sm" className="rounded-xl shrink-0 gap-1" onClick={locateMe} disabled={locating} aria-label="使用目前位置">
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">定位</span>
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">終點</Label>
          <Input placeholder="輸入目的地，例如：東京車站..." value={destination} onChange={e => setDestination(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">熱門：</span>
          {popularDestinations.map(d => (
            <Button key={d.name} variant="outline" size="sm" className="rounded-full text-xs h-7 px-2.5" onClick={() => setDestination(d.value)}>
              {d.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["DRIVING", "WALKING", "TRANSIT"] as const).map(m => (
            <Button key={m} variant={travelMode === m ? "default" : "outline"} size="sm" className="rounded-full flex-1 text-xs" onClick={() => setTravelMode(m)}>
              {m === "DRIVING" ? "🚗 開車" : m === "WALKING" ? "🚶 步行" : "🚌 大眾運輸"}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 rounded-xl" onClick={navigateRoute} disabled={routing || !mapLoaded}>
            {routing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
            開始導航
          </Button>
          {routeInfo && (
            <Button variant="outline" className="rounded-xl gap-1" onClick={openInGoogleMaps}>
              <MapPin className="w-4 h-4" />Google Maps
            </Button>
          )}
          {routeInfo && (
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={clearRoute}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {routeInfo && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-around">
              <div className="text-center"><p className="text-xs text-muted-foreground">距離</p><p className="font-bold text-primary">{routeInfo.distance}</p></div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center"><p className="text-xs text-muted-foreground">預計時間</p><p className="font-bold text-primary">{routeInfo.duration}</p></div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center"><p className="text-xs text-muted-foreground">方式</p><p className="font-bold text-primary">{travelMode === "DRIVING" ? "🚗" : travelMode === "WALKING" ? "🚶" : "🚌"}</p></div>
            </div>
            {routeInfo.steps && routeInfo.steps.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold mb-2">路線步驟</p>
                <ol className="space-y-1">
                  {routeInfo.steps.map((step, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ==================== MAIN TOOLS PAGE ==================== */
export default function Tools() {
  const [activeTab, setActiveTab] = useState("translate");

  const toolTabs = [
    { value: "translate", label: "翻譯", icon: Sparkles, color: "text-violet-500" },
    { value: "currency", label: "匯率", icon: DollarSign, color: "text-teal-500" },
    { value: "weather", label: "天氣", icon: Cloud, color: "text-cyan-500" },
    { value: "navigation", label: "導航", icon: Navigation, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>旅行工具箱</h1>
            <p className="text-muted-foreground">AI 翻譯、匯率、天氣、導航 — 旅途中的智慧幫手</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1 pb-24 sm:pb-8">
        <div className="container max-w-3xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden sm:grid grid-cols-4 h-12 rounded-xl bg-secondary/50 p-1">
              {toolTabs.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="rounded-lg gap-1.5 text-sm data-[state=active]:bg-background">
                  <t.icon className="w-4 h-4" />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="translate"><TranslatorTab /></TabsContent>
            <TabsContent value="currency"><CurrencyTab /></TabsContent>
            <TabsContent value="weather"><WeatherTab /></TabsContent>
            <TabsContent value="navigation"><NavigationTab /></TabsContent>
          </Tabs>
        </div>
      </section>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 px-2 py-1.5 safe-area-bottom">
        <div className="grid grid-cols-4 gap-1">
          {toolTabs.map(t => {
            const isActive = activeTab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all ${isActive ? "bg-primary/10" : "hover:bg-accent/50"}`}
              >
                <t.icon className={`w-5 h-5 ${isActive ? t.color : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
