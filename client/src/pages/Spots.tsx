/*
 * Design: Organic Naturalism — Spots Page
 * - Card-based layout for browsing destinations
 * - Filter/search bar
 * - Organic card hover effects
 */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, Heart, Filter } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allSpots = [
  { id: 1, name: "京都・伏見稻荷大社", location: "日本京都", rating: 4.9, category: "文化", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp", description: "千本鳥居的壯觀景象，感受日本傳統文化的深厚魅力與神秘氛圍。", price: "免費" },
  { id: 2, name: "聖托里尼・伊亞小鎮", location: "希臘愛琴海", rating: 4.8, category: "海島", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp", description: "白色建築與藍色穹頂的夢幻組合，世界最美的日落觀賞地。", price: "€20" },
  { id: 3, name: "峇里島・烏布梯田", location: "印尼峇里島", rating: 4.7, category: "自然", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp", description: "翠綠梯田與古老寺廟交織的熱帶天堂，感受大自然的鬼斧神工。", price: "IDR 50K" },
  { id: 4, name: "巴黎・艾菲爾鐵塔", location: "法國巴黎", rating: 4.6, category: "城市", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", description: "浪漫之都的標誌性建築，夜晚的燈光秀更是令人難忘。", price: "€26" },
  { id: 5, name: "馬爾地夫・水上別墅", location: "馬爾地夫", rating: 4.9, category: "海島", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", description: "碧藍海水上的夢幻住宿體驗，與海洋零距離接觸。", price: "$500/晚" },
  { id: 6, name: "瑞士・少女峰", location: "瑞士因特拉肯", rating: 4.8, category: "自然", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", description: "歐洲之巔的壯麗雪景，搭乘齒軌火車穿越阿爾卑斯山。", price: "CHF 210" },
  { id: 7, name: "紐約・中央公園", location: "美國紐約", rating: 4.5, category: "城市", image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80", description: "都市中的綠洲，四季皆有不同風情的城市公園。", price: "免費" },
  { id: 8, name: "冰島・藍湖溫泉", location: "冰島雷克雅維克", rating: 4.7, category: "自然", image: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80", description: "乳藍色的地熱溫泉，在冰天雪地中享受溫暖的擁抱。", price: "ISK 9990" },
  { id: 9, name: "清邁・古城寺廟群", location: "泰國清邁", rating: 4.6, category: "文化", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80", description: "數百座古老寺廟散布其中，感受蘭納王朝的歷史底蘊。", price: "THB 40" },
];

const categories = ["全部", "文化", "自然", "海島", "城市"];

export default function Spots() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filtered = allSpots.filter((s) => {
    const matchSearch = s.name.includes(search) || s.location.includes(search);
    const matchCategory = category === "全部" || s.category === category;
    return matchSearch && matchCategory;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              探索景點
            </h1>
            <p className="text-muted-foreground mb-6">
              發現世界各地令人驚嘆的旅遊目的地
            </p>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋景點名稱或地點..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Badges */}
      <section className="py-4 border-b border-border/50">
        <div className="container flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Badge
              key={c}
              variant={category === c ? "default" : "outline"}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm"
              onClick={() => setCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </section>

      {/* Spots Grid */}
      <section className="py-8 flex-1">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">
            共找到 <span className="font-semibold text-foreground">{filtered.length}</span> 個景點
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="organic-card overflow-hidden bg-card border border-border/50 group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(spot.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(spot.id) ? "fill-red-500 text-red-500" : "text-stone-600"
                      }`}
                    />
                  </button>

                  {/* Category badge */}
                  <Badge className="absolute top-3 left-3 rounded-full bg-white/80 text-stone-700 backdrop-blur-sm border-0 text-xs">
                    {spot.category}
                  </Badge>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-stone-800">
                    {spot.price}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{spot.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {spot.location}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{spot.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
