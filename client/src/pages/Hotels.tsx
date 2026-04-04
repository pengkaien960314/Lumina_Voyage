/*
 * Design: Organic Naturalism — Hotels Page
 * - Hotel search with filters
 * - Card-based hotel listings
 * - Booking dialog
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Star, MapPin, Wifi, Car, Coffee, Waves, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const hotels = [
  { id: 1, name: "京都嵐山翠嵐豪華精選酒店", location: "日本京都", rating: 4.9, price: 12800, currency: "TWD", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", amenities: ["wifi", "parking", "pool"], type: "豪華", rooms: 39 },
  { id: 2, name: "聖托里尼卡納維斯伊亞酒店", location: "希臘聖托里尼", rating: 4.8, price: 15600, currency: "TWD", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", amenities: ["wifi", "pool", "breakfast"], type: "精品", rooms: 22 },
  { id: 3, name: "峇里島烏布空中花園酒店", location: "印尼峇里島", rating: 4.7, price: 8900, currency: "TWD", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", amenities: ["wifi", "pool", "breakfast", "parking"], type: "度假村", rooms: 56 },
  { id: 4, name: "巴黎香格里拉酒店", location: "法國巴黎", rating: 4.8, price: 22000, currency: "TWD", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", amenities: ["wifi", "breakfast", "parking"], type: "豪華", rooms: 101 },
  { id: 5, name: "東京安達仕酒店", location: "日本東京", rating: 4.6, price: 11500, currency: "TWD", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", amenities: ["wifi", "pool"], type: "商務", rooms: 164 },
  { id: 6, name: "馬爾地夫瑞吉度假村", location: "馬爾地夫", rating: 4.9, price: 35000, currency: "TWD", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", amenities: ["wifi", "pool", "breakfast", "parking"], type: "度假村", rooms: 77 },
];

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parking: { icon: Car, label: "停車場" },
  breakfast: { icon: Coffee, label: "早餐" },
  pool: { icon: Waves, label: "泳池" },
};

export default function Hotels() {
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);

  const filtered = hotels.filter((h) => {
    const matchSearch = h.name.includes(search) || h.location.includes(search);
    const matchPrice =
      priceRange === "all" ||
      (priceRange === "low" && h.price < 10000) ||
      (priceRange === "mid" && h.price >= 10000 && h.price < 20000) ||
      (priceRange === "high" && h.price >= 20000);
    return matchSearch && matchPrice;
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              旅館預訂
            </h1>
            <p className="text-muted-foreground mb-6">
              精選全球優質住宿，為你的旅程找到完美落腳處
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋旅館名稱或地點..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
                  <SelectValue placeholder="價格範圍" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有價格</SelectItem>
                  <SelectItem value="low">$10,000 以下</SelectItem>
                  <SelectItem value="mid">$10,000 - $20,000</SelectItem>
                  <SelectItem value="high">$20,000 以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="organic-card overflow-hidden border-border/50 group h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <Badge className="absolute top-3 left-3 rounded-full bg-white/90 text-stone-700 border-0">
                      {hotel.type}
                    </Badge>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {hotel.rooms} 間房
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {hotel.location}
                    </div>

                    {/* Amenities */}
                    <div className="flex gap-2 mb-4">
                      {hotel.amenities.map((a) => {
                        const info = amenityIcons[a];
                        if (!info) return null;
                        const Icon = info.icon;
                        return (
                          <div
                            key={a}
                            className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-lg"
                          >
                            <Icon className="w-3 h-3" />
                            {info.label}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>
                          ${hotel.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">/ 晚</span>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full px-5"
                        onClick={() => setSelectedHotel(hotel)}
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        預訂
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>預訂確認</DialogTitle>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4 mt-4">
              <div className="rounded-xl overflow-hidden">
                <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-40 object-cover" />
              </div>
              <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{selectedHotel.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>入住日期</Label>
                  <Input type="date" defaultValue="2026-05-01" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>退房日期</Label>
                  <Input type="date" defaultValue="2026-05-03" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>房客人數</Label>
                <Select defaultValue="2">
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 位</SelectItem>
                    <SelectItem value="2">2 位</SelectItem>
                    <SelectItem value="3">3 位</SelectItem>
                    <SelectItem value="4">4 位</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-accent/50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>房價 x 2 晚</span>
                  <span>${(selectedHotel.price * 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>服務費</span>
                  <span>${Math.round(selectedHotel.price * 0.1).toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>總計</span>
                  <span className="text-primary">${(selectedHotel.price * 2 + Math.round(selectedHotel.price * 0.1)).toLocaleString()}</span>
                </div>
              </div>
              <Button
                className="w-full rounded-xl h-12"
                onClick={() => {
                  setSelectedHotel(null);
                  toast.success("預訂成功！確認信已發送至您的信箱");
                }}
              >
                確認預訂
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
