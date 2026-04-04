/*
 * Design: Organic Naturalism — Home Page
 * - Full-width hero with parallax-like effect
 * - Featured destinations in organic cards
 * - Feature highlights with earth-tone icons
 * - Warm, inviting atmosphere
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Map, BookOpen, Hotel, Plane, Languages, DollarSign,
  Cloud, Navigation, ArrowRight, Star, MapPin, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const featuredSpots = [
  {
    id: 1,
    name: "京都・伏見稻荷",
    location: "日本京都",
    rating: 4.9,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp",
    description: "千本鳥居的壯觀景象，感受日本傳統文化的魅力",
  },
  {
    id: 2,
    name: "聖托里尼",
    location: "希臘愛琴海",
    rating: 4.8,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp",
    description: "白色建築與藍色穹頂的夢幻組合",
  },
  {
    id: 3,
    name: "峇里島・烏布",
    location: "印尼峇里島",
    rating: 4.7,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp",
    description: "翠綠梯田與古老寺廟的熱帶天堂",
  },
];

const features = [
  { icon: Map, title: "景點瀏覽", desc: "探索全球精選景點", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: BookOpen, title: "行程規劃", desc: "智慧安排你的旅程", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { icon: Hotel, title: "旅館預訂", desc: "精選優質住宿", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { icon: Plane, title: "機票查詢", desc: "即時比價搜尋", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/30" },
  { icon: Languages, title: "即時翻譯", desc: "跨越語言障礙", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { icon: DollarSign, title: "匯率換算", desc: "即時匯率資訊", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { icon: Cloud, title: "天氣預報", desc: "掌握旅途天氣", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { icon: Navigation, title: "地圖導航", desc: "精準路線指引", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/hero-bg-g7PvFnkctds2rCztknx8gW.webp"
          alt="Hero"
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
            <span
              className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm mb-6 border border-white/20"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              探索 · 體驗 · 記錄
            </span>
            <h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              讓旅行成為<br />
              <span className="text-amber-300">生命的詩篇</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 max-w-lg leading-relaxed">
              從規劃到出發，從探索到記錄。Lumina Voyage 陪伴你走過每一段旅途，
              讓每一次冒險都成為永恆的回憶。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/spots">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-13 text-base gap-2 bg-white text-stone-800 hover:bg-white/90"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  開始探索
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/planner">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-13 text-base border-white/40 text-white hover:bg-white/10 bg-transparent"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  規劃行程
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 watercolor-wash">
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              一站式旅行體驗
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              從靈感到出發，我們提供你所需的一切旅行工具
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  className="group p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-400 text-center"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredSpots.map((spot, i) => (
              <motion.div
                key={spot.id}
                variants={fadeUp}
                custom={i}
                className="organic-card overflow-hidden bg-card border border-border/50 group"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white text-sm font-medium">{spot.rating}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {spot.location}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground mb-4">{spot.description}</p>
                  <Link href={`/spots`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-primary p-0 h-auto"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      了解更多 <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/hero-bg-g7PvFnkctds2rCztknx8gW.webp"
              alt="CTA"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                準備好出發了嗎？
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                加入 Lumina Voyage，與數千位旅人一起探索世界的每一個角落
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-white text-stone-800 hover:bg-white/90"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    免費加入
                  </Button>
                </Link>
                <Link href="/spots">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 border-white/40 text-white hover:bg-white/10 bg-transparent"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    瀏覽景點
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
