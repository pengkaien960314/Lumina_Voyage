/*
 * Design: Organic Naturalism — Hotels Page
 * - 5 Hokkaido hotels + original hotels
 * - Card images without top whitespace
 * - Detail dialog with intro, facilities, images, address, navigation, reviews, booking
 * - Price range slider, guests up to 6 + custom input
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, MapPin, Wifi, Car, Coffee, Waves, Users, Calendar, Navigation, Phone, Globe, Dumbbell, Utensils, Bath, Minus, Plus as PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useBooking } from "@/contexts/BookingContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Review {
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  price: number;
  currency: string;
  images: string[];
  amenities: string[];
  type: string;
  rooms: number;
  description: string;
  highlights: string[];
  reviews: Review[];
}

const hotels: Hotel[] = [
  {
    id: 1, name: "札幌 JR Tower 日航酒店", location: "北海道札幌市", address: "北海道札幌市中央區北5條西2丁目5番地", phone: "+81-11-251-2222", website: "https://www.jrhotels.co.jp", rating: 4.7, price: 6800, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"],
    amenities: ["wifi", "parking", "breakfast", "gym", "restaurant"], type: "商務", rooms: 350,
    description: "直通 JR 札幌站，交通極為便利。酒店位於 JR Tower 高層，客房可俯瞰札幌市區全景。設有多間餐廳、健身中心及天然溫泉大浴場，是商務與觀光旅客的理想選擇。",
    highlights: ["直通 JR 札幌站", "高層景觀客房", "天然溫泉大浴場", "多間特色餐廳"],
    reviews: [
      { author: "旅行者小林", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi", rating: 5, text: "位置超棒！直接連通車站，冬天不用在外面走。房間景觀很好，可以看到整個札幌市區。", date: "2026-02-15" },
      { author: "美食家小王", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=foodie", rating: 4, text: "早餐很豐盛，有北海道特色料理。溫泉也很舒服，推薦！", date: "2026-01-20" },
    ],
  },
  {
    id: 2, name: "函館 La Vista 海峽之風", location: "北海道函館市", address: "北海道函館市豐川町12-6", phone: "+81-138-23-6111", website: "https://www.hotespa.net", rating: 4.8, price: 9200, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"],
    amenities: ["wifi", "breakfast", "spa", "restaurant"], type: "溫泉旅館", rooms: 350,
    description: "位於函館灣區的人氣溫泉酒店，頂樓露天溫泉可眺望函館山和津輕海峽。以豐盛的海鮮自助早餐聞名，連續多年獲得旅客高度評價。",
    highlights: ["頂樓露天溫泉", "海鮮自助早餐", "函館灣區絕佳位置", "可眺望函館山"],
    reviews: [
      { author: "溫泉達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=onsen", rating: 5, text: "頂樓溫泉看夜景真的太享受了！早餐的海鮮丼是我吃過最好吃的。", date: "2026-03-10" },
      { author: "攝影師阿明", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=photographer", rating: 5, text: "從房間就能看到函館山，日落時分的景色絕美。", date: "2026-02-28" },
    ],
  },
  {
    id: 3, name: "星野 TOMAMU 度假村", location: "北海道占冠村", address: "北海道勇拂郡占冠村中TOMAMU", phone: "+81-167-58-1111", website: "https://www.snowtomamu.jp", rating: 4.9, price: 14500, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"],
    amenities: ["wifi", "parking", "pool", "gym", "restaurant", "spa"], type: "度假村", rooms: 200,
    description: "星野集團旗下的頂級度假村，冬季是粉雪天堂，夏季則有雲海平台和微笑海灘等設施。全年提供豐富的戶外活動和自然體驗，適合家庭和情侶。",
    highlights: ["雲海平台絕景", "冬季粉雪滑雪", "日本最大室內海灘", "星野集團頂級服務"],
    reviews: [
      { author: "滑雪愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=skier", rating: 5, text: "粉雪真的太棒了！雲海平台的日出讓人感動到想哭。", date: "2026-01-05" },
      { author: "親子旅遊達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=family", rating: 5, text: "帶小朋友來玩超開心，室內海灘和各種活動都很棒。", date: "2025-12-20" },
    ],
  },
  {
    id: 4, name: "小樽朝里克拉瑟酒店", location: "北海道小樽市", address: "北海道小樽市朝里川溫泉2丁目676", phone: "+81-134-52-3800", website: "https://www.classe-hotel.com", rating: 4.6, price: 7500, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"],
    amenities: ["wifi", "parking", "spa", "restaurant"], type: "溫泉旅館", rooms: 171,
    description: "位於小樽朝里川溫泉區的度假酒店，被大自然環繞。設有天然溫泉、室內外泳池及多間餐廳。距離小樽運河車程約15分鐘，是遠離喧囂的理想住所。",
    highlights: ["天然溫泉", "被大自然環繞", "近小樽運河", "四季不同景色"],
    reviews: [
      { author: "自然愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=nature", rating: 4, text: "環境很安靜，溫泉水質很好。秋天來的話紅葉超美。", date: "2025-11-15" },
    ],
  },
  {
    id: 5, name: "洞爺湖萬世閣", location: "北海道洞爺湖町", address: "北海道虻田郡洞爺湖町洞爺湖溫泉21", phone: "+81-142-73-3500", website: "https://www.toyamanseikaku.jp", rating: 4.5, price: 8800, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"],
    amenities: ["wifi", "breakfast", "spa", "pool", "restaurant"], type: "溫泉旅館", rooms: 246,
    description: "面朝洞爺湖的大型溫泉旅館，露天溫泉可直接欣賞湖景和羊蹄山。每年4月至10月的花火大會期間，可從房間直接觀賞煙火，是北海道最受歡迎的溫泉旅館之一。",
    highlights: ["湖景露天溫泉", "花火大會觀賞", "羊蹄山絕景", "豐盛自助餐"],
    reviews: [
      { author: "情侶旅行", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=couple", rating: 5, text: "在露天溫泉看洞爺湖的花火，太浪漫了！", date: "2025-08-10" },
      { author: "美食家", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=gourmet", rating: 4, text: "自助餐的螃蟹吃到飽很過癮，溫泉也很舒服。", date: "2025-09-20" },
    ],
  },
  {
    id: 6, name: "京都嵐山翠嵐豪華精選酒店", location: "日本京都", address: "京都府京都市右京區嵯峨天龍寺芒之馬場町12", phone: "+81-75-872-0101", website: "https://www.suirankyoto.com", rating: 4.9, price: 12800, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"],
    amenities: ["wifi", "parking", "spa", "restaurant"], type: "豪華", rooms: 39,
    description: "嵐山保津川畔的頂級酒店，融合日式傳統與現代奢華。每間客房都能欣賞到嵐山的自然美景，設有私人溫泉和米其林餐廳。",
    highlights: ["保津川畔絕景", "私人溫泉", "米其林餐廳", "日式奢華體驗"],
    reviews: [
      { author: "奢旅達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=luxury", rating: 5, text: "此生住過最美的酒店之一，每個細節都很完美。", date: "2025-11-01" },
    ],
  },
];

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parking: { icon: Car, label: "停車場" },
  breakfast: { icon: Coffee, label: "早餐" },
  pool: { icon: Waves, label: "泳池" },
  gym: { icon: Dumbbell, label: "健身房" },
  restaurant: { icon: Utensils, label: "餐廳" },
  spa: { icon: Bath, label: "溫泉/SPA" },
};

export default function Hotels() {
  const { addHotelBooking } = useBooking();
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number]>([40000]);
  const [minPrice, setMinPrice] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [detailTab, setDetailTab] = useState("info");
  const [detailImageIdx, setDetailImageIdx] = useState(0);
  const [bookingGuests, setBookingGuests] = useState(2);
  const [customGuests, setCustomGuests] = useState("");
  const [checkIn, setCheckIn] = useState("2026-05-01");
  const [checkOut, setCheckOut] = useState("2026-05-03");

  const filtered = hotels.filter((h) => {
    const matchSearch = h.name.includes(search) || h.location.includes(search);
    const matchPrice = h.price >= minPrice && h.price <= priceRange[0];
    return matchSearch && matchPrice;
  });

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const guestCount = customGuests ? parseInt(customGuests) || bookingGuests : bookingGuests;

  const handleBook = () => {
    if (!selectedHotel) return;
    const totalPrice = selectedHotel.price * nights + Math.round(selectedHotel.price * nights * 0.1);
    addHotelBooking({
      id: `hb${Date.now()}`, hotelName: selectedHotel.name, location: selectedHotel.location,
      image: selectedHotel.images[0], checkIn, checkOut, guests: guestCount,
      roomType: selectedHotel.type, pricePerNight: selectedHotel.price, totalPrice,
      status: "confirmed", bookedAt: new Date().toISOString(),
    });
    setSelectedHotel(null);
    toast.success("預訂成功！確認信已發送至您的信箱");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>旅館預訂</h1>
            <p className="text-muted-foreground mb-6">精選全球優質住宿，為你的旅程找到完美落腳處</p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜尋旅館名稱或地點..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">價格範圍</Label>
                <span className="text-sm text-muted-foreground">NT${minPrice.toLocaleString()} — NT${priceRange[0].toLocaleString()}</span>
              </div>
              <div className="flex gap-4 items-center">
                <Input type="number" value={minPrice === 0 ? "0" : minPrice || ""} onChange={(e) => { const v = e.target.value; setMinPrice(v === "" ? 0 : parseInt(v) || 0); }} className="w-28 rounded-xl h-9 text-sm" placeholder="最低" />
                <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number])} min={0} max={40000} step={500} className="flex-1" />
                <Input type="number" value={priceRange[0] || ""} onChange={(e) => { const v = e.target.value; setPriceRange([v === "" ? 40000 : parseInt(v) || 40000]); }} className="w-28 rounded-xl h-9 text-sm" placeholder="最高" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-4">找到 {filtered.length} 間旅館</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hotel, i) => (
              <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Card className="organic-card overflow-hidden border-border/50 group h-full flex flex-col cursor-pointer" onClick={() => { setSelectedHotel(hotel); setDetailTab("info"); setDetailImageIdx(0); }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <Badge className="absolute top-3 left-3 rounded-full bg-white/90 text-stone-700 border-0">{hotel.type}</Badge>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white text-sm font-medium">{hotel.rating}</span>
                        <span className="text-white/60 text-xs ml-1">({hotel.reviews.length} 則評論)</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>{hotel.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5" />{hotel.location}
                    </div>
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {hotel.amenities.slice(0, 4).map((a) => {
                        const info = amenityIcons[a];
                        if (!info) return null;
                        const Icon = info.icon;
                        return <div key={a} className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-lg"><Icon className="w-3 h-3" />{info.label}</div>;
                      })}
                      {hotel.amenities.length > 4 && <div className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-lg">+{hotel.amenities.length - 4}</div>}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-sans)" }}>NT${hotel.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ 晚</span>
                      </div>
                      <Button size="sm" className="rounded-full px-5" onClick={(e) => { e.stopPropagation(); setSelectedHotel(hotel); setDetailTab("booking"); }}>預訂</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>{selectedHotel?.name}</DialogTitle></DialogHeader>
          {selectedHotel && (
            <div>
              {/* Image Carousel */}
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img src={selectedHotel.images[detailImageIdx]} alt={selectedHotel.name} className="w-full h-56 object-cover" />
                {selectedHotel.images.length > 1 && (
                  <>
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60" onClick={() => setDetailImageIdx((prev) => (prev - 1 + selectedHotel.images.length) % selectedHotel.images.length)}><ChevronLeft className="w-4 h-4" /></button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60" onClick={() => setDetailImageIdx((prev) => (prev + 1) % selectedHotel.images.length)}><ChevronRight className="w-4 h-4" /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selectedHotel.images.map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full ${idx === detailImageIdx ? "bg-white" : "bg-white/40"}`} />)}
                    </div>
                  </>
                )}
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="grid grid-cols-4 h-10 rounded-xl bg-secondary/50 p-1 mb-4">
                  <TabsTrigger value="info" className="rounded-lg text-xs">簡介</TabsTrigger>
                  <TabsTrigger value="facilities" className="rounded-lg text-xs">設施</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-lg text-xs">評論</TabsTrigger>
                  <TabsTrigger value="booking" className="rounded-lg text-xs">預訂</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>{selectedHotel.description}</p>
                  <div>
                    <h4 className="text-sm font-bold mb-2">特色亮點</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedHotel.highlights.map((h, i) => <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-2"><Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />{h}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-primary" /><span>{selectedHotel.address}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-primary" /><span>{selectedHotel.phone}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-primary" /><a href={selectedHotel.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedHotel.website}</a></div>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl gap-2" onClick={() => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHotel.address)}`, "_blank"); }}><Navigation className="w-4 h-4" />在 Google Maps 中導航</Button>
                </TabsContent>

                <TabsContent value="facilities">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedHotel.amenities.map((a) => {
                      const info = amenityIcons[a];
                      if (!info) return null;
                      const Icon = info.icon;
                      return <div key={a} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"><Icon className="w-5 h-5 text-primary" /><span className="text-sm font-medium">{info.label}</span></div>;
                    })}
                  </div>
                  <div className="mt-4 p-4 bg-secondary/30 rounded-xl">
                    <h4 className="text-sm font-bold mb-2">房間資訊</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>房型：{selectedHotel.type}</div>
                      <div>總房數：{selectedHotel.rooms} 間</div>
                      <div>入住時間：15:00</div>
                      <div>退房時間：11:00</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl font-bold text-primary">{selectedHotel.rating}</div>
                    <div>
                      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(selectedHotel.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />)}</div>
                      <p className="text-xs text-muted-foreground">{selectedHotel.reviews.length} 則評論</p>
                    </div>
                  </div>
                  {selectedHotel.reviews.map((r, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-secondary/30 rounded-xl">
                      <Avatar className="w-9 h-9"><AvatarImage src={r.avatar} /><AvatarFallback>{r.author[0]}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{r.author}</span>
                          <span className="text-[10px] text-muted-foreground">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />)}</div>
                        <p className="text-xs text-muted-foreground">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="booking" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">入住日期</Label>
                      <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">退房日期</Label>
                      <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">房客人數</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <Button key={n} variant={bookingGuests === n && !customGuests ? "default" : "outline"} size="sm" className="rounded-full w-10 h-10 p-0" onClick={() => { setBookingGuests(n); setCustomGuests(""); }}>{n}</Button>
                      ))}
                      <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0" onClick={() => { const cur = parseInt(customGuests) || bookingGuests; const v = Math.max(1, cur - 1); setCustomGuests(String(v)); }}><Minus className="w-3 h-3" /></Button>
                        <Input type="number" value={customGuests || String(bookingGuests)} onChange={(e) => { const v = e.target.value; setCustomGuests(v); if (v && parseInt(v) >= 1) setBookingGuests(parseInt(v)); }} className="w-14 h-8 rounded-lg text-center text-xs" min={1} />
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0" onClick={() => { const cur = parseInt(customGuests) || bookingGuests; setCustomGuests(String(cur + 1)); }}><PlusIcon className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span>房價 x {nights} 晚</span><span>NT${(selectedHotel.price * nights).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span>服務費</span><span>NT${Math.round(selectedHotel.price * nights * 0.1).toLocaleString()}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold"><span>總計</span><span className="text-primary">NT${(selectedHotel.price * nights + Math.round(selectedHotel.price * nights * 0.1)).toLocaleString()}</span></div>
                  </div>
                  <Button className="w-full rounded-xl h-12" onClick={handleBook}>確認預訂</Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
