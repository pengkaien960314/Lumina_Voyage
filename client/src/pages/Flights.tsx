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
import { Plane, ArrowRight, Clock, Search, ArrowLeftRight, Minus, Plus, X, Check, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useBooking } from "@/contexts/BookingContext";
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

const generateFlights = (from: string, to: string, cabin: string): FlightResult[] => {
  const times = ["06:30", "08:15", "10:00", "12:30", "14:45", "16:20", "18:00", "20:30"];
  const cabinMultiplier = cabin === "first" ? 4.2 : cabin === "business" ? 2.5 : 1;
  const cabinLabel = cabin === "first" ? "頭等艙" : cabin === "business" ? "商務艙" : "經濟艙";
  return airlines.slice(0, 6).map((al, i) => {
    const dept = times[i % times.length];
    const dh = parseInt(dept.split(":")[0]);
    const dm = parseInt(dept.split(":")[1]);
    const dur = 2 + Math.floor(Math.random() * 4);
    const ah = (dh + dur) % 24;
    const am = (dm + Math.floor(Math.random() * 50)) % 60;
    const basePrice = 3000 + Math.floor(Math.random() * 15000);
    return {
      id: i + 1, airline: al, flightCode: `${al.code}-${100 + Math.floor(Math.random() * 900)}`,
      from, to, departTime: dept, arriveTime: `${String(ah).padStart(2, "0")}:${String(am).padStart(2, "0")}`,
      duration: `${dur}h ${Math.floor(Math.random() * 50 + 5)}m`,
      price: Math.round(basePrice * cabinMultiplier), stops: i === 4 ? 1 : 0,
      cabinClass: cabinLabel,
    };
  });
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

  const handleSearch = () => {
    const f = tripType === "multicity" ? multiCities[0].from : fromCity;
    const t = tripType === "multicity" ? multiCities[0].to : toCity;
    setFlights(generateFlights(f, t, cabinClass));
    setSearched(true);
    toast.success("已找到最佳航班");
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
                      <Button className="w-full h-11 rounded-xl gap-2" onClick={handleSearch}><Search className="w-4 h-4" />搜尋</Button>
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
                      <Button className="rounded-xl gap-2 flex-1" onClick={handleSearch}><Search className="w-4 h-4" />搜尋</Button>
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

      {searched && (
        <section className="py-8 flex-1">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">找到 <span className="font-semibold text-foreground">{sorted.length}</span> 個航班</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">價格最低</SelectItem>
                  <SelectItem value="duration">飛行最短</SelectItem>
                  <SelectItem value="time">最早出發</SelectItem>
                </SelectContent>
              </Select>
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
