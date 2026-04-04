import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "1. 服務說明", content: "Lumina Voyage 提供旅行規劃、景點瀏覽、旅遊日記、旅館預訂、機票查詢、翻譯、匯率換算、天氣查詢及導航等綜合旅行服務。本平台為資管系專題作品，部分功能為模擬展示，實際預訂服務需透過合作夥伴完成。" },
  { title: "2. 帳號註冊", content: "使用者需年滿 13 歲方可註冊帳號。您有責任維護帳號安全，包括保管密碼及限制他人使用您的帳號。任何透過您帳號進行的活動，均視為您本人之行為。如發現帳號遭未經授權使用，請立即通知我們。" },
  { title: "3. 使用規範", content: "使用者不得利用本服務從事任何違法行為、發布不當內容、侵犯他人智慧財產權、散布惡意軟體或垃圾訊息、冒充他人身份、或以任何方式干擾服務正常運作。違反上述規範者，我們保留暫停或終止其帳號的權利。" },
  { title: "4. 內容所有權", content: "您在 Lumina Voyage 上發布的旅遊日記、照片及評論等內容，其智慧財產權歸您所有。但您授予我們非獨占性、全球性的使用許可，允許我們在平台上展示、分發及推廣您的內容。您可隨時刪除您發布的內容。" },
  { title: "5. 預訂條款", content: "透過本平台進行的旅館及機票預訂，受各合作夥伴之條款約束。取消及退款政策依各服務提供者規定辦理。Lumina Voyage 作為平台中介，不對預訂服務的品質或結果承擔直接責任，但將協助處理相關爭議。" },
  { title: "6. 免責聲明", content: "本服務按「現狀」提供，我們不對服務的不間斷性、及時性、安全性或無錯誤性作出保證。天氣、匯率等即時資訊僅供參考，不構成任何形式的建議。使用者應自行判斷並承擔使用本服務的風險。" },
  { title: "7. 責任限制", content: "在法律允許的最大範圍內，Lumina Voyage 及其團隊成員不對因使用或無法使用本服務而產生的任何直接、間接、附帶或衍生性損害承擔責任，包括但不限於利潤損失、資料遺失或商譽損害。" },
  { title: "8. 條款修改", content: "我們保留隨時修改本服務條款的權利。重大修改將提前通知使用者。繼續使用本服務即表示您接受修改後的條款。如不同意修改內容，請停止使用本服務並刪除您的帳號。本條款最後更新日期為 2026 年 4 月 1 日。" },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>服務條款</h1>
            </div>
            <p className="text-muted-foreground">最後更新：2026 年 4 月 1 日</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container max-w-3xl">
          <p className="text-muted-foreground mb-8 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            歡迎使用 Lumina Voyage 旅行探索平台。請在使用我們的服務前仔細閱讀以下條款。使用本服務即表示您同意遵守本服務條款。
          </p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm" style={{ fontFamily: "var(--font-body)" }}>{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
