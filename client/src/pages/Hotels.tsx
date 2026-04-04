/*
 * Design: Organic Naturalism — Hotels Page
 * - 5 Hokkaido hotels + original hotels
 * - Card images without top whitespace
 * - Detail dialog with intro, facilities, images, address, navigation, reviews, booking
 * - Price range slider, guests up to 6 + custom input
 */
import { useState } from "react";
import { Link } from "wouter";
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
import { Search, Star, MapPin, Wifi, Car, Coffee, Waves, Users, Calendar, Navigation, Phone, Globe, Dumbbell, Utensils, Bath, Minus, Plus as PlusIcon, ChevronLeft, ChevronRight, Languages, DollarSign, Cloud } from "lucide-react";
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
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/fK0QEKwLfLGJ_1ae98389.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/x39aXpwEtLst_8846c9e7.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/LRUGkcBfWVtk_7ef685d3.jpg"],
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
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/pbWZIGqzFwb3_1cf8cb26.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/kJs3KSAvxgSG_5a6666d1.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/95POE5gU6sqd_5ef46c71.jpg"],
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
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/rF49zu1jbWf6_d55a82e5.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/SSs2wBQG9ItV_30bd75ef.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/LRUGkcBfWVtk_7ef685d3.jpg"],
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
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/u4W9AXbKy8Dp_4a8d7b4b.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/wjGGKabeMPEH_11d64129.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/hcx6bCKuu4qj_230abfb2.jpg"],
    amenities: ["wifi", "parking", "spa", "restaurant"], type: "溫泉旅館", rooms: 171,
    description: "位於小樽朝里川溫泉區的度假酒店，被大自然環繞。設有天然溫泉、室內外泳池及多間餐廳。距離小樽運河車程約15分鐘，是遠離喧囂的理想住所。",
    highlights: ["天然溫泉", "被大自然環繞", "近小樽運河", "四季不同景色"],
    reviews: [
      { author: "自然愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=nature", rating: 4, text: "環境很安靜，溫泉水質很好。秋天來的話紅葉超美。", date: "2025-11-15" },
    ],
  },
  {
    id: 5, name: "洞爺湖萬世閣", location: "北海道洞爺湖町", address: "北海道虻田郡洞爺湖町洞爺湖溫泉21", phone: "+81-142-73-3500", website: "https://www.toyamanseikaku.jp", rating: 4.5, price: 8800, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/YlBFWcMSsdrX_e9bb0e08.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/sjxMy1SHqrpv_20205869.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/95POE5gU6sqd_5ef46c71.jpg"],
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
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/x39aXpwEtLst_8846c9e7.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/rF49zu1jbWf6_d55a82e5.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/SSs2wBQG9ItV_30bd75ef.jpg"],
    amenities: ["wifi", "parking", "spa", "restaurant"], type: "豪華", rooms: 39,
    description: "嵐山保津川畔的頂級酒店，融合日式傳統與現代奢華。每間客房都能欣賞到嵐山的自然美景，設有私人溫泉和米其林餐廳。",
    highlights: ["保津川畔絕景", "私人溫泉", "米其林餐廳", "日式奢華體驗"],
    reviews: [
      { author: "奢旅達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=luxury", rating: 5, text: "此生住過最美的酒店之一，每個細節都很完美。", date: "2025-11-01" },
    ],
  },
  {
    id: 7, name: "東京安達仕酒店", location: "日本東京", address: "東京都港區虎之門1-23-4", phone: "+81-3-6830-1234", website: "https://www.hyatt.com/andaz", rating: 4.8, price: 11500, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/fK0QEKwLfLGJ_1ae98389.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/kJs3KSAvxgSG_5a6666d1.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/LRUGkcBfWVtk_7ef685d3.jpg"],
    amenities: ["wifi", "gym", "spa", "restaurant", "parking"], type: "設計", rooms: 164,
    description: "位於虎之門之丘52樓的頂級設計酒店，以「在地文化體驗」為核心理念。大廳設計融入日本傳統工藝元素，客房採用自然木質色調搭配落地窗，可俯瞰東京鐵塔和東京灣全景。",
    highlights: ["52樓高空景觀", "東京鐵塔全景", "日式設計美學", "頂級健身中心"],
    reviews: [
      { author: "設計控", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=design", rating: 5, text: "房間設計太美了，每個角落都是拍照點。東京鐵塔夜景超震撼！", date: "2026-03-01" },
      { author: "商務旅客", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=business", rating: 4, text: "服務很好，位置方便，適合商務出差。", date: "2026-02-10" },
    ],
  },
  {
    id: 8, name: "大阪瑞吉酒店", location: "日本大阪", address: "大阪府大阪市中央區本町3-6-12", phone: "+81-6-6258-3333", website: "https://www.marriott.com/stregis", rating: 4.7, price: 10200, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/pbWZIGqzFwb3_1cf8cb26.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/wjGGKabeMPEH_11d64129.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/hcx6bCKuu4qj_230abfb2.jpg"],
    amenities: ["wifi", "gym", "spa", "restaurant", "breakfast"], type: "豪華", rooms: 160,
    description: "位於大阪本町的頂級酒店，以精緻的管家服務聞名。酒店內設有多間米其林推薦餐廳，頂樓酒吧可俯瞰大阪城市天際線。距離心齋橋和道頓堀步行僅10分鐘。",
    highlights: ["專屬管家服務", "米其林推薦餐廳", "近心齋橋商圈", "頂樓景觀酒吧"],
    reviews: [
      { author: "美食愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=osaka", rating: 5, text: "管家服務太貼心了！幫我們預約了隱藏版的壽司店。", date: "2026-01-15" },
    ],
  },
  {
    id: 9, name: "沖繩海麗客蘭尼度假村", location: "日本沖繩", address: "沖繩縣國頭郡恩納村名嘉真ヤーシ原2260-36", phone: "+81-98-965-0707", website: "https://www.kahanuresort.com", rating: 4.6, price: 8500, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/YlBFWcMSsdrX_e9bb0e08.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/rF49zu1jbWf6_d55a82e5.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/sjxMy1SHqrpv_20205869.jpg"],
    amenities: ["wifi", "pool", "spa", "restaurant", "parking"], type: "度假村", rooms: 315,
    description: "面朝東海的沖繩頂級海濱度假村，擁有私人沙灘和多個無邊際泳池。提供浮潛、潛水、獨木舟等豐富水上活動，是享受沖繩碧海藍天的理想選擇。",
    highlights: ["私人沙灘", "無邊際泳池", "豐富水上活動", "海景客房"],
    reviews: [
      { author: "海島控", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=beach", rating: 5, text: "沖繩的海太美了！度假村的私人沙灘人很少，超放鬆。", date: "2025-07-20" },
      { author: "潛水愛好者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=diver", rating: 4, text: "浮潛看到了好多熱帶魚，泳池也很讚。", date: "2025-08-05" },
    ],
  },
  {
    id: 10, name: "首爾四季酒店", location: "韓國首爾", address: "首爾特別市鍾路區新門內路97", phone: "+82-2-6388-5000", website: "https://www.fourseasons.com/seoul", rating: 4.9, price: 13200, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/u4W9AXbKy8Dp_4a8d7b4b.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/x39aXpwEtLst_8846c9e7.webp", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/SSs2wBQG9ItV_30bd75ef.jpg"],
    amenities: ["wifi", "gym", "spa", "pool", "restaurant", "breakfast"], type: "豪華", rooms: 317,
    description: "位於光化門廣場旁的頂級酒店，可俯瞰景福宮和北漢山。設有韓國最大的酒店水療中心、室內泳池及多間獲獎餐廳。距離明洞、北村韓屋村等熱門景點交通便利。",
    highlights: ["景福宮全景", "頂級水療中心", "近光化門商圈", "獲獎餐廳"],
    reviews: [
      { author: "韓流迷", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kpop", rating: 5, text: "從房間看景福宮的夜景太夢幻了！水療中心也超棒。", date: "2026-03-15" },
      { author: "購物達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=shopping", rating: 5, text: "位置超好，走路就能到明洞和光化門，購物超方便。", date: "2026-02-20" },
    ],
  },
  {
    id: 11, name: "曼谷文華東方酒店", location: "泰國曼谷", address: "48 Oriental Avenue, Bangkok 10500", phone: "+66-2-659-9000", website: "https://www.mandarinoriental.com/bangkok", rating: 4.8, price: 7800, currency: "TWD",
    images: ["https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/95POE5gU6sqd_5ef46c71.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/fK0QEKwLfLGJ_1ae98389.jpg", "https://d2xsxph8kpxj0f.cloudfront.net/310519663512600352/D9s4Fysq3ePNYMv8Pr6f9t/kJs3KSAvxgSG_5a6666d1.jpg"],
    amenities: ["wifi", "pool", "spa", "gym", "restaurant", "breakfast"], type: "經典", rooms: 393,
    description: "昭披耶河畔的傳奇酒店，自1876年開業以來一直是亞洲最頂級的酒店之一。擁有獲獎無數的泰式水療、河畔無邊際泳池及多間世界級餐廳，是體驗曼谷奢華的首選。",
    highlights: ["百年傳奇酒店", "昭披耶河畔", "頂級泰式水療", "河畔無邊際泳池"],
    reviews: [
      { author: "奢旅達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=luxtravel", rating: 5, text: "不愧是亞洲最好的酒店之一，服務無可挑剔。", date: "2025-12-10" },
    ],
  },
  {
    id: 12, name: "奈良萬葉若草之宿三笠", location: "日本奈良", address: "奈良市春日野町45", phone: "+81-742-22-3011", website: "https://www.mikasa.co.jp", rating: 4.6, price: 11800, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"],
    amenities: ["wifi", "breakfast", "spa", "restaurant"], type: "溫泉旅館", rooms: 30,
    description: "坐落於若草山麓的傳統日式旅館，可眺望奈良盆地的夜景。提供精緻的懷石料理和天然溫泉，是體驗日本傳統旅館文化的絕佳選擇。",
    highlights: ["若草山夜景", "精緻懷石料理", "天然溫泉", "近東大寺春日大社"],
    reviews: [
      { author: "文化探索者", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=culture", rating: 5, text: "從房間看奈良夜景太美了，懷石料理很精緻。", date: "2026-01-10" },
    ],
  },
  {
    id: 13, name: "新加坡濱海灣金沙酒店", location: "新加坡", address: "10 Bayfront Avenue, Singapore 018956", phone: "+65-6688-8868", website: "https://www.marinabaysands.com", rating: 4.7, price: 10500, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80", "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800&q=80"],
    amenities: ["wifi", "pool", "gym", "spa", "restaurant", "breakfast"], type: "豪華", rooms: 2561,
    description: "新加坡地標性建築，頂樓的無邊際泳池是全球最著名的酒店設施之一。三棟高塔由船形空中花園連接，設有賭場、購物中心、藝術科學博物館等豐富設施。",
    highlights: ["無邊際空中泳池", "濱海灣全景", "世界級購物中心", "藝術科學博物館"],
    reviews: [
      { author: "打卡達人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=instagrammer", rating: 5, text: "空中泳池的景色真的太驚人了，一輩子要來一次！", date: "2026-02-05" },
      { author: "家庭旅遊", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=familytrip", rating: 4, text: "設施豐富，帶小孩也很方便，但價格偏高。", date: "2026-01-25" },
    ],
  },
  {
    id: 14, name: "峇里島四季度假村", location: "印尼峇里島", address: "Jimbaran, Bali 80361, Indonesia", phone: "+62-361-701010", website: "https://www.fourseasons.com/bali", rating: 4.9, price: 15800, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80"],
    amenities: ["wifi", "pool", "spa", "gym", "restaurant", "breakfast", "parking"], type: "度假村", rooms: 147,
    description: "坐落於金巴蘭灣的頂級度假村，每間別墅都擁有私人泳池和無敵海景。提供頂級的峇里式水療、瑜伽課程和文化體驗活動，是蜜月和奢華度假的夢幻選擇。",
    highlights: ["私人泳池別墅", "金巴蘭灣日落", "頂級峇里式水療", "文化體驗活動"],
    reviews: [
      { author: "蜜月旅人", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=honeymoon", rating: 5, text: "蜜月選這裡太完美了！私人泳池看日落，終身難忘。", date: "2025-10-15" },
    ],
  },
  {
    id: 15, name: "河口湖風之露台KUKUNA", location: "日本山梨縣", address: "山梨縣南都留郡富士河口湖町淺川70", phone: "+81-555-83-3333", website: "https://kukuna.jp", rating: 4.7, price: 9500, currency: "TWD",
    images: ["https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80", "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80"],
    amenities: ["wifi", "spa", "restaurant", "breakfast", "parking"], type: "度假村", rooms: 30,
    description: "面朝河口湖與富士山的度假酒店，以南法普羅旺斯風格的開放式露台著稱。露天溫泉和客房都能正面欣賞富士山，是河口湖地區人氣最高的酒店之一。",
    highlights: ["正面富士山景觀", "開放式露台", "露天溫泉", "法式與日式融合料理"],
    reviews: [
      { author: "富士山迷", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=fuji", rating: 5, text: "從房間看富士山的日出，感動到說不出話來。早餐也超棒！", date: "2026-03-20" },
      { author: "溫泉控", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hotspring", rating: 5, text: "露天溫泉看富士山是此生最棒的溫泉體驗。", date: "2026-02-15" },
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
            <p className="text-muted-foreground mb-4">精選全球優質住宿，為你的旅程找到完美落腳處</p>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <Link href="/tools">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 shrink-0 text-xs"><Languages className="w-3.5 h-3.5" />翻譯</Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 shrink-0 text-xs"><DollarSign className="w-3.5 h-3.5" />匯率</Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 shrink-0 text-xs"><Cloud className="w-3.5 h-3.5" />天氣</Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 shrink-0 text-xs"><Navigation className="w-3.5 h-3.5" />導航</Button>
              </Link>
            </div>

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
                <Input type="text" inputMode="numeric" value={minPrice === 0 ? "" : String(minPrice)} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setMinPrice(v === "" ? 0 : parseInt(v)); }} className="w-28 rounded-xl h-9 text-sm" placeholder="最低" />
                <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number])} min={0} max={40000} step={500} className="flex-1" />
                <Input type="text" inputMode="numeric" value={priceRange[0] === 40000 ? "" : String(priceRange[0])} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setPriceRange([v === "" ? 40000 : parseInt(v)]); }} className="w-28 rounded-xl h-9 text-sm" placeholder="最高" />
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
                <Card className="organic-card overflow-hidden border-border/50 group h-full flex flex-col cursor-pointer !py-0 !gap-0" onClick={() => { setSelectedHotel(hotel); setDetailTab("info"); setDetailImageIdx(0); }}>
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
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHotel.address)}`, "_blank"); }}><Navigation className="w-4 h-4" />Google Maps</Button>
                    <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => { window.open(`https://maps.apple.com/?q=${encodeURIComponent(selectedHotel.address)}`, "_blank"); }}><Navigation className="w-4 h-4" />Apple Maps</Button>
                  </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">入住日期</Label>
                        <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-xl h-10 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">退房日期</Label>
                        <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-xl h-10 text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">房客人數</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Button key={n} variant={bookingGuests === n && !customGuests ? "default" : "outline"} size="sm" className="rounded-full w-10 h-10 p-0" onClick={() => { setBookingGuests(n); setCustomGuests(""); }}>{n}</Button>
                      ))}
                      <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0" onClick={() => { const cur = parseInt(customGuests) || bookingGuests; const v = Math.max(1, cur - 1); setCustomGuests(String(v)); }}><Minus className="w-3 h-3" /></Button>
                        <Input type="text" inputMode="numeric" value={customGuests !== "" ? customGuests : String(bookingGuests)} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setCustomGuests(v); if (v !== "" && parseInt(v) >= 1) setBookingGuests(parseInt(v)); }} className="w-14 h-8 rounded-lg text-center text-xs" />
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
