/*
 * Design: Organic Naturalism — Flights Page
 * - One-way / Round-trip / Multi-city
 * - Popular departure/destination options
 * - Passengers up to 6 + custom input
 * - Airline logos, booking simulation
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, ArrowRight, Clock, Search, ArrowLeftRight, Minus, Plus, X, Check, Users, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useBooking } from "@/contexts/BookingContext";
import { GEMINI_API_KEY } from "@/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const popularCities = [
  { code: "TPE", name: "台北桃園", country: "台灣" },
  { code: "NRT", name: "東京成田", country: "日本" },
  { code: "KIX", name: "大阪關西", country: "日本" },
  { code: "CTS", name: "札幌新千歲", country: "日本" },
  { code: "ICN", name: "首爾仁川", country: "韓國" },
  { code: "HKG", name: "香港", country: "香港" },
  { code: "BKK", name: "曼谷", country: "泰國" },
  { code: "SIN", name: "新加坡", country: "新加坡" },
  { code: "CDG", name: "巴黎", country: "法國" },
  { code: "LAX", name: "洛杉磯", country: "美國" },
];

interface AirlineInfo { name: string; code: string; color: string; abbr: string; }
const airlines: AirlineInfo[] = [
  { name: "中華航空", code: "CI", color: "#003366", abbr: "CI" },
  { name: "長榮航空", code: "BR", color: "#006747", abbr: "BR" },
  { name: "日本航空", code: "JL", color: "#CC0000", abbr: "JL" },
  { name: "全日空", code: "NH", color: "#003399", abbr: "NH" },
  { name: "國泰航空", code: "CX", color: "#006564", abbr: "CX" },
  { name: "星宇航空", code: "JX", color: "#1A1A2E", abbr: "JX" },
  { name: "台灣虎航", code: "IT", color: "#FF6600", abbr: "IT" },
  { name: "樂桃航空", code: "MM", color: "#E91E8C", abbr: "MM" },
];

interface FlightResult {
  id: number; airline: AirlineInfo; flightCode: string; from: string; to: string;
  departTime: string; arriveTime: string; duration: string; price: number;
  stops: number; cabinClass: string;
}

const generateFlights = async (from: string, to: string, cabin: string, date: string): Promise<FlightResult[]> => {
  const fromName = popularCities.find(c => c.code === from)?.name || from;
  const toName = popularCities.find(c => c.code === to)?.name || to;
  const cabinLabel = cabin === "first" ? "頭等艙" : cabin === "business" ? "商務艙" : "經濟艙";

  const prompt = `你是航班資料庫。請提供從 ${fromName}(${from}) 飛往 ${toName}(${to}) 在 ${date} 的真實航班資訊。
要求：
- 提供 6-8 個航班，使用真實存在的航班（中華航空CI、長榮航空BR、日本航空JL、全日空NH、國泰航空CX、星宇航空JX、台灣虎航IT、樂桃航空MM、酷航TR、亞航AK 等實際飛此航線的航空公司）
- 只列出「真正有飛這條航線」的航空公司
- 航班編號用真實格式（例如 CI-100）
- 時間用 24h 格式
- 價格用新台幣，${cabinLabel}的合理價格
- duration 用 "Xh Ym" 格式
- stops: 0=直飛, 1=轉機一次

只回覆 JSON 陣列（不要 markdown 標記）：
[{"airline":"航空公司名","code":"XX","flightCode":"XX-123","departTime":"08:30","arriveTime":"12:45","duration":"3h 15m","price":8500,"stops":0}]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let jsonStr = raw;
    const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) jsonStr = m[1];
    const bs = jsonStr.indexOf("[");
    const be = jsonStr.lastIndexOf("]");
    if (bs !== -1 && be !== -1) jsonStr = jsonStr.substring(bs, be + 1);
    const parsed = JSON.parse(jsonStr);

    return parsed.map((f: any, i: number) => {
      const airlineInfo = airlines.find(a => a.code === f.code) || {
        name: f.airline, code: f.code, color: "#555555", abbr: f.code,
      };
      return {
        id: i + 1, airline: airlineInfo, flightCode: f.flightCode,
        from, to, departTime: f.departTime, arriveTime: f.arriveTime,
        duration: f.duration, price: f.price, stops: f.stops || 0,
        cabinClass: cabinLabel,
      };
    });
  } catch {
    return [];
  }
};

type TripType = "oneway" | "roundtrip" | "multicity";

interface CityPair { from: string; to: string; date: string; }

export default function Flights() {
  const { addFlightBooking } = useBooking();
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [fromCity, setFromCity] = useState("TPE");
  const [toCity, setToCity] = useState("CTS");
  const [departDate, setDepartDate] = useState("2026-05-01");
  const [returnDate, setReturnDate] = useState("2026-05-07");
  const [passengers, setPassengers] = useState(1);
  const [customPassengers, setCustomPassengers] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");
  const [sortBy, setSortBy] = useState("price");
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [multiCities, setMultiCities] = useState<CityPair[]>([
    { from: "TPE", to: "CTS", date: "2026-05-01" },
    { from: "CTS", to: "KIX", date: "2026-05-04" },
  ]);
  const [bookingFlight, setBookingFlight] = useState<FlightResult | null>(null);

  const paxCount = customPassengers ? parseInt(customPassengers) || passengers : passengers;

  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    const f = tripType === "multicity" ? multiCities[0].from : fromCity;
    const t = tripType === "multicity" ? multiCities[0].to : toCity;
    setSearching(true);
    setSearched(false);
    try {
      const results = await generateFlights(f, t, cabinClass, departDate);
      if (results.length === 0) {
        toast.error("查無航班，請嘗試其他日期或目的地");
      } else {
        setFlights(results);
        toast.success(`找到 ${results.length} 個航班`);
      }
    } catch {
      toast.error("搜尋失敗，請重試");
    }
    setSearched(true);
    setSearching(false);
  };

  const openGoogleFlights = () => {
    const from = tripType === "multicity" ? multiCities[0].from : fromCity;
    const to = tripType === "multicity" ? multiCities[0].to : toCity;
    const cabin = cabinClass === "first" ? "1" : cabinClass === "business" ? "2" : "3";
    const url = `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}+on+${departDate}${tripType === "roundtrip" ? `+returning+${returnDate}` : ""}&curr=TWD&tfs=CAEQAg&seat=${cabin}&px=${paxCount}`;
    window.open(url, "_blank");
  };

  const openSkyscanner = () => {
    const from = tripType === "multicity" ? multiCities[0].from : fromCity;
    const to = tripType === "multicity" ? multiCities[0].to : toCity;
    const dept = departDate.replace(/-/g, "").slice(2);
    const ret = tripType === "roundtrip" ? returnDate.replace(/-/g, "").slice(2) : "";
    const cabin = cabinClass === "first" ? "first" : cabinClass === "business" ? "business" : "economy";
    const url = `https://www.skyscanner.com.tw/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${dept}/${ret}?adults=${paxCount}&cabinclass=${cabin}`;
    window.open(url, "_blank");
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "duration") return a.duration.localeCompare(b.duration);
    return a.departTime.localeCompare(b.departTime);
  });

  const handleBook = () => {
    if (!bookingFlight) return;
    addFlightBooking({
      id: `fb${Date.now()}`, airline: bookingFlight.airline.name, code: bookingFlight.flightCode,
      from: bookingFlight.from, to: bookingFlight.to, departTime: bookingFlight.departTime,
      arriveTime: bookingFlight.arriveTime, duration: bookingFlight.duration,
      price: bookingFlight.price * paxCount, date: departDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      passengers: paxCount, class: cabinClass === "economy" ? "經濟艙" : cabinClass === "business" ? "商務艙" : "頭等艙",
      status: "confirmed", bookedAt: new Date().toISOString(),
      logo: bookingFlight.airline.color,
    });
    setBookingFlight(null);
    toast.success("機票預訂成功！確認信已發送至您的信箱");
  };

  const openKayak = () => {
    const from = tripType === "multicity" ? multiCities[0].from : fromCity;
    const to = tripType === "multicity" ? multiCities[0].to : toCity;
    const url = `https://www.kayak.com.tw/flights/${from}-${to}/${departDate}${tripType === "roundtrip" ? `/${returnDate}` : ""}?sort=bestflight_a&fs=cabin=${cabinClass === "first" ? "f" : cabinClass === "business" ? "b" : "e"}&adults=${paxCount}`;
    window.open(url, "_blank");
  };

  const openTrip = () => {
    const from = tripType === "multicity" ? multiCities[0].from : fromCity;
    const to = tripType === "multicity" ? multiCities[0].to : toCity;
    const url = `https://www.trip.com/flights/${from.toLowerCase()}-to-${to.toLowerCase()}/tickets-${from.toLowerCase()}-${to.toLowerCase()}?dcity=${from}&acity=${to}&ddate=${departDate}${tripType === "roundtrip" ? `&rdate=${returnDate}` : ""}&class=${cabinClass === "first" ? "F" : cabinClass === "business" ? "C" : "Y"}&adult=${paxCount}`;
    window.open(url, "_blank");
  };

  const getCityName = (code: string) => popularCities.find((c) => c.code === code)?.name || code;

  const [citySearch, setCitySearch] = useState("");

  const CityPicker = ({ value, onChange, show, setShow, label }: { value: string; onChange: (v: string) => void; show: boolean; setShow: (v: boolean) => void; label: string }) => {
    const filteredCities = citySearch ? popularCities.filter(c => c.name.includes(citySearch) || c.code.toLowerCase().includes(citySearch.toLowerCase()) || c.country.includes(citySearch)) : popularCities;
    return (
      <div className="space-y-2 relative">
        <Label className="text-sm">{label}</Label>
        <div className="relative">
          <Input
            className="h-11 rounded-xl pr-10"
            placeholder="輸入或選擇城市..."
            value={show ? citySearch : `${getCityName(value)} (${value})`}
            onChange={(e) => { setCitySearch(e.target.value); if (!show) setShow(true); }}
            onFocus={() => { setShow(true); setCitySearch(""); }}
          />
          <Plane className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        {show && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
            {filteredCities.map((c) => (
              <button key={c.code} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors flex items-center justify-between ${value === c.code ? "bg-primary/10 text-primary" : ""}`} onClick={() => { onChange(c.code); setShow(false); setCitySearch(""); }}>
                <span>{c.name} ({c.code})</span>
                <span className="text-xs text-muted-foreground">{c.country}</span>
              </button>
            ))}
            {filteredCities.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">找不到符合的城市</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <Plane className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>機票查詢</h1>
            </div>
            <p className="text-muted-foreground mb-6">搜尋最優惠的機票，輕鬆規劃你的旅程</p>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                {/* Trip Type Tabs */}
                <Tabs value={tripType} onValueChange={(v) => setTripType(v as TripType)} className="mb-4">
                  <TabsList className="h-10 rounded-xl bg-secondary/50 p-1">
                    <TabsTrigger value="oneway" className="rounded-lg text-sm">單程</TabsTrigger>
                    <TabsTrigger value="roundtrip" className="rounded-lg text-sm">來回</TabsTrigger>
                    <TabsTrigger value="multicity" className="rounded-lg text-sm">多城市</TabsTrigger>
                  </TabsList>
                </Tabs>

                {tripType !== "multicity" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <CityPicker value={fromCity} onChange={setFromCity} show={showFromPicker} setShow={setShowFromPicker} label="出發地" />
                    <div className="relative">
                      <CityPicker value={toCity} onChange={setToCity} show={showToPicker} setShow={setShowToPicker} label="目的地" />
                      <button className="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors hidden md:flex z-10" onClick={() => { const t = fromCity; setFromCity(toCity); setToCity(t); }}>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">出發日期</Label>
                      <Input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    {tripType === "roundtrip" && (
                      <div className="space-y-2">
                        <Label className="text-sm">回程日期</Label>
                        <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-sm opacity-0 hidden lg:block">搜尋</Label>
                      <Button className="w-full h-11 rounded-xl gap-2" onClick={handleSearch} disabled={searching}>{searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}{searching ? "搜尋中..." : "搜尋"}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {multiCities.map((mc, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">出發地</Label>
                          <Select value={mc.from} onValueChange={(v) => { const n = [...multiCities]; n[idx].from = v; setMultiCities(n); }}>
                            <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{popularCities.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">目的地</Label>
                          <Select value={mc.to} onValueChange={(v) => { const n = [...multiCities]; n[idx].to = v; setMultiCities(n); }}>
                            <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{popularCities.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">日期</Label>
                          <Input type="date" value={mc.date} onChange={(e) => { const n = [...multiCities]; n[idx].date = e.target.value; setMultiCities(n); }} className="h-10 rounded-xl text-sm" />
                        </div>
                        {multiCities.length > 2 && (
                          <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={() => setMultiCities(multiCities.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setMultiCities([...multiCities, { from: multiCities[multiCities.length - 1].to, to: "TPE", date: "2026-05-10" }])}><Plus className="w-3 h-3" />新增航段</Button>
                      <Button className="rounded-xl gap-2 flex-1" onClick={handleSearch} disabled={searching}>{searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}{searching ? "搜尋中..." : "搜尋"}</Button>
                    </div>
                  </div>
                )}

                {/* Passengers & Class */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">乘客：</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button key={n} variant={passengers === n && !customPassengers ? "default" : "outline"} size="sm" className="rounded-full w-8 h-8 p-0 text-xs" onClick={() => { setPassengers(n); setCustomPassengers(""); }}>{n}</Button>
                    ))}
                    <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
                      <Button variant="outline" size="sm" className="rounded-full w-7 h-7 p-0" onClick={() => { const cur = parseInt(customPassengers) || passengers; const v = Math.max(1, cur - 1); setCustomPassengers(String(v)); }}><Minus className="w-3 h-3" /></Button>
                      <Input type="text" inputMode="numeric" value={customPassengers !== "" ? customPassengers : String(passengers)} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setCustomPassengers(v); if (v !== "" && parseInt(v) >= 1) setPassengers(parseInt(v)); }} className="w-14 h-7 rounded-lg text-center text-xs" />
                      <Button variant="outline" size="sm" className="rounded-full w-7 h-7 p-0" onClick={() => { const cur = parseInt(customPassengers) || passengers; setCustomPassengers(String(cur + 1)); }}><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="w-32 h-8 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">經濟艙</SelectItem>
                      <SelectItem value="business">商務艙</SelectItem>
                      <SelectItem value="first">頭等艙</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 快速搜尋平台 */}
      <section className="py-6">
        <div className="container max-w-4xl">
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>在其他平台搜尋即時票價</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 rounded-xl flex-col gap-1 hover:border-primary/50" onClick={openGoogleFlights}>
              <span className="text-lg">✈️</span><span className="text-xs font-medium">Google Flights</span>
            </Button>
            <Button variant="outline" className="h-16 rounded-xl flex-col gap-1 hover:border-primary/50" onClick={openSkyscanner}>
              <span className="text-lg">🔍</span><span className="text-xs font-medium">Skyscanner</span>
            </Button>
            <Button variant="outline" className="h-16 rounded-xl flex-col gap-1 hover:border-primary/50" onClick={openKayak}>
              <span className="text-lg">🛫</span><span className="text-xs font-medium">Kayak</span>
            </Button>
            <Button variant="outline" className="h-16 rounded-xl flex-col gap-1 hover:border-primary/50" onClick={openTrip}>
              <span className="text-lg">🌏</span><span className="text-xs font-medium">Trip.com</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">點擊會帶入你的搜尋條件，直接跳轉到對應平台查看即時票價</p>
        </div>
      </section>

      {searched && (
        <section className="py-8 flex-1">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">找到 <span className="font-semibold text-foreground">{sorted.length}</span> 個航班</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={openGoogleFlights}>
                  <Plane className="w-3.5 h-3.5" />Google Flights
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={openSkyscanner}>
                  <Search className="w-3.5 h-3.5" />Skyscanner
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">價格最低</SelectItem>
                    <SelectItem value="duration">飛行最短</SelectItem>
                    <SelectItem value="time">最早出發</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {sorted.map((flight, i) => (
                <motion.div key={flight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <Card className="hover:border-primary/30 transition-colors border-border/50">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Airline with logo */}
                        <div className="flex items-center gap-3 min-w-[150px]">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: flight.airline.color }}>
                            {flight.airline.abbr}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{flight.airline.name}</p>
                            <p className="text-xs text-muted-foreground">{flight.flightCode}</p>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-sans)" }}>{flight.departTime}</p>
                            <p className="text-xs text-muted-foreground">{getCityName(flight.from)}</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{flight.duration}</span>
                            <div className="w-full h-px bg-border relative"><ArrowRight className="w-3 h-3 text-muted-foreground absolute right-0 -top-1.5" /></div>
                            <Badge variant={flight.stops === 0 ? "default" : "outline"} className="text-xs rounded-full">{flight.stops === 0 ? "直飛" : `${flight.stops} 轉`}</Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-sans)" }}>{flight.arriveTime}</p>
                            <p className="text-xs text-muted-foreground">{getCityName(flight.to)}</p>
                          </div>
                        </div>

                        {/* Price & Book */}
                        <div className="text-right min-w-[130px]">
                          <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>NT${flight.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mb-2">{flight.cabinClass} / 人</p>
                          <Button size="sm" className="rounded-full px-5" onClick={() => setBookingFlight(flight)}>選擇</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Confirmation Dialog */}
      <Dialog open={!!bookingFlight} onOpenChange={() => setBookingFlight(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>確認訂票</DialogTitle></DialogHeader>
          {bookingFlight && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: bookingFlight.airline.color }}>{bookingFlight.airline.abbr}</div>
                <div>
                  <p className="font-bold">{bookingFlight.airline.name}</p>
                  <p className="text-sm text-muted-foreground">{bookingFlight.flightCode}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold">{bookingFlight.departTime}</p>
                  <p className="text-xs text-muted-foreground">{getCityName(bookingFlight.from)}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{bookingFlight.duration}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{bookingFlight.arriveTime}</p>
                  <p className="text-xs text-muted-foreground">{getCityName(bookingFlight.to)}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">出發日期</span><span>{departDate}</span></div>
                {tripType === "roundtrip" && <div className="flex justify-between"><span className="text-muted-foreground">回程日期</span><span>{returnDate}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">乘客人數</span><span>{paxCount} 位</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">艙等</span><span>{cabinClass === "economy" ? "經濟艙" : cabinClass === "business" ? "商務艙" : "頭等艙"}</span></div>
              </div>

              <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>票價 x {paxCount} 人</span><span>NT${(bookingFlight.price * paxCount).toLocaleString()}</span></div>
                {tripType === "roundtrip" && <div className="flex justify-between text-sm"><span>來回加價</span><span>NT${Math.round(bookingFlight.price * paxCount * 0.85).toLocaleString()}</span></div>}
                <div className="flex justify-between text-sm"><span>稅金及附加費</span><span>NT${Math.round(bookingFlight.price * paxCount * 0.15).toLocaleString()}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>總計</span>
                  <span className="text-primary">NT${(
                    bookingFlight.price * paxCount +
                    (tripType === "roundtrip" ? Math.round(bookingFlight.price * paxCount * 0.85) : 0) +
                    Math.round(bookingFlight.price * paxCount * 0.15)
                  ).toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full rounded-xl h-12 gap-2" onClick={handleBook}><Check className="w-4 h-4" />確認訂票</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
