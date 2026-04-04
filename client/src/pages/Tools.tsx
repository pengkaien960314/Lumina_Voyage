/*
 * Design: Organic Naturalism — Travel Tools
 * - Translator, Currency, Weather, Navigation
 * - Tab-based layout
 */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Languages, DollarSign, Cloud, Navigation, ArrowLeftRight, Search, Thermometer, Droplets, Wind, Eye, Sun, CloudRain, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapView } from "@/components/Map";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Translator ── */
function TranslatorTab() {
  const [sourceLang, setSourceLang] = useState("zh-TW");
  const [targetLang, setTargetLang] = useState("ja");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { value: "zh-TW", label: "繁體中文" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "es", label: "Español" },
    { value: "th", label: "ภาษาไทย" },
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("請輸入要翻譯的文字");
      return;
    }
    setLoading(true);
    // Simulated translation
    await new Promise((r) => setTimeout(r, 1000));
    const mockTranslations: Record<string, string> = {
      ja: "こんにちは、旅行を楽しんでいます。",
      en: "Hello, I am enjoying my trip.",
      ko: "안녕하세요, 여행을 즐기고 있습니다.",
      fr: "Bonjour, je profite de mon voyage.",
    };
    setTranslatedText(mockTranslations[targetLang] || "Translation result will appear here.");
    setLoading(false);
    toast.success("翻譯完成");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4 text-primary" />
        </button>
        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="輸入要翻譯的文字..."
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        rows={4}
        className="rounded-xl"
      />
      <Button onClick={handleTranslate} className="rounded-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
        翻譯
      </Button>
      {translatedText && (
        <div className="p-4 rounded-xl bg-accent/50 min-h-[100px]">
          <p className="text-sm text-muted-foreground mb-1">翻譯結果</p>
          <p className="text-foreground leading-relaxed">{translatedText}</p>
        </div>
      )}
    </div>
  );
}

/* ── Currency ── */
function CurrencyTab() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("TWD");
  const [toCurrency, setToCurrency] = useState("JPY");

  const rates: Record<string, Record<string, number>> = {
    TWD: { JPY: 4.65, USD: 0.031, EUR: 0.029, KRW: 42.5, THB: 1.1, GBP: 0.025 },
    USD: { TWD: 32.2, JPY: 149.8, EUR: 0.92, KRW: 1370, THB: 35.5, GBP: 0.79 },
    JPY: { TWD: 0.215, USD: 0.0067, EUR: 0.0062, KRW: 9.15, THB: 0.237, GBP: 0.0053 },
  };

  const currencies = [
    { value: "TWD", label: "TWD 新台幣", symbol: "NT$" },
    { value: "JPY", label: "JPY 日圓", symbol: "¥" },
    { value: "USD", label: "USD 美元", symbol: "$" },
    { value: "EUR", label: "EUR 歐元", symbol: "€" },
    { value: "KRW", label: "KRW 韓元", symbol: "₩" },
    { value: "THB", label: "THB 泰銖", symbol: "฿" },
    { value: "GBP", label: "GBP 英鎊", symbol: "£" },
  ];

  const getRate = () => {
    if (fromCurrency === toCurrency) return 1;
    return rates[fromCurrency]?.[toCurrency] || 1;
  };

  const converted = (parseFloat(amount) || 0) * getRate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <Label className="text-sm text-muted-foreground mb-2 block">從</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="rounded-xl mb-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold h-14 rounded-xl"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <Label className="text-sm text-muted-foreground mb-2 block">到</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="rounded-xl mb-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="text-2xl font-bold h-14 flex items-center px-3 rounded-xl bg-background" style={{ fontFamily: "var(--font-sans)" }}>
              {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        匯率：1 {fromCurrency} = {getRate().toFixed(4)} {toCurrency}
        <br />
        <span className="text-xs">匯率僅供參考，實際匯率以銀行為準</span>
      </div>
    </div>
  );
}

/* ── Weather ── */
function WeatherTab() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const mockWeather: Record<string, any> = {
    "東京": { temp: 22, feels: 20, humidity: 65, wind: 12, visibility: 10, condition: "晴天", icon: Sun, forecast: [{ day: "明天", temp: 24, icon: Sun }, { day: "後天", temp: 19, icon: CloudRain }, { day: "大後天", temp: 21, icon: Cloud }] },
    "巴黎": { temp: 18, feels: 16, humidity: 72, wind: 18, visibility: 8, condition: "多雲", icon: Cloud, forecast: [{ day: "明天", temp: 17, icon: CloudRain }, { day: "後天", temp: 20, icon: Sun }, { day: "大後天", temp: 19, icon: Cloud }] },
    "峇里島": { temp: 30, feels: 33, humidity: 80, wind: 8, visibility: 12, condition: "晴天", icon: Sun, forecast: [{ day: "明天", temp: 31, icon: Sun }, { day: "後天", temp: 29, icon: CloudRain }, { day: "大後天", temp: 30, icon: Sun }] },
  };

  const handleSearch = async () => {
    if (!city.trim()) { toast.error("請輸入城市名稱"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const data = mockWeather[city] || mockWeather["東京"];
    setWeather({ ...data, city: city || "東京" });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input
          placeholder="輸入城市名稱（例：東京、巴黎）"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="rounded-full gap-2 px-6" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          查詢
        </Button>
      </div>

      {weather && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 overflow-hidden">
            <div className="bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-800 dark:to-blue-900 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{weather.city}</h3>
                  <p className="text-white/80">{weather.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>{weather.temp}°C</p>
                  <p className="text-white/80 text-sm">體感 {weather.feels}°C</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">濕度</p>
                  <p className="font-semibold text-sm">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                  <p className="text-xs text-muted-foreground">風速</p>
                  <p className="font-semibold text-sm">{weather.wind} km/h</p>
                </div>
                <div className="text-center">
                  <Eye className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">能見度</p>
                  <p className="font-semibold text-sm">{weather.visibility} km</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
                  <p className="text-xs text-muted-foreground">體感</p>
                  <p className="font-semibold text-sm">{weather.feels}°C</p>
                </div>
              </div>
              <div className="leaf-divider" />
              <h4 className="font-semibold mb-3" style={{ fontFamily: "var(--font-sans)" }}>未來天氣</h4>
              <div className="grid grid-cols-3 gap-3">
                {weather.forecast.map((f: any, idx: number) => {
                  const FIcon = f.icon;
                  return (
                    <div key={idx} className="text-center p-3 rounded-xl bg-accent/50">
                      <p className="text-xs text-muted-foreground mb-1">{f.day}</p>
                      <FIcon className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <p className="font-semibold text-sm">{f.temp}°C</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

/* ── Navigation ── */
function NavigationTab() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("請輸入地點名稱");
      return;
    }
    if (mapRef.current && window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          mapRef.current!.setCenter(results[0].geometry.location);
          mapRef.current!.setZoom(15);
          new google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current!,
            position: results[0].geometry.location,
            title: searchQuery,
          });
          toast.success(`已定位到 ${searchQuery}`);
        } else {
          toast.error("找不到該地點");
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="搜尋地點（例：東京鐵塔、巴黎鐵塔）"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="rounded-full gap-2 px-6">
          <Search className="w-4 h-4" />
          搜尋
        </Button>
      </div>
      <div className="rounded-2xl overflow-hidden border border-border/50">
        <MapView
          className="h-[500px]"
          initialCenter={{ lat: 35.6762, lng: 139.6503 }}
          initialZoom={12}
          onMapReady={(map) => { mapRef.current = map; }}
        />
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Tools() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              旅行工具箱
            </h1>
            <p className="text-muted-foreground">
              翻譯、匯率、天氣、導航 — 旅途中的得力助手
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          <Tabs defaultValue="translate" className="space-y-6">
            <TabsList className="grid grid-cols-4 h-12 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger value="translate" className="rounded-lg gap-2 data-[state=active]:bg-background">
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">翻譯</span>
              </TabsTrigger>
              <TabsTrigger value="currency" className="rounded-lg gap-2 data-[state=active]:bg-background">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">匯率</span>
              </TabsTrigger>
              <TabsTrigger value="weather" className="rounded-lg gap-2 data-[state=active]:bg-background">
                <Cloud className="w-4 h-4" />
                <span className="hidden sm:inline">天氣</span>
              </TabsTrigger>
              <TabsTrigger value="navigation" className="rounded-lg gap-2 data-[state=active]:bg-background">
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">導航</span>
              </TabsTrigger>
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
