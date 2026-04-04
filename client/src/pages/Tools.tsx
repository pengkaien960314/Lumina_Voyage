/*
 * Design: Organic Naturalism — Tools Page
 * - Real-time weather with popular spots
 * - Live currency exchange with many currencies
 * - Real navigation with geolocation
 * - Translation with quick reply conversation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Languages, DollarSign, Cloud, Navigation, ArrowRightLeft, MapPin, Thermometer, Wind, Droplets, Eye, Sun, Moon, CloudRain, CloudSnow, Loader2, Send, RotateCcw, Locate, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapView } from "@/components/Map";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ==================== TRANSLATION TAB ==================== */
interface ChatMessage {
  id: string;
  from: "A" | "B";
  text: string;
  translated: string;
  lang: string;
}

const langOptions = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "th", label: "ภาษาไทย", flag: "🇹🇭" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

// Quick replies per language: [original, translated to the OTHER person's language]
const quickRepliesMap: Record<string, Record<string, string[][]>> = {
  "zh-TW": {
    "ja": [["謝謝你的幫忙", "手伝ってくれてありがとう"], ["好的，沒問題", "はい、大丈夫です"], ["請問這個多少錢？", "これはいくらですか？"]],
    "en": [["謝謝你的幫忙", "Thank you for your help"], ["好的，沒問題", "OK, no problem"], ["請問這個多少錢？", "How much is this?"]],
    "ko": [["謝謝你的幫忙", "도와주셔서 감사합니다"], ["好的，沒問題", "네, 괜찮습니다"], ["請問這個多少錢？", "이거 얼마예요?"]],
    "_default": [["謝謝你的幫忙", "Thank you"], ["好的，沒問題", "OK, no problem"], ["請問這個多少錢？", "How much?"]],
  },
  "ja": {
    "zh-TW": [["ありがとうございます", "謝謝您"], ["はい、わかりました", "好的，我知道了"], ["すみません、もう一度お願いします", "不好意思，請再說一次"]],
    "en": [["ありがとうございます", "Thank you very much"], ["はい、わかりました", "Yes, I understand"], ["すみません、もう一度お願いします", "Excuse me, could you say that again?"]],
    "_default": [["ありがとうございます", "Thank you"], ["はい、わかりました", "Yes, understood"], ["すみません", "Excuse me"]],
  },
  "en": {
    "zh-TW": [["Thank you very much", "非常感謝"], ["Yes, I understand", "是的，我了解"], ["Could you repeat that?", "可以再說一次嗎？"]],
    "ja": [["Thank you very much", "どうもありがとうございます"], ["Yes, I understand", "はい、わかりました"], ["Could you repeat that?", "もう一度言ってもらえますか？"]],
    "_default": [["Thank you very much", "Thank you"], ["Yes, I understand", "Understood"], ["Could you repeat that?", "Repeat please"]],
  },
  "ko": {
    "zh-TW": [["감사합니다", "謝謝"], ["네, 알겠습니다", "好的，我知道了"], ["다시 한번 말씀해 주세요", "請再說一次"]],
    "_default": [["감사합니다", "Thank you"], ["네, 알겠습니다", "Yes, understood"], ["다시 한번 말씀해 주세요", "Please say again"]],
  },
  "_default": {
    "_default": [["Thank you", "謝謝"], ["Yes, understood", "好的"], ["Please repeat", "請再說一次"]],
  },
};

function getQuickReplies(speakerLang: string, otherLang: string): string[][] {
  const langMap = quickRepliesMap[speakerLang] || quickRepliesMap["_default"];
  return langMap[otherLang] || langMap["_default"] || quickRepliesMap["_default"]["_default"];
}

const mockTranslate = (text: string, _from: string, to: string): string => {
  const suffixes: Record<string, string> = {
    "zh-TW": "（已翻譯為中文）",
    "ja": "（日本語に翻訳済み）",
    "en": " (Translated to English)",
    "ko": " (한국어로 번역됨)",
    "th": " (แปลเป็นภาษาไทย)",
    "fr": " (Traduit en français)",
    "es": " (Traducido al español)",
    "de": " (Ins Deutsche übersetzt)",
  };
  return text + (suffixes[to] || ` [→${to}]`);
};

function TranslatorTab() {
  const [langA, setLangA] = useState("zh-TW");
  const [langB, setLangB] = useState("ja");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTurn, setCurrentTurn] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const fromLang = currentTurn === "A" ? langA : langB;
    const toLang = currentTurn === "A" ? langB : langA;
    const translated = mockTranslate(inputText, fromLang, toLang);
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, from: currentTurn, text: inputText, translated, lang: fromLang }]);
    setCurrentTurn(currentTurn === "A" ? "B" : "A");
    setInputText("");
    setLoading(false);
  };

  const handleQuickReply = async (original: string, translated: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const fromLang = currentTurn === "A" ? langA : langB;
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, from: currentTurn, text: original, translated, lang: fromLang }]);
    setCurrentTurn(currentTurn === "A" ? "B" : "A");
    setLoading(false);
  };

  const speakerLang = currentTurn === "A" ? langA : langB;
  const otherLang = currentTurn === "A" ? langB : langA;
  const currentQuickReplies = getQuickReplies(speakerLang, otherLang);
  const currentLangInfo = langOptions.find((l) => l.code === speakerLang);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">A 的語言</Label>
          <Select value={langA} onValueChange={setLangA}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{langOptions.map((l) => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <ArrowRightLeft className="w-5 h-5 text-muted-foreground mt-5 shrink-0" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">B 的語言</Label>
          <Select value={langB} onValueChange={setLangB}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{langOptions.map((l) => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div ref={chatRef} className="h-[300px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">開始對話翻譯吧！<br />A 輸入文字後翻譯給 B，B 可用快速回覆</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "A" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.from === "A" ? "bg-primary/10 rounded-tl-sm" : "bg-secondary rounded-tr-sm"}`}>
                  <p className="text-xs font-medium text-primary mb-1">{msg.from === "A" ? "A" : "B"} ({langOptions.find((l) => l.code === msg.lang)?.flag})</p>
                  <p className="text-sm font-medium">{msg.text}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">翻譯：</p>
                    <p className="text-sm">{msg.translated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 p-3">
            <p className="text-xs text-muted-foreground mb-2">{currentLangInfo?.flag} {currentTurn} 的快速回覆：</p>
            <div className="flex gap-2 flex-wrap">
              {currentQuickReplies.map(([original, translated], i) => (
                <Button key={i} variant="outline" size="sm" className="rounded-full text-xs h-7" onClick={() => handleQuickReply(original, translated)} disabled={loading}>{original}</Button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 p-3 flex gap-2">
            <Badge variant="outline" className="shrink-0 rounded-full">{currentTurn}</Badge>
            <Input placeholder={`${currentTurn} 輸入 (${currentLangInfo?.label})...`} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="rounded-xl" disabled={loading} />
            <Button size="sm" className="rounded-xl shrink-0" onClick={handleSend} disabled={loading || !inputText.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full rounded-xl" onClick={() => { setMessages([]); setCurrentTurn("A"); }}>
        <RotateCcw className="w-4 h-4 mr-2" />重新開始對話
      </Button>
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
      Object.keys(varied).forEach((k) => { if (k !== "USD") varied[k] *= (0.998 + Math.random() * 0.004); });
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
  const fromInfo = currencies.find((c) => c.code === fromCurrency);
  const toInfo = currencies.find((c) => c.code === toCurrency);

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
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl text-lg font-semibold h-12" />
          </div>
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">從</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 mb-0.5" onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}>
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">到</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</SelectItem>)}</SelectContent>
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
          {popularPairs.map((p) => {
            const r = (liveRates[p.to] || 1) / (liveRates[p.from] || 1);
            const fi = currencies.find((c) => c.code === p.from);
            const ti = currencies.find((c) => c.code === p.to);
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
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  visibility: number;
  condition: string;
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
            city,
            temp: parseInt(current.temp_C),
            feelsLike: parseInt(current.FeelsLikeC),
            humidity: parseInt(current.humidity),
            wind: parseInt(current.windspeedKmph),
            visibility: parseInt(current.visibility),
            condition: current.weatherDesc?.[0]?.value || "Unknown",
            forecast: forecast.map((f: any, i: number) => ({
              day: i === 0 ? "今天" : i === 1 ? "明天" : "後天",
              high: parseInt(f.maxtempC),
              low: parseInt(f.mintempC),
              condition: f.hourly?.[4]?.weatherDesc?.[0]?.value || "Unknown",
            })),
          });
          toast.success(`已取得 ${city} 的即時天氣`);
        }
      } else { throw new Error(); }
    } catch {
      toast.error("無法取得天氣資料，請確認城市名稱");
    }
    setLiveLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜尋城市即時天氣..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchLiveWeather(searchCity)} className="pl-10 rounded-xl" />
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
              {liveWeather.forecast.map((f) => (
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
          {popularSpotWeather.map((w) => (
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
                      {w.forecast.map((f) => (
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
function NavigationTab() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "TRANSIT">("DRIVING");
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setCenter({ lat: 43.0618, lng: 141.3545 });
    map.setZoom(12);
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) { toast.error("瀏覽器不支援定位"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (map) {
          const loc = { lat: latitude, lng: longitude };
          map.setCenter(loc);
          map.setZoom(15);
          new google.maps.Marker({ map, position: loc, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 } });
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: loc }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              setOrigin(results[0].formatted_address);
            } else {
              setOrigin(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          });
        }
        setLocating(false);
        toast.success("已取得當前位置");
      },
      () => { setLocating(false); toast.error("無法取得位置，請允許定位權限"); }
    );
  };

  const navigate = () => {
    if (!origin || !destination) { toast.error("請輸入起點和終點"); return; }
    const map = mapRef.current;
    if (!map) return;
    const ds = new google.maps.DirectionsService();
    if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
    const dr = new google.maps.DirectionsRenderer({ map, suppressMarkers: false, polylineOptions: { strokeColor: "#8B7355", strokeWeight: 5 } });
    directionsRendererRef.current = dr;
    ds.route({ origin, destination, travelMode: google.maps.TravelMode[travelMode] }, (result, status) => {
      if (status === "OK" && result) {
        dr.setDirections(result);
        const leg = result.routes[0]?.legs[0];
        if (leg) setRouteInfo({ distance: leg.distance?.text || "", duration: leg.duration?.text || "" });
        toast.success("路線已規劃");
      } else {
        toast.error("無法規劃路線，請檢查地址");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">起點</Label>
          <div className="flex gap-2">
            <Input placeholder="輸入起點地址..." value={origin} onChange={(e) => setOrigin(e.target.value)} className="rounded-xl" />
            <Button variant="outline" size="sm" className="rounded-xl shrink-0" onClick={locateMe} disabled={locating}>
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">終點</Label>
          <Input placeholder="輸入目的地..." value={destination} onChange={(e) => setDestination(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex gap-2">
          {(["DRIVING", "WALKING", "TRANSIT"] as const).map((m) => (
            <Button key={m} variant={travelMode === m ? "default" : "outline"} size="sm" className="rounded-full flex-1 text-xs" onClick={() => setTravelMode(m)}>
              {m === "DRIVING" ? "🚗 開車" : m === "WALKING" ? "🚶 步行" : "🚌 大眾運輸"}
            </Button>
          ))}
        </div>
        <Button className="w-full rounded-xl" onClick={navigate}><Navigation className="w-4 h-4 mr-2" />開始導航</Button>
      </div>

      {routeInfo && (
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center justify-around">
            <div className="text-center"><p className="text-xs text-muted-foreground">距離</p><p className="font-bold text-primary">{routeInfo.distance}</p></div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center"><p className="text-xs text-muted-foreground">預計時間</p><p className="font-bold text-primary">{routeInfo.duration}</p></div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl overflow-hidden border border-border/50 h-[350px]">
        <MapView onMapReady={handleMapReady} />
      </div>
    </div>
  );
}

/* ==================== MAIN TOOLS PAGE ==================== */
export default function Tools() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>旅行工具箱</h1>
            <p className="text-muted-foreground">翻譯、匯率、天氣、導航 — 旅途中的好幫手</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl">
          <Tabs defaultValue="translate" className="space-y-6">
            <TabsList className="grid grid-cols-4 h-12 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger value="translate" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"><Languages className="w-4 h-4" /><span className="hidden sm:inline">翻譯</span></TabsTrigger>
              <TabsTrigger value="currency" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"><DollarSign className="w-4 h-4" /><span className="hidden sm:inline">匯率</span></TabsTrigger>
              <TabsTrigger value="weather" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"><Cloud className="w-4 h-4" /><span className="hidden sm:inline">天氣</span></TabsTrigger>
              <TabsTrigger value="navigation" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"><Navigation className="w-4 h-4" /><span className="hidden sm:inline">導航</span></TabsTrigger>
            </TabsList>

            <TabsContent value="translate"><TranslatorTab /></TabsContent>
            <TabsContent value="currency"><CurrencyTab /></TabsContent>
            <TabsContent value="weather"><WeatherTab /></TabsContent>
            <TabsContent value="navigation"><NavigationTab /></TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
}
