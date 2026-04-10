/*
 * Design: Organic Naturalism — Home Page
 * - Full-width hero with parallax-like effect
 * - Featured destinations with flip cards (same as Spots)
 * - Feature icons with fullscreen zoom then navigate
 * - Milestone system in avatar popover
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map, BookOpen, Hotel, Plane, Languages, DollarSign,
  Cloud, Navigation, ArrowRight, Star, MapPin, Train, Clock, Ticket, TreePine, ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FeaturedSpot {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  description: string;
  priceJPY: string;
  priceTWD: string;
  highlights: string[];
  access: string;
  hours: string;
  bestSeason: string;
  backDesc: string;
  tips: string;
}

const featuredSpots: FeaturedSpot[] = [
  {
    id: 1, name: "小樽運河", location: "北海道小樽市", rating: 4.8, reviews: 12453, category: "文化",
    image: "/images/japan/otaru_canal.webp",
    description: "浪漫運河與石造倉庫群，冬季雪燈路超夢幻",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["雪燈路祭典", "玻璃工藝體驗", "運河遊船", "壽司屋通"],
    access: "JR小樽站步行10分鐘", hours: "全天開放", bestSeason: "冬季（12-2月）",
    backDesc: "小樽運河建於1923年，全長1,140公尺，沿岸的石造倉庫群已改建為餐廳、商店和博物館。冬季的雪燈路祭典期間，運河兩旁點滿蠟燭與雪燈，營造出如夢似幻的氛圍。",
    tips: "建議傍晚前抵達，可以同時欣賞日景與夜景。"
  },
  {
    id: 2, name: "函館山夜景", location: "北海道函館市", rating: 4.9, reviews: 21345, category: "城市",
    image: "/images/japan/mount_hakodate.webp",
    description: "世界三大夜景之一，百萬夜景盡收眼底",
    priceJPY: "¥1,800", priceTWD: "約NT$390",
    highlights: ["纜車體驗", "星形城郭", "日落時分最美", "函館朝市"],
    access: "函館山纜車3分鐘", hours: "10:00-22:00", bestSeason: "全年",
    backDesc: "函館山標高334公尺，從山頂展望台可以俯瞰函館市區兩側被海灣環繞的獨特扇形地形，入選世界三大夜景。",
    tips: "建議日落前30分鐘上山，可以同時欣賞夕陽與夜景的完美過渡。"
  },
  {
    id: 3, name: "美瑛青池", location: "北海道美瑛町", rating: 4.8, reviews: 9876, category: "自然",
    image: "/images/japan/blue_pond.webp",
    description: "Apple桌布取景地，夢幻的鈷藍色湖面",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["冬季點燈", "Apple桌布", "白鬚瀑布", "拼布之路"],
    access: "JR美瑛站開車20分鐘", hours: "全天開放", bestSeason: "全年",
    backDesc: "青池因被Apple選為macOS桌布而聞名世界。湖水呈現獨特的鈷藍色，枯木佇立水中的景象如夢似幻。",
    tips: "清晨無風時湖面最平靜，倒影最美。冬季點燈期間的夜景非常夢幻。"
  },
];

const features = [
  { icon: Map, title: "景點瀏覽", desc: "探索全球精選景點", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", path: "/spots" },
  { icon: BookOpen, title: "行程規劃", desc: "智慧安排你的旅程", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", path: "/planner" },
  { icon: Hotel, title: "旅館預訂", desc: "精選優質住宿", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", path: "/hotels" },
  { icon: Plane, title: "機票查詢", desc: "即時比價搜尋", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/30", path: "/flights" },
  { icon: Languages, title: "即時翻譯", desc: "跨越語言障礙", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", path: "/tools" },
  { icon: DollarSign, title: "匯率換算", desc: "即時匯率資訊", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30", path: "/tools" },
  { icon: Cloud, title: "天氣預報", desc: "掌握旅途天氣", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30", path: "/tools" },
  { icon: Navigation, title: "地圖導航", desc: "精準路線指引", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", path: "/tools" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [zoomedFeature, setZoomedFeature] = useState<number | null>(null);

  const handleFlip = (id: number) => {
    setFlippedId(flippedId === id ? null : id);
  };

  const handleCloseFlip = () => {
    setFlippedId(null);
  };

  const flippedSpot = featuredSpots.find((s) => s.id === flippedId);

  const handleFeatureClick = (index: number) => {
    setZoomedFeature(index);
    setTimeout(() => {
      navigate(features[index].path);
      setZoomedFeature(null);
    }, 600);
  };

  useEffect(() => {
    if (flippedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [flippedId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") handleCloseFlip(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <img
          src="/images/hero-bg-g7PvFnkctds2rCztknx8gW.webp"
          alt="Hero"
          fetchpriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm mb-6 border border-white/20" style={{ fontFamily: "var(--font-sans)" }}>
              探索 · 體驗 · 記錄
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              讓旅行成為<br />
              <span className="text-amber-300">生命的詩篇</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 max-w-lg leading-relaxed">
              從規劃到出發，從探索到記錄。Lumina Voyage 陪伴你走過每一段旅途，
              讓每一次冒險都成為永恆的回憶。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/spots">
                <Button size="lg" className="rounded-full px-8 h-13 text-base gap-2 bg-white text-stone-800 hover:bg-white/90" style={{ fontFamily: "var(--font-sans)" }}>
                  開始探索 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/planner">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-13 text-base border-white/40 text-white hover:bg-white/10 bg-transparent" style={{ fontFamily: "var(--font-sans)" }}>
                  規劃行程
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* Features Section — 一站式旅行體驗背景圖 */}
      <section className="py-20 relative overflow-hidden">
        <img
          src="/images/home/experience.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* 半透明覆蓋：讓文字可讀但背景圖清晰可見 */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/50 backdrop-blur-[2px]" />
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              一站式旅行體驗
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              從靈感到出發，我們提供你所需的一切旅行工具
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isZoomed = zoomedFeature === i;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  className="relative cursor-pointer"
                  onClick={() => handleFeatureClick(i)}
                >
                  <motion.div
                    className={`group p-5 rounded-2xl liquid-glass-card text-center ${isZoomed ? "z-[200]" : ""}`}
                    animate={isZoomed ? {
                      scale: 1.15,
                      opacity: 0,
                      y: -10,
                      zIndex: 200,
                    } : {
                      scale: 1,
                      opacity: 1,
                      y: 0,
                      zIndex: 1,
                    }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-sans)" }}>{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations — 精選目的地背景圖 */}
      <section className="py-20 relative overflow-hidden">
        <img
          src="/images/home/destination.PNG"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/50 backdrop-blur-[2px]" />
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex items-end justify-between mb-12">
            <div>
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                精選目的地
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">
                最受旅人喜愛的夢幻景點
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link href="/spots">
                <Button variant="ghost" className="gap-2 text-primary" style={{ fontFamily: "var(--font-sans)" }}>
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSpots.map((spot, i) => (
              <motion.div
                key={spot.id}
                variants={fadeUp}
                custom={i}
                className="cursor-pointer"
                onClick={() => handleFlip(spot.id)}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="liquid-glass-card overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{spot.rating}</span>
                        <span className="text-xs text-muted-foreground">({spot.reviews.toLocaleString()})</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {spot.priceJPY}{spot.priceTWD !== spot.priceJPY && spot.priceTWD !== "免費" ? ` (${spot.priceTWD})` : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{spot.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Smooth Modal for Featured Spots */}
      <AnimatePresence>
        {flippedSpot && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleCloseFlip}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-10 w-full max-w-xl"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <div className="relative h-52 overflow-hidden">
                  <motion.img
                    src={flippedSpot.image}
                    alt={flippedSpot.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm rounded-full mb-2">{flippedSpot.category}</Badge>
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{flippedSpot.name}</h2>
                    <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{flippedSpot.location}</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{flippedSpot.rating}</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  className="p-5 space-y-4 max-h-[55vh] overflow-y-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{flippedSpot.backDesc}</p>
                  <div>
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" />亮點特色</h3>
                    <div className="flex flex-wrap gap-2">
                      {flippedSpot.highlights.map((h) => (<Badge key={h} variant="outline" className="rounded-full text-xs">{h}</Badge>))}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h3 className="text-sm font-bold mb-1 text-amber-700 dark:text-amber-400">旅行小貼士</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-300">{flippedSpot.tips}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                      <Train className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div><span className="font-medium">交通方式</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.access}</p></div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div><span className="font-medium">開放時間</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.hours}</p></div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                      <Ticket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div><span className="font-medium">門票</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.priceJPY}{flippedSpot.priceTWD !== flippedSpot.priceJPY && flippedSpot.priceTWD !== "免費" ? ` (${flippedSpot.priceTWD})` : ""}</p></div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                      <TreePine className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div><span className="font-medium">最佳季節</span><p className="text-muted-foreground text-xs mt-0.5">{flippedSpot.bestSeason}</p></div>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl" variant="outline" onClick={handleCloseFlip}>
                    <ChevronLeft className="w-4 h-4 mr-1" />返回
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedFeature !== null && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className={`rounded-full ${features[zoomedFeature].bg}`}
              initial={{ width: 64, height: 64, opacity: 0.7 }}
              animate={{ width: "200vmax", height: "200vmax", opacity: 0.25 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && (
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden"
            >
              <img src="/images/hero-bg-g7PvFnkctds2rCztknx8gW.webp" alt="CTA" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 py-16 px-8 md:px-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  準備好出發了嗎？
                </h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto">
                  加入 Lumina Voyage，與數千位旅人一起探索世界的每一個角落
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/login">
                    <Button size="lg" className="rounded-full px-8 bg-white text-stone-800 hover:bg-white/90" style={{ fontFamily: "var(--font-sans)" }}>
                      免費加入
                    </Button>
                  </Link>
                  <Link href="/spots">
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-white/40 text-white hover:bg-white/10 bg-transparent" style={{ fontFamily: "var(--font-sans)" }}>
                      瀏覽景點
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
