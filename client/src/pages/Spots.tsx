/*
 * Design: Organic Naturalism — Spots Page
 * - Interactive flip cards with zoom animation
 * - 10 Hokkaido spots popular with young travelers
 */
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, Heart, Filter, X, Train, Clock, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Spot {
  id: number;
  name: string;
  location: string;
  rating: number;
  category: string;
  image: string;
  description: string;
  price: string;
  highlights: string[];
  access: string;
  hours: string;
  backDesc: string;
}

const allSpots: Spot[] = [
  { id: 1, name: "小樽運河", location: "北海道小樽市", rating: 4.8, category: "文化", image: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=800&q=80", description: "浪漫運河與石造倉庫群，冬季雪燈路超夢幻", price: "免費", highlights: ["雪燈路祭典", "玻璃工藝體驗", "運河遊船"], access: "JR小樽站步行10分鐘", hours: "全天開放", backDesc: "小樽運河建於1923年，全長1,140公尺，沿岸的石造倉庫群已改建為餐廳、商店和博物館。冬季的雪燈路祭典期間，運河兩旁點滿蠟燭與雪燈，營造出如夢似幻的氛圍，是北海道最具代表性的浪漫景點之一。" },
  { id: 2, name: "富良野薰衣草花田", location: "北海道富良野市", rating: 4.9, category: "自然", image: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&q=80", description: "夏季限定的紫色花海，富田農場必訪", price: "免費", highlights: ["薰衣草冰淇淋", "彩色花田", "精油工坊"], access: "JR薰衣草花田站步行7分鐘", hours: "8:30-18:00（夏季）", backDesc: "富田農場是北海道最著名的薰衣草觀賞地，每年7月中旬至8月上旬是最佳觀賞期。除了紫色薰衣草，還有彩虹般的花田，包括罌粟花、向日葵等。農場內的薰衣草冰淇淋和精油產品是人氣伴手禮。" },
  { id: 3, name: "函館山夜景", location: "北海道函館市", rating: 4.9, category: "城市", image: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800&q=80", description: "世界三大夜景之一，百萬夜景盡收眼底", price: "¥1,800", highlights: ["纜車體驗", "星形城郭", "日落時分最美"], access: "函館山纜車3分鐘", hours: "10:00-22:00", backDesc: "函館山標高334公尺，從山頂展望台可以俯瞰函館市區兩側被海灣環繞的獨特地形。入選世界三大夜景，與香港維多利亞港、那不勒斯齊名。建議日落前30分鐘上山，可以同時欣賞夕陽與夜景的完美過渡。" },
  { id: 4, name: "旭山動物園", location: "北海道旭川市", rating: 4.7, category: "親子", image: "https://images.unsplash.com/photo-1551972873-b7e8754e8e26?w=800&q=80", description: "日本最北動物園，企鵝散步超療癒", price: "¥1,000", highlights: ["企鵝散步", "海豹通道", "北極熊館"], access: "JR旭川站搭巴士40分鐘", hours: "9:30-17:15", backDesc: "旭山動物園以「行動展示」聞名，讓遊客可以近距離觀察動物的自然行為。冬季限定的企鵝散步是最大亮點，可愛的企鵝們在雪地中搖搖擺擺地走過遊客面前。海豹通道和北極熊館的設計也讓人驚嘆。" },
  { id: 5, name: "青池", location: "北海道美瑛町", rating: 4.8, category: "自然", image: "https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=800&q=80", description: "Apple桌布取景地，夢幻的鈷藍色湖面", price: "免費", highlights: ["冬季點燈", "Apple桌布", "白鬚瀑布"], access: "JR美瑛站開車20分鐘", hours: "全天開放", backDesc: "青池因被Apple選為macOS桌布而聞名世界。湖水呈現獨特的鈷藍色，是因為含有鋁的地下水與美瑛川的水混合產生的膠體粒子所致。枯木佇立水中的景象如夢似幻，冬季夜間點燈更是絕美。" },
  { id: 6, name: "登別地獄谷", location: "北海道登別市", rating: 4.6, category: "自然", image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80", description: "火山口遺跡的壯觀地熱景觀", price: "免費", highlights: ["溫泉體驗", "大湯沼", "閻魔堂"], access: "JR登別站搭巴士15分鐘", hours: "全天開放", backDesc: "登別地獄谷是約一萬年前火山爆發形成的火口遺跡，直徑約450公尺。谷中到處冒著白煙，硫磺味瀰漫，每天湧出約一萬噸的溫泉水。周邊有多家溫泉旅館，可以享受不同泉質的溫泉浴。" },
  { id: 7, name: "二世古滑雪場", location: "北海道俱知安町", rating: 4.9, category: "運動", image: "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&q=80", description: "世界級粉雪天堂，滑雪愛好者聖地", price: "¥6,600", highlights: ["粉雪體驗", "夜間滑雪", "溫泉度假村"], access: "新千歲機場搭巴士2.5小時", hours: "8:30-20:30（冬季）", backDesc: "二世古擁有世界頂級的粉雪品質，年均降雪量超過15公尺。四座相連的滑雪場提供超過80條雪道，從初學者到專業級都能找到適合的路線。滑雪後還能泡溫泉、享用美食，是冬季北海道的終極體驗。" },
  { id: 8, name: "札幌狸小路商店街", location: "北海道札幌市", rating: 4.5, category: "購物", image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80", description: "北海道最大商店街，美食購物一次滿足", price: "免費", highlights: ["藥妝購物", "湯咖哩", "居酒屋街"], access: "地鐵大通站步行5分鐘", hours: "10:00-22:00", backDesc: "狸小路商店街全長約900公尺，擁有超過200家店鋪，從藥妝店、服飾店到餐廳應有盡有。這裡是品嚐札幌名物湯咖哩、成吉思汗烤肉的好去處，也是購買北海道伴手禮的最佳地點。有頂棚遮蔽，下雨下雪都能舒適逛街。" },
  { id: 9, name: "洞爺湖", location: "北海道洞爺湖町", rating: 4.7, category: "自然", image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80", description: "火山湖畔的絕美風光，四季皆宜", price: "免費", highlights: ["花火大會", "有珠山纜車", "湖畔溫泉"], access: "JR洞爺站搭巴士20分鐘", hours: "全天開放", backDesc: "洞爺湖是日本第三大火山口湖，湖中有四座小島。每年4月至10月每晚都有花火大會，從湖畔溫泉旅館就能欣賞煙火。搭乘有珠山纜車可以俯瞰整個洞爺湖和昭和新山的壯觀景色。2008年G8峰會曾在此舉辦。" },
  { id: 10, name: "白色戀人公園", location: "北海道札幌市", rating: 4.6, category: "文化", image: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80", description: "白色戀人巧克力主題樂園，夢幻歐式建築", price: "¥800", highlights: ["DIY巧克力", "歐式花園", "限定甜點"], access: "地鐵宮之澤站步行7分鐘", hours: "10:00-17:00", backDesc: "白色戀人公園是北海道最知名的巧克力品牌「白色戀人」的主題樂園。園區內有歐式風格的建築和花園，可以參觀巧克力工廠、體驗DIY製作白色戀人餅乾。冬季的燈飾裝飾讓整個園區如同童話世界。" },
  // 原有景點
  { id: 11, name: "京都・伏見稻荷大社", location: "日本京都", rating: 4.9, category: "文化", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp", description: "千本鳥居的壯觀景象", price: "免費", highlights: ["千本鳥居", "稻荷山登山", "狐狸繪馬"], access: "JR稻荷站即達", hours: "全天開放", backDesc: "伏見稻荷大社是日本全國約3萬座稻荷神社的總本社，以數千座朱紅色鳥居聞名。沿著稻荷山的參道排列的鳥居形成壯觀的隧道，全程約4公里，步行約2小時。" },
  { id: 12, name: "聖托里尼・伊亞小鎮", location: "希臘愛琴海", rating: 4.8, category: "海島", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp", description: "白色建築與藍色穹頂的夢幻組合", price: "€20", highlights: ["日落觀賞", "藍頂教堂", "火山遊船"], access: "費拉搭巴士30分鐘", hours: "全天開放", backDesc: "伊亞小鎮位於聖托里尼島的北端，以壯麗的日落景色聞名於世。白色的基克拉迪式建築搭配藍色穹頂教堂，構成了明信片般的完美畫面。" },
  { id: 13, name: "峇里島・烏布梯田", location: "印尼峇里島", rating: 4.7, category: "自然", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp", description: "翠綠梯田與古老寺廟交織的熱帶天堂", price: "IDR 50K", highlights: ["德哥拉朗梯田", "猴子森林", "瑜伽體驗"], access: "登巴薩機場開車1.5小時", hours: "8:00-18:00", backDesc: "烏布是峇里島的文化中心，以壯觀的梯田景觀和豐富的藝術氛圍聞名。德哥拉朗梯田被列為世界文化遺產，展現了峇里島傳統的灌溉系統。" },
];

const categories = ["全部", "文化", "自然", "海島", "城市", "親子", "運動", "購物"];

export default function Spots() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const filtered = allSpots.filter((s) => {
    const matchSearch = s.name.includes(search) || s.location.includes(search);
    const matchCategory = category === "全部" || s.category === category;
    return matchSearch && matchCategory;
  });

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const handleFlip = (id: number) => {
    setFlippedId(flippedId === id ? null : id);
  };

  const flippedSpot = allSpots.find((s) => s.id === flippedId);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setFlippedId(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>探索景點</h1>
            <p className="text-muted-foreground mb-6">發現世界各地令人驚嘆的旅遊目的地，點擊卡片翻轉查看詳情</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜尋景點名稱或地點..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-4 border-b border-border/50">
        <div className="container flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Badge key={c} variant={category === c ? "default" : "outline"} className="cursor-pointer rounded-full px-4 py-1.5 text-sm" onClick={() => setCategory(c)}>{c}</Badge>
          ))}
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">共找到 <span className="font-semibold text-foreground">{filtered.length}</span> 個景點</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="cursor-pointer"
                style={{ perspective: "1200px" }}
                onClick={() => handleFlip(spot.id)}
              >
                <div className="organic-card overflow-hidden bg-card border border-border/50 group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <button onClick={(e) => toggleFavorite(e, spot.id)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className={`w-4 h-4 ${favorites.includes(spot.id) ? "fill-red-500 text-red-500" : "text-stone-600"}`} />
                    </button>
                    <Badge className="absolute top-3 left-3 rounded-full bg-white/80 text-stone-700 backdrop-blur-sm border-0 text-xs">{spot.category}</Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>{spot.name}</h3>
                      <div className="flex items-center gap-1.5 text-white/90 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />{spot.location}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{spot.rating}</span></div>
                      <span className="text-sm font-semibold text-primary">{spot.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{spot.description}</p>
                    <p className="text-xs text-primary/70 mt-2 text-center">點擊翻轉查看詳情 →</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flip Overlay Modal */}
      <AnimatePresence>
        {flippedSpot && (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFlippedId(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-lg z-10"
              initial={{ scale: 0.7, rotateY: 0 }}
              animate={{ scale: 1, rotateY: 180 }}
              exit={{ scale: 0.7, rotateY: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Back face content (shown after flip) */}
              <div
                className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                {/* Header image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={flippedSpot.image} alt={flippedSpot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <button onClick={() => setFlippedId(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm rounded-full mb-2">{flippedSpot.category}</Badge>
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{flippedSpot.name}</h2>
                    <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{flippedSpot.location}</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{flippedSpot.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                  <p className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>{flippedSpot.backDesc}</p>

                  {/* Highlights */}
                  <div>
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" />亮點特色</h3>
                    <div className="flex flex-wrap gap-2">
                      {flippedSpot.highlights.map((h) => (
                        <Badge key={h} variant="outline" className="rounded-full text-xs">{h}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                      <Train className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div><span className="font-medium">交通方式</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.access}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl flex-1 mr-2">
                        <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div><span className="font-medium">開放時間</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.hours}</p></div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl flex-1">
                        <Ticket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div><span className="font-medium">門票</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.price}</p></div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full rounded-xl" onClick={() => setFlippedId(null)}>關閉詳情</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
