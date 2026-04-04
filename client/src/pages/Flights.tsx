/*
 * Design: Organic Naturalism — Flights Page
 * - Flight search form
 * - Results with airline cards
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, ArrowRight, Clock, Search, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sampleFlights = [
  { id: 1, airline: "中華航空", code: "CI-838", from: "TPE", to: "NRT", departTime: "08:30", arriveTime: "12:45", duration: "3h 15m", price: 8900, stops: 0, class: "經濟艙" },
  { id: 2, airline: "日本航空", code: "JL-802", from: "TPE", to: "NRT", departTime: "10:15", arriveTime: "14:20", duration: "3h 05m", price: 11200, stops: 0, class: "經濟艙" },
  { id: 3, airline: "長榮航空", code: "BR-198", from: "TPE", to: "NRT", departTime: "14:00", arriveTime: "18:10", duration: "3h 10m", price: 9500, stops: 0, class: "經濟艙" },
  { id: 4, airline: "國泰航空", code: "CX-450", from: "TPE", to: "NRT", departTime: "07:00", arriveTime: "14:30", duration: "6h 30m", price: 7200, stops: 1, class: "經濟艙" },
  { id: 5, airline: "全日空", code: "NH-824", from: "TPE", to: "NRT", departTime: "16:30", arriveTime: "20:35", duration: "3h 05m", price: 10800, stops: 0, class: "經濟艙" },
];

export default function Flights() {
  const [from, setFrom] = useState("TPE - 台北桃園");
  const [to, setTo] = useState("NRT - 東京成田");
  const [date, setDate] = useState("2026-05-01");
  const [passengers, setPassengers] = useState("1");
  const [searched, setSearched] = useState(true);
  const [sortBy, setSortBy] = useState("price");

  const sorted = [...sampleFlights].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "duration") return a.duration.localeCompare(b.duration);
    return a.departTime.localeCompare(b.departTime);
  });

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
              <Plane className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                機票查詢
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              搜尋最優惠的機票，輕鬆規劃你的旅程
            </p>

            {/* Search Form */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label style={{ fontFamily: "var(--font-sans)" }}>出發地</Label>
                    <Input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label style={{ fontFamily: "var(--font-sans)" }}>目的地</Label>
                    <Input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <button
                      className="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors hidden md:flex"
                      onClick={() => { setFrom(to); setTo(from); }}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label style={{ fontFamily: "var(--font-sans)" }}>出發日期</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ fontFamily: "var(--font-sans)" }}>乘客人數</Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 位乘客</SelectItem>
                        <SelectItem value="2">2 位乘客</SelectItem>
                        <SelectItem value="3">3 位乘客</SelectItem>
                        <SelectItem value="4">4 位乘客</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="opacity-0">搜尋</Label>
                    <Button
                      className="w-full h-11 rounded-xl gap-2"
                      onClick={() => {
                        setSearched(true);
                        toast.success("已找到最佳航班");
                      }}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <Search className="w-4 h-4" />
                      搜尋
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {searched && (
        <section className="py-8 flex-1">
          <div className="container max-w-4xl">
            {/* Sort */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                找到 <span className="font-semibold text-foreground">{sorted.length}</span> 個航班
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">價格最低</SelectItem>
                  <SelectItem value="duration">飛行最短</SelectItem>
                  <SelectItem value="time">最早出發</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {sorted.map((flight, i) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="hover:border-primary/30 transition-colors border-border/50">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Airline */}
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Plane className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{flight.airline}</p>
                            <p className="text-xs text-muted-foreground">{flight.code}</p>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-sans)" }}>{flight.departTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.from}</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {flight.duration}
                            </span>
                            <div className="w-full h-px bg-border relative">
                              <ArrowRight className="w-3 h-3 text-muted-foreground absolute right-0 -top-1.5" />
                            </div>
                            <Badge variant={flight.stops === 0 ? "default" : "outline"} className="text-xs rounded-full">
                              {flight.stops === 0 ? "直飛" : `${flight.stops} 轉`}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-sans)" }}>{flight.arriveTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.to}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[120px]">
                          <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>
                            ${flight.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">{flight.class}</p>
                          <Button
                            size="sm"
                            className="rounded-full px-5"
                            onClick={() => toast.success(`已選擇 ${flight.airline} ${flight.code}`)}
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            選擇
                          </Button>
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

      <Footer />
    </div>
  );
}
