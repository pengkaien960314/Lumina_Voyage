/*
 * Design: Organic Naturalism — Spots Page
 * - Cards flip first then expand to full detail
 * - Real Hokkaido images + TWD prices
 * - 20+ spots with rich content
 */
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, Heart, Filter, Train, Clock, Ticket, ChevronLeft, Globe, Camera, Utensils, Mountain, ShoppingBag, Snowflake, TreePine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Spot {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  gallery: string[];
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

const allSpots: Spot[] = [
  {
    id: 1, name: "小樽運河", location: "北海道小樽市", rating: 4.8, reviews: 12453, category: "文化",
    image: "/images/japan/otaru_canal.webp",
    gallery: [
      "/images/u4W9AXbKy8Dp_4a8d7b4b.webp",
      "/images/japan/otaru_canal.webp"
    ],
    description: "浪漫運河與石造倉庫群，冬季雪燈路超夢幻",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["雪燈路祭典", "玻璃工藝體驗", "運河遊船", "壽司屋通", "音樂盒堂"],
    access: "JR小樽站步行10分鐘", hours: "全天開放（店鋪約9:00-18:00）", bestSeason: "冬季（12-2月）",
    backDesc: "小樽運河建於1923年，全長1,140公尺，是北海道開拓時代的重要港口設施。沿岸的石造倉庫群已改建為餐廳、商店和博物館，保留了大正浪漫時期的建築風格。冬季的雪燈路祭典期間，運河兩旁點滿蠟燭與雪燈，營造出如夢似幻的氛圍。小樽也是北海道著名的壽司之城，壽司屋通上聚集了多家百年壽司名店。音樂盒堂和北一硝子（玻璃工藝）是必訪的文化體驗。",
    tips: "建議傍晚前抵達，可以同時欣賞日景與夜景。冬季雪燈路祭典通常在2月舉行，需提前預訂住宿。"
  },
  {
    id: 2, name: "富良野薰衣草花田", location: "北海道富良野市", rating: 4.9, reviews: 18762, category: "自然",
    image: "/images/kJs3KSAvxgSG_5a6666d1.jpg",
    gallery: [
      "/images/kJs3KSAvxgSG_5a6666d1.jpg"
    ],
    description: "夏季限定的紫色花海，富田農場必訪打卡聖地",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["薰衣草冰淇淋", "彩色花田", "精油工坊", "哈密瓜吃到飽", "觀景台"],
    access: "JR薰衣草花田站步行7分鐘", hours: "8:30-18:00（夏季）", bestSeason: "夏季（7-8月）",
    backDesc: "富田農場是北海道最著名的薰衣草觀賞地，創立於1903年，至今已有超過120年歷史。每年7月中旬至8月上旬是最佳觀賞期，紫色薰衣草花海一望無際，搭配遠方的十勝岳連峰，構成絕美畫面。除了薰衣草，還有彩虹般的花田，包括罌粟花、向日葵、鼠尾草等七彩花卉。農場內的薰衣草冰淇淋和富良野哈密瓜是必嚐美食，精油產品也是熱門伴手禮。",
    tips: "7月中旬是薰衣草最盛開的時期，建議一早就到避開人潮。富良野哈密瓜季節為6-9月。"
  },
  {
    id: 3, name: "函館山夜景", location: "北海道函館市", rating: 4.9, reviews: 21345, category: "城市",
    image: "/images/japan/mount_hakodate.webp",
    gallery: [
      "/images/japan/mount_hakodate.webp"
    ],
    description: "世界三大夜景之一，百萬夜景盡收眼底",
    priceJPY: "¥1,800", priceTWD: "約NT$390",
    highlights: ["纜車體驗", "星形城郭", "日落時分最美", "函館朝市", "金森紅磚倉庫"],
    access: "函館山纜車3分鐘", hours: "10:00-22:00（纜車）", bestSeason: "全年（冬季空氣清澈最佳）",
    backDesc: "函館山標高334公尺，從山頂展望台可以俯瞰函館市區兩側被海灣環繞的獨特扇形地形，入選世界三大夜景，與香港維多利亞港、那不勒斯齊名。白天可以清楚看到函館市區的街道格局和五稜郭的星形輪廓，夜晚則是璀璨的百萬夜景。函館也是北海道最早開港的城市，擁有豐富的西洋建築和異國風情。函館朝市的海鮮丼和活烏賊是必嚐美食。",
    tips: "建議日落前30分鐘上山，可以同時欣賞夕陽與夜景的完美過渡。冬季空氣清澈，夜景最為壯觀。"
  },
  {
    id: 4, name: "旭山動物園", location: "北海道旭川市", rating: 4.7, reviews: 15678, category: "親子",
    image: "/images/wjGGKabeMPEH_11d64129.jpg",
    gallery: [],
    description: "日本最北動物園，企鵝散步超療癒",
    priceJPY: "¥1,000", priceTWD: "約NT$215",
    highlights: ["企鵝散步", "海豹通道", "北極熊館", "雪豹館", "空中散步"],
    access: "JR旭川站搭巴士40分鐘", hours: "9:30-17:15", bestSeason: "冬季（12-3月企鵝散步）",
    backDesc: "旭山動物園是日本最北端的動物園，以革命性的「行動展示」設計聞名全國。不同於傳統動物園的平面展示，這裡讓遊客可以從各種角度近距離觀察動物的自然行為。冬季限定的企鵝散步是最大亮點，國王企鵝們在雪地中搖搖擺擺地走過遊客面前，距離近到伸手可及。海豹通道讓海豹在透明管道中上下游動，北極熊館可以從水下觀察北極熊游泳的英姿。",
    tips: "企鵝散步在12月下旬至3月中旬每天舉行，建議提前30分鐘佔位。夏季有夜間動物園活動。"
  },
  {
    id: 5, name: "美瑛青池", location: "北海道美瑛町", rating: 4.8, reviews: 9876, category: "自然",
    image: "/images/japan/blue_pond.webp",
    gallery: [
      "/images/japan/blue_pond.webp"
    ],
    description: "Apple桌布取景地，夢幻的鈷藍色湖面",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["冬季點燈", "Apple桌布", "白鬚瀑布", "拼布之路", "四季彩之丘"],
    access: "JR美瑛站開車20分鐘", hours: "全天開放", bestSeason: "全年（各季不同風貌）",
    backDesc: "青池因被Apple選為macOS桌布而聞名世界，湖水呈現獨特的鈷藍色，是因為含有鋁的地下水與美瑛川的水混合產生的膠體粒子所致。枯木佇立水中的景象如夢似幻，隨著季節和天氣的變化，湖水會呈現不同的藍色調。春季翠綠、夏季湛藍、秋季金黃倒映、冬季白雪覆蓋加上夜間點燈，四季各有不同的絕美風貌。附近的白鬚瀑布也是必訪景點。",
    tips: "清晨無風時湖面最平靜，倒影最美。冬季點燈期間（11月-4月）的夜景非常夢幻。"
  },
  {
    id: 6, name: "登別地獄谷", location: "北海道登別市", rating: 4.6, reviews: 8765, category: "自然",
    image: "/images/YlBFWcMSsdrX_e9bb0e08.webp",
    gallery: [],
    description: "火山口遺跡的壯觀地熱景觀，溫泉聖地",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["溫泉體驗", "大湯沼", "閻魔堂", "天然足湯", "熊牧場"],
    access: "JR登別站搭巴士15分鐘", hours: "全天開放", bestSeason: "全年（冬季泡湯最佳）",
    backDesc: "登別地獄谷是約一萬年前日和山火山爆發形成的火口遺跡，直徑約450公尺，面積約11公頃。谷中到處冒著白煙，硫磺味瀰漫，每天湧出約一萬噸的溫泉水，供應整個登別溫泉街。這裡有9種不同泉質的溫泉，被譽為「溫泉百貨公司」。大湯沼是一個天然的溫泉湖，沿途有免費的天然足湯可以體驗。閻魔堂每天定時會有閻魔王變臉的機關表演。",
    tips: "建議穿防滑鞋，冬季步道可能結冰。登別溫泉街有多家日歸溫泉，推薦第一滝本館。"
  },
  {
    id: 7, name: "二世古滑雪場", location: "北海道俱知安町", rating: 4.9, reviews: 14321, category: "運動",
    image: "/images/LRUGkcBfWVtk_7ef685d3.jpg",
    gallery: [
      "/images/rF49zu1jbWf6_d55a82e5.jpg"
    ],
    description: "世界級粉雪天堂，滑雪愛好者朝聖地",
    priceJPY: "¥6,600", priceTWD: "約NT$1,420",
    highlights: ["粉雪體驗", "夜間滑雪", "溫泉度假村", "羊蹄山景觀", "美食街"],
    access: "新千歲機場搭巴士2.5小時", hours: "8:30-20:30（冬季）", bestSeason: "冬季（12-4月）",
    backDesc: "二世古（Niseko）擁有世界頂級的粉雪品質，年均降雪量超過15公尺，雪質輕盈如羽毛，被全球滑雪愛好者譽為「粉雪天堂」。四座相連的滑雪場——Grand Hirafu、Hanazono、Niseko Village、Annupuri——提供超過80條雪道，從初學者到專業級都能找到適合的路線。夜間滑雪在燈光照射下別有風情。滑雪後可以泡溫泉、享用各國美食，國際化的氛圍讓人彷彿置身歐洲度假村。",
    tips: "1-2月粉雪品質最佳。建議提前預訂住宿和雪具租借。初學者推薦Annupuri滑雪場。"
  },
  {
    id: 8, name: "札幌狸小路商店街", location: "北海道札幌市", rating: 4.5, reviews: 19876, category: "購物",
    image: "/images/u4W9AXbKy8Dp_4a8d7b4b.webp",
    gallery: [],
    description: "北海道最大商店街，美食購物一次滿足",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["藥妝購物", "湯咖哩", "居酒屋街", "札幌拉麵", "伴手禮天堂"],
    access: "地鐵大通站步行5分鐘", hours: "10:00-22:00（各店不同）", bestSeason: "全年",
    backDesc: "狸小路商店街創立於1873年，是北海道歷史最悠久的商店街，全長約900公尺，橫跨7個街區，擁有超過200家店鋪。從藥妝店、服飾店、電器行到餐廳應有盡有。這裡是品嚐札幌名物湯咖哩、成吉思汗烤肉、札幌味噌拉麵的好去處，也是購買白色戀人、六花亭、ROYCE巧克力等北海道伴手禮的最佳地點。全天候有頂棚遮蔽，下雨下雪都能舒適逛街。",
    tips: "藥妝店建議比價後再購買，唐吉訶德和松本清價格可能不同。晚上的居酒屋街氣氛很好。"
  },
  {
    id: 9, name: "洞爺湖", location: "北海道洞爺湖町", rating: 4.7, reviews: 11234, category: "自然",
    image: "/images/wjGGKabeMPEH_11d64129.jpg",
    gallery: [],
    description: "火山湖畔的絕美風光，四季皆宜的療癒聖地",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["花火大會", "有珠山纜車", "湖畔溫泉", "中島遊覽船", "昭和新山"],
    access: "JR洞爺站搭巴士20分鐘", hours: "全天開放", bestSeason: "夏季（4-10月花火大會）",
    backDesc: "洞爺湖是日本第三大火山口湖，周長約43公里，湖中有四座小島。每年4月至10月每晚都有花火大會，從湖畔溫泉旅館就能欣賞煙火在湖面上綻放的美景。搭乘有珠山纜車可以俯瞰整個洞爺湖和昭和新山的壯觀景色，天氣好時還能看到羊蹄山。2008年G8峰會曾在此舉辦，溫莎飯店因此聞名。湖畔的溫泉街有多家優質溫泉旅館，是放鬆身心的絕佳去處。",
    tips: "花火大會每晚20:45開始，約20分鐘。建議住湖畔溫泉旅館，在房間就能看煙火。"
  },
  {
    id: 10, name: "白色戀人公園", location: "北海道札幌市", rating: 4.6, reviews: 16543, category: "文化",
    image: "/images/YlBFWcMSsdrX_e9bb0e08.webp",
    gallery: [],
    description: "白色戀人巧克力主題樂園，夢幻歐式建築",
    priceJPY: "¥800", priceTWD: "約NT$172",
    highlights: ["DIY巧克力", "歐式花園", "限定甜點", "巧克力工廠參觀", "鐘塔表演"],
    access: "地鐵宮之澤站步行7分鐘", hours: "10:00-17:00", bestSeason: "全年（冬季燈飾最美）",
    backDesc: "白色戀人公園是北海道最知名的巧克力品牌「白色戀人」的主題樂園，由石屋製菓株式會社經營。園區內有英國風格的建築和花園，可以參觀巧克力工廠的生產線、體驗DIY製作白色戀人餅乾（約需14天寄送）。每到整點，鐘塔會有精緻的機關人偶表演。園區內的咖啡廳提供限定甜點和飲品。冬季的燈飾裝飾讓整個園區如同童話世界，是情侶約會的熱門景點。",
    tips: "DIY體驗需提前預約，建議上午場次人較少。園區內的白色戀人限定口味只有這裡買得到。"
  },
  {
    id: 11, name: "層雲峽溫泉", location: "北海道上川町", rating: 4.7, reviews: 7654, category: "自然",
    image: "/images/wjGGKabeMPEH_11d64129.jpg",
    gallery: [],
    description: "大雪山國家公園內的峽谷溫泉，秋季紅葉絕景",
    priceJPY: "¥600", priceTWD: "約NT$129",
    highlights: ["銀河瀑布", "流星瀑布", "黑岳纜車", "冰瀑祭", "紅葉谷"],
    access: "JR上川站搭巴士30分鐘", hours: "全天開放", bestSeason: "秋季（9-10月紅葉）",
    backDesc: "層雲峽位於大雪山國家公園內，是一段長達24公里的峽谷，兩側聳立著高達100公尺的柱狀節理斷崖。銀河瀑布和流星瀑布並稱為「夫婦瀑布」，是北海道最壯觀的瀑布景觀。秋季的紅葉從9月上旬開始，是日本最早的紅葉名所。冬季的冰瀑祭將瀑布凍結的冰柱打上彩色燈光，如同冰雪奇緣的場景。搭乘黑岳纜車可以登上標高1,984公尺的黑岳，俯瞰壯闘的大雪山全景。",
    tips: "紅葉最佳觀賞期為9月中旬至10月上旬。冰瀑祭在1月下旬至3月中旬舉行。"
  },
  {
    id: 12, name: "積丹半島", location: "北海道積丹町", rating: 4.6, reviews: 5432, category: "自然",
    image: "/images/japan/blue_pond.webp",
    gallery: [],
    description: "積丹藍的透明海水，北海道唯一的海中國定公園",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["積丹藍", "神威岬", "島武意海岸", "海膽丼", "水中展望船"],
    access: "札幌開車約2小時", hours: "全天開放", bestSeason: "夏季（6-8月）",
    backDesc: "積丹半島擁有被稱為「積丹藍」的透明碧藍海水，是北海道唯一被指定為海中國定公園的地區。神威岬是一條延伸入海的狹長岬角，步行至盡頭可以360度欣賞壯闊的海景。島武意海岸被選為日本海灘百選，穿過隧道後映入眼簾的絕美海灣令人驚嘆。夏季是品嚐新鮮海膽的最佳季節，積丹的紫海膽甜美鮮甜，是饕客的最愛。",
    tips: "神威岬步道單程約20分鐘，風大時可能關閉。海膽季節為6-8月，建議在當地食堂品嚐。"
  },
  {
    id: 13, name: "星野度假村TOMAMU", location: "北海道占冠村", rating: 4.8, reviews: 13456, category: "運動",
    image: "/images/LRUGkcBfWVtk_7ef685d3.jpg",
    gallery: [],
    description: "雲海平台與冰之教堂，四季皆有驚喜",
    priceJPY: "¥2,200", priceTWD: "約NT$473",
    highlights: ["雲海平台", "冰之教堂", "愛絲冰城", "微笑海灘", "森林餐廳"],
    access: "JR TOMAMU站免費接駁", hours: "依設施不同", bestSeason: "全年",
    backDesc: "星野度假村TOMAMU是北海道最具代表性的綜合度假村，佔地約1,000公頃。夏季的雲海平台是最大亮點，清晨搭乘纜車上山，可以在標高1,088公尺的展望台上欣賞壯闘的雲海奇景。冬季的冰之教堂和愛絲冰城是用冰雪打造的夢幻空間，冰之教堂更是可以舉辦真正的婚禮。微笑海灘是日本最大的室內人造海灘，全年維持30度恆溫。森林餐廳在林間享用早餐的體驗令人難忘。",
    tips: "雲海出現率約40%，建議連住2晚增加看到的機會。5-10月為雲海季節，清晨5點需出發。"
  },
  {
    id: 14, name: "五稜郭公園", location: "北海道函館市", rating: 4.7, reviews: 10234, category: "文化",
    image: "/images/japan/mount_hakodate.webp",
    gallery: [],
    description: "日本第一座西式城郭，星形要塞的歷史遺跡",
    priceJPY: "¥900", priceTWD: "約NT$194",
    highlights: ["五稜郭塔", "櫻花名所", "箱館戰爭遺跡", "星形城郭", "冬季點燈"],
    access: "市電五稜郭公園前站步行15分鐘", hours: "9:00-18:00（塔）", bestSeason: "春季（4-5月櫻花）",
    backDesc: "五稜郭是日本第一座西式城郭，建於1864年，呈獨特的五角星形。從五稜郭塔107公尺高的展望台俯瞰，可以清楚看到完美的星形輪廓。春季約1,600棵櫻花樹同時綻放，將星形城郭染成粉紅色，是函館最美的櫻花名所。這裡也是幕末箱館戰爭的最後戰場，塔內展示了豐富的歷史資料。冬季的五稜星之夢點燈活動，用2,000顆燈泡勾勒出星形輪廓，倒映在護城河中格外浪漫。",
    tips: "櫻花最佳觀賞期為4月下旬至5月上旬。冬季點燈在12月至2月，日落後最美。"
  },
  {
    id: 15, name: "支笏湖", location: "北海道千歲市", rating: 4.6, reviews: 6789, category: "自然",
    image: "/images/japan/blue_pond.webp",
    gallery: [],
    description: "日本最北的不凍湖，透明度極高的火山口湖",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["透明獨木舟", "冰濤祭", "溫泉", "水中遊覽船", "苔之洞門"],
    access: "新千歲機場開車40分鐘", hours: "全天開放", bestSeason: "夏季（透明獨木舟）",
    backDesc: "支笏湖是日本最北的不凍湖，也是日本透明度第二高的湖泊，最深處達363公尺。因為水質極為清澈，被稱為「支笏湖藍」。夏季可以體驗透明獨木舟，彷彿漂浮在空中的奇妙感受在社群媒體上爆紅。冬季的冰濤祭將湖水噴灑在骨架上形成各種冰雕，打上彩色燈光後如夢似幻。湖畔有丸駒溫泉和支笏湖溫泉，可以一邊泡湯一邊欣賞湖景。",
    tips: "透明獨木舟需提前預約，夏季很快就滿。距離新千歲機場很近，適合作為第一站或最後一站。"
  },
  // 原有國際景點
  {
    id: 16, name: "京都・伏見稻荷大社", location: "日本京都", rating: 4.9, reviews: 45678, category: "文化",
    image: "/images/spot-kyoto-VxfUvqn5Qab4pRbZXHFPXx.webp",
    gallery: [],
    description: "千本鳥居的壯觀景象，日本最具代表性的神社",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["千本鳥居", "稻荷山登山", "狐狸繪馬", "四辻展望", "伏見清酒"],
    access: "JR稻荷站即達", hours: "全天開放", bestSeason: "全年（清晨人少最佳）",
    backDesc: "伏見稻荷大社是日本全國約3萬座稻荷神社的總本社，創建於711年，主祭稻荷大神。以數千座朱紅色鳥居聞名，沿著稻荷山的參道排列的鳥居形成壯觀的隧道，全程約4公里，步行約2小時。每座鳥居都是由企業或個人捐獻，背面刻有捐獻者的名字和日期。山頂的一之峰是最高點，沿途有多個茶屋可以休息。",
    tips: "建議清晨6-7點前往，可以拍到無人的鳥居隧道。全程登山約2小時，穿舒適的鞋子。"
  },
  {
    id: 17, name: "聖托里尼・伊亞小鎮", location: "希臘愛琴海", rating: 4.8, reviews: 34567, category: "海島",
    image: "/images/spot-santorini-XZm7tE8W65MFkrA8cQULBz.webp",
    gallery: [],
    description: "白色建築與藍色穹頂的夢幻組合",
    priceJPY: "€20", priceTWD: "約NT$700",
    highlights: ["日落觀賞", "藍頂教堂", "火山遊船", "紅沙灘", "葡萄酒莊"],
    access: "費拉搭巴士30分鐘", hours: "全天開放", bestSeason: "夏季（6-9月）",
    backDesc: "伊亞小鎮位於聖托里尼島的北端，以壯麗的日落景色聞名於世。白色的基克拉迪式建築搭配藍色穹頂教堂，構成了明信片般的完美畫面。日落時分，整個小鎮被金色光芒籠罩，數百名遊客聚集在城堡觀景台上等待那一刻。除了日落，這裡還有精緻的藝術畫廊、特色商店和高級餐廳。火山遊船可以前往火山島泡溫泉。",
    tips: "日落觀景台建議提前1小時佔位。避開7-8月旅遊旺季可以享受更悠閒的體驗。"
  },
  {
    id: 18, name: "峇里島・烏布梯田", location: "印尼峇里島", rating: 4.7, reviews: 23456, category: "自然",
    image: "/images/spot-bali-BsoH2DrzKRxcnT4gKhZpEX.webp",
    gallery: [],
    description: "翠綠梯田與古老寺廟交織的熱帶天堂",
    priceJPY: "IDR 50K", priceTWD: "約NT$100",
    highlights: ["德哥拉朗梯田", "猴子森林", "瑜伽體驗", "峇里舞蹈", "有機咖啡"],
    access: "登巴薩機場開車1.5小時", hours: "8:00-18:00", bestSeason: "乾季（4-10月）",
    backDesc: "烏布是峇里島的文化中心，以壯觀的梯田景觀和豐富的藝術氛圍聞名。德哥拉朗梯田被列為世界文化遺產，展現了峇里島傳統的「蘇巴克」灌溉系統。猴子森林裡有超過700隻長尾獼猴，漫步在古老的榕樹和寺廟之間。烏布也是瑜伽和冥想的聖地，吸引了全球的靈修愛好者。當地的有機咖啡和傳統峇里舞蹈也是不可錯過的體驗。",
    tips: "避開中午時段前往梯田，清晨和傍晚光線最美。猴子森林注意不要攜帶食物和閃亮物品。"
  },
  {
    id: 19, name: "北海道大學銀杏大道", location: "北海道札幌市", rating: 4.5, reviews: 8901, category: "文化",
    image: "/images/japan/mount_hakodate.webp",
    gallery: [],
    description: "秋季金黃銀杏隧道，校園散步的浪漫時光",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["銀杏大道", "校園散步", "博物館", "農場直營店", "克拉克博士像"],
    access: "JR札幌站步行10分鐘", hours: "全天開放", bestSeason: "秋季（10月下旬-11月上旬）",
    backDesc: "北海道大學是日本面積最大的大學，校園內的銀杏大道長約380公尺，兩側種植了約70棵銀杏樹。每年10月下旬至11月上旬，銀杏葉轉為金黃色，形成壯觀的金色隧道，是札幌最受歡迎的秋季景點。校園內還有綜合博物館（免費）、農場直營的冰淇淋店、以及著名的克拉克博士「Boys, be ambitious」雕像。",
    tips: "銀杏最佳觀賞期約只有1-2週，建議關注即時情報。校園內的農場冰淇淋非常推薦。"
  },
  {
    id: 20, name: "四季彩之丘", location: "北海道美瑛町", rating: 4.7, reviews: 7890, category: "自然",
    image: "/images/kJs3KSAvxgSG_5a6666d1.jpg",
    gallery: [],
    description: "七彩花田與十勝岳連峰的壯闘全景",
    priceJPY: "¥500", priceTWD: "約NT$108",
    highlights: ["彩色花田", "羊駝牧場", "花田卡丁車", "冬季雪上活動", "展望台"],
    access: "JR美瑛站開車12分鐘", hours: "9:00-17:00", bestSeason: "夏季（6-9月）",
    backDesc: "四季彩之丘是美瑛最大的花田觀光農園，佔地約15公頃，種植了超過30種花卉。夏季時，薰衣草、向日葵、大波斯菊等花卉形成七彩條紋的壯觀花田，背景是雄偉的十勝岳連峰和大雪山。園內還有可愛的羊駝牧場，可以近距離餵食和拍照。花田卡丁車和拖拉機巴士是遊覽花田的有趣方式。冬季則變身為雪上摩托車和雪鞋健行的場地。",
    tips: "花田面積很大，建議搭乘拖拉機巴士遊覽。夏季花卉最盛期為7月中旬至8月下旬。"
  },
  {
    id: 21, name: "清水寺", location: "日本京都", rating: 4.8, reviews: 32100, category: "文化",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    gallery: [],
    description: "世界文化遺產，京都最具代表性的古寺",
    priceJPY: "¥400", priceTWD: "約NT$86",
    highlights: ["清水舞台", "音羽の滝", "三年坂二年坂", "秋季紅葉", "春季櫻花"],
    access: "京都站巴士206/100號至清水道", hours: "6:00-18:00（季節性延長）", bestSeason: "春秋（3-4月/11月）",
    backDesc: "清水寺建於778年，是京都最古老的寺院之一。最著名的清水舞台由139根木柱支撐，懸空於崖壁之上，不用一根釘子。站在舞台上可俯瞰京都市區全景，春季櫻花環繞、秋季紅葉如火的景色令人震撼。寺院內的音羽之滝分為三道泉水，分別代表學業、戀愛和長壽。沿途的三年坂、二年坂老街充滿京都風情。",
    tips: "建議清晨6點開門時前往避開人潮。秋季夜間特別拜觀的燈光效果非常夢幻。"
  },
  {
    id: 22, name: "河口湖", location: "日本山梨縣", rating: 4.9, reviews: 28500, category: "自然",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80",
    gallery: [],
    description: "富士五湖之一，眺望富士山的絕佳位置",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["逆富士", "天上山公園", "大石公園", "遊覽船", "紅葉回廊"],
    access: "新宿巴士直達約2小時", hours: "全天開放", bestSeason: "全年（11月紅葉最美）",
    backDesc: "河口湖是富士五湖中最受歡迎的湖泊，從湖畔到處都能欣賞到富士山的壯麗景色。天氣晴朗時，湖面會映照出完美的「逆富士」倒影，是攝影愛好者夢寐以求的畫面。天上山公園的纜車可以從高處同時俯瞰富士山和河口湖。秋季的紅葉回廊和大石公園的波斯菊花海更是錦上添花。",
    tips: "逆富士最佳拍攝時間為清晨無風時。冬季空氣清澈，看到富士山的機率最高。"
  },
  {
    id: 23, name: "明洞商圈", location: "韓國首爾", rating: 4.5, reviews: 19800, category: "購物",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80",
    gallery: [],
    description: "首爾最熱鬧的購物天堂，美妝與街頭美食聚集地",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["韓國美妝旗艦店", "街頭美食", "樂天免稅店", "南山塔夜景", "韓服體驗"],
    access: "地鐵4號線明洞站", hours: "10:00-22:00（各店不同）", bestSeason: "全年",
    backDesc: "明洞是首爾最具代表性的購物區，聚集了超過2,000家商店和100多家餐廳。這裡是韓國美妝品牌的一級戰區，幾乎所有知名品牌都在此設有旗艦店，價格比免稅店更優惠。街頭美食攤位林立，蛋中蛋、烤魷魚、辣炒年糕等小吃讓人目不暇給。從明洞步行即可到達南山塔，搭乘纜車上去欣賞首爾夜景。",
    tips: "韓國美妝品牌常有買一送一活動，建議多比較幾家。退稅門檻為3萬韓元以上。"
  },
  {
    id: 24, name: "長灘島白沙灘", location: "菲律賓長灘島", rating: 4.7, reviews: 15600, category: "海島",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    gallery: [],
    description: "世界十大最美沙灘，潔白細沙與碧藍海水的天堂",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["白沙灘日落", "水上活動", "D'Mall購物", "跳島行程", "海鮮BBQ"],
    access: "卡利博機場轉車+船約2小時", hours: "全天開放", bestSeason: "乾季（11-5月）",
    backDesc: "長灘島的白沙灘全長約4公里，以潔白如粉的珊瑚沙和清澈見底的海水聞名世界。沙灘分為S1（寧靜高檔區）、S2（商業中心）和S3（寧靜經濟區）三段。日落時分的天空色彩絕美，是享受雞尾酒和現場音樂的最佳時刻。豐富的水上活動包括風帆、潛水、拖曳傘等，跳島行程可以探訪附近的魔幻島和鱷魚島。",
    tips: "雨季（6-10月）部分水上活動暫停但住宿便宜許多。S1區域的D'Talipapa市場可以買海鮮請店家代烹。"
  },
  {
    id: 25, name: "東京迪士尼海洋", location: "日本千葉縣", rating: 4.8, reviews: 42300, category: "親子",
    image: "https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80",
    gallery: [],
    description: "全球唯一的迪士尼海洋主題樂園，浪漫與冒險兼具",
    priceJPY: "¥7,900~¥10,900", priceTWD: "約NT$1,700~2,350",
    highlights: ["驚魂古塔", "玩具總動員瘋狂遊戲屋", "地心探險之旅", "夜間水上秀", "達菲熊商品"],
    access: "JR舞浜站步行即達", hours: "8:00-21:00", bestSeason: "全年（聖誕節/萬聖節特別活動）",
    backDesc: "東京迪士尼海洋是全球獨一無二的海洋主題迪士尼樂園，以七大港口為主題區域，融合冒險、奇幻和浪漫元素。園區的建築和造景精緻到令人歎為觀止，無論是地中海港灣、神秘島還是美國海濱，每個角落都是拍照勝地。人氣設施包括驚魂古塔、地心探險之旅和玩具總動員瘋狂遊戲屋。達菲熊及其朋友們是園區限定角色，相關商品非常搶手。",
    tips: "建議使用迪士尼APP預約等候。平日入園人潮較少。園區內的火山餐廳氛圍獨特，建議預約。"
  },
  {
    id: 26, name: "巴黎艾菲爾鐵塔", location: "法國巴黎", rating: 4.7, reviews: 89200, category: "城市",
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=800&q=80",
    gallery: [],
    description: "浪漫之都的永恆地標，俯瞰巴黎全景",
    priceJPY: "€29.40", priceTWD: "約NT$1,020",
    highlights: ["頂層觀景台", "塞納河遊船", "香榭麗舍大道", "夜間燈光秀", "戰神廣場野餐"],
    access: "Metro 6號線 Bir-Hakeim站", hours: "9:00-00:45", bestSeason: "春秋（4-6月/9-10月）",
    backDesc: "建於1889年的艾菲爾鐵塔高324公尺，是巴黎最具代表性的建築。三層觀景平台提供不同角度的城市全景，頂層可遠眺70公里。每晚整點的燈光秀持續5分鐘，閃耀的金色光芒令人難忘。",
    tips: "強烈建議線上預約門票避免排隊。日落前1小時上塔可同時欣賞日景與夜景。"
  },
  {
    id: 27, name: "倫敦大英博物館", location: "英國倫敦", rating: 4.8, reviews: 67500, category: "文化",
    image: "https://images.unsplash.com/photo-1590080876401-07afe972ced5?w=800&q=80",
    gallery: [],
    description: "世界最大博物館之一，藏品橫跨200萬年人類歷史",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["羅塞塔石碑", "埃及木乃伊", "帕德嫩神殿雕塑", "劉易斯棋子", "中國瓷器廳"],
    access: "Tottenham Court Road站步行5分鐘", hours: "10:00-17:00（週五至20:30）", bestSeason: "全年",
    backDesc: "大英博物館擁有超過800萬件藏品，從古埃及文物到現代藝術應有盡有。必看的羅塞塔石碑是解讀古埃及象形文字的關鍵，埃及木乃伊展廳則是最受歡迎的區域。博物館免費入場，但建議捐款£5。",
    tips: "建議安排至少3小時。週五延長開放到20:30人潮較少。語音導覽£7很值得。"
  },
  {
    id: 28, name: "紐約中央公園", location: "美國紐約", rating: 4.8, reviews: 54300, category: "自然",
    image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
    gallery: [],
    description: "曼哈頓心臟的城市綠洲，四季皆美",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["畢士達噴泉", "弓橋", "草莓園", "中央公園動物園", "貝塞斯達露台"],
    access: "多條地鐵線路可達", hours: "6:00-1:00", bestSeason: "秋季（10月紅葉）",
    backDesc: "中央公園面積843英畝，是紐約市民的後花園。秋天的紅葉與摩天大樓形成絕美對比，冬天的溜冰場浪漫至極。園內有超過20個遊樂場、7個湖泊和36座橋。",
    tips: "騎單車繞園約需1.5小時。秋季的North Woods紅葉最美。"
  },
  {
    id: 29, name: "九份老街", location: "台灣新北市", rating: 4.5, reviews: 31200, category: "文化",
    image: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80",
    gallery: [],
    description: "《神隱少女》靈感來源，山城燈火與海景交織",
    priceJPY: "免費", priceTWD: "免費",
    highlights: ["阿妹茶樓", "昇平戲院", "金礦博物館", "芋圓", "基山街"],
    access: "台北車站搭1062公車約1.5小時", hours: "全天（店鋪約10:00-20:00）", bestSeason: "全年（傍晚最美）",
    backDesc: "九份曾是淘金重鎮，如今以蜿蜒的石階、紅燈籠和山海美景聞名。窄小的基山街和豎崎路兩旁是各種小吃和手工藝品店。傍晚時分紅燈籠亮起，整座山城宛如宮崎駿動畫中的場景。",
    tips: "平日傍晚前往最佳，假日人潮非常擁擠。必吃阿蘭草仔粿和賴阿婆芋圓。"
  },
  {
    id: 30, name: "吳哥窟", location: "柬埔寨暹粒", rating: 4.9, reviews: 45600, category: "文化",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80",
    gallery: [],
    description: "世界最大宗教建築群，高棉帝國的千年瑰寶",
    priceJPY: "$37 USD", priceTWD: "約NT$1,200（一日券）",
    highlights: ["吳哥窟日出", "巴戎寺微笑", "塔普倫寺", "女皇宮", "洞里薩湖"],
    access: "暹粒機場搭嘟嘟車20分鐘", hours: "5:30-17:30", bestSeason: "乾季（11-3月）",
    backDesc: "吳哥窟建於12世紀，是世界七大奇蹟之一。整座建築群佔地超過400平方公里，包含上百座寺廟遺跡。日出時倒映在護城河的剪影是最經典的畫面。巴戎寺的216尊微笑石佛面和被巨樹纏繞的塔普倫寺同樣震撼人心。",
    tips: "建議購買三日券($62)慢慢遊覽。清晨5點前抵達才能佔到好位置看日出。"
  },
];

const categories = ["全部", "文化", "自然", "海島", "城市", "親子", "運動", "購物"];

const categoryIcons: Record<string, React.ReactNode> = {
  "文化": <Globe className="w-3.5 h-3.5" />,
  "自然": <TreePine className="w-3.5 h-3.5" />,
  "海島": <Mountain className="w-3.5 h-3.5" />,
  "城市": <Camera className="w-3.5 h-3.5" />,
  "親子": <Utensils className="w-3.5 h-3.5" />,
  "運動": <Snowflake className="w-3.5 h-3.5" />,
  "購物": <ShoppingBag className="w-3.5 h-3.5" />,
};

export default function Spots() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const filtered = allSpots.filter((s) => {
    const matchSearch = s.name.includes(search) || s.location.includes(search) || s.description.includes(search);
    const matchCategory = category === "全部" || s.category === category;
    return matchSearch && matchCategory;
  });

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const handleFlip = (id: number) => {
    if (flippedId === id) {
      setExpanded(false);
      setTimeout(() => setFlippedId(null), 300);
    } else {
      setFlippedId(id);
      // First flip, then expand after flip completes
      setTimeout(() => setExpanded(true), 400);
    }
  };

  const handleClose = () => {
    setExpanded(false);
    setTimeout(() => setFlippedId(null), 300);
  };

  const flippedSpot = allSpots.find((s) => s.id === flippedId);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (flippedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [flippedId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>探索景點</h1>
            <p className="text-muted-foreground mb-6">發現世界各地令人驚嘆的旅遊目的地</p>
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
            <Badge key={c} variant={category === c ? "default" : "outline"} className="cursor-pointer rounded-full px-4 py-1.5 text-sm gap-1.5" onClick={() => setCategory(c)}>
              {categoryIcons[c]}{c}
            </Badge>
          ))}
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">共找到 <span className="font-semibold text-foreground">{filtered.length}</span> 個景點</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="cursor-pointer"
                onClick={() => handleFlip(spot.id)}
              >
                <div className="organic-card overflow-hidden bg-card border border-border/50 group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button onClick={(e) => toggleFavorite(e, spot.id)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10">
                      <Heart className={`w-4 h-4 ${favorites.includes(spot.id) ? "fill-red-500 text-red-500" : "text-stone-600"}`} />
                    </button>
                    <Badge className="absolute top-3 left-3 rounded-full bg-white/80 text-stone-700 backdrop-blur-sm border-0 text-xs gap-1">
                      {categoryIcons[spot.category]}{spot.category}
                    </Badge>
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
          </div>
        </div>
      </section>

      {/* Flip then Expand Modal */}
      <AnimatePresence>
        {flippedSpot && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 w-full"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ maxWidth: "640px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50"
              >
                {/* Header image */}
                <div className="relative h-52 overflow-hidden">
                  <img src={flippedSpot.image} alt={flippedSpot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm rounded-full mb-2 gap-1">
                      {categoryIcons[flippedSpot.category]}{flippedSpot.category}
                    </Badge>
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{flippedSpot.name}</h2>
                    <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{flippedSpot.location}</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{flippedSpot.rating} ({flippedSpot.reviews.toLocaleString()}則評論)</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
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

                  {/* Tips */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h3 className="text-sm font-bold mb-1 text-amber-700 dark:text-amber-400">旅行小貼士</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-300">{flippedSpot.tips}</p>
                  </div>

                  {/* Info grid */}
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

                  <Button className="w-full rounded-xl" variant="outline" onClick={handleClose}>
                    <ChevronLeft className="w-4 h-4 mr-1" />返回景點列表
                  </Button>
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
