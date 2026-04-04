import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "1. 資料收集", content: "我們收集您在使用 Lumina Voyage 服務時主動提供的資訊，包括但不限於：帳號註冊資訊（姓名、電子郵件、電話號碼）、旅行偏好設定、行程規劃內容、旅遊日記文字與照片、預訂記錄等。我們也會自動收集裝置資訊、IP 位址、瀏覽器類型及使用行為數據，以改善服務品質。" },
  { title: "2. 資料使用", content: "您的個人資料將用於：提供及改善我們的旅行服務、處理預訂與交易、發送服務通知與更新、個人化推薦內容、分析使用趨勢以優化產品體驗。我們不會將您的個人資料出售給第三方。" },
  { title: "3. 資料分享", content: "在以下情況下，我們可能會分享您的資訊：經您明確同意時、與合作夥伴（如航空公司、飯店）完成預訂服務時、遵守法律要求或政府機關合法請求時、保護 Lumina Voyage 及其用戶的權益與安全時。" },
  { title: "4. 資料安全", content: "我們採用業界標準的加密技術（SSL/TLS）保護您的資料傳輸安全，並實施嚴格的存取控制措施。所有敏感資料均經過加密儲存，定期進行安全審計與漏洞掃描，確保您的資訊安全無虞。" },
  { title: "5. Cookie 政策", content: "我們使用 Cookie 和類似技術來記住您的偏好設定、維持登入狀態、分析網站流量及提供個人化體驗。您可以透過瀏覽器設定管理 Cookie 偏好，但停用某些 Cookie 可能影響部分功能的正常使用。" },
  { title: "6. 用戶權利", content: "您有權隨時存取、更正或刪除您的個人資料。您也可以要求我們停止處理您的資料，或將資料匯出為可攜式格式。如需行使上述權利，請透過設定頁面操作或聯繫我們的客服團隊。" },
  { title: "7. 兒童隱私", content: "Lumina Voyage 的服務不針對 13 歲以下的兒童。我們不會故意收集未滿 13 歲兒童的個人資訊。如果我們發現已收集到兒童的資料，將立即採取措施刪除相關資訊。" },
  { title: "8. 政策更新", content: "我們可能會不定期更新本隱私政策。重大變更時，我們將透過應用程式內通知或電子郵件告知您。建議您定期查閱本頁面以了解最新的隱私保護措施。本政策最後更新日期為 2026 年 4 月 1 日。" },
];

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>隱私政策</h1>
            </div>
            <p className="text-muted-foreground">最後更新：2026 年 4 月 1 日</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container max-w-3xl">
          <p className="text-muted-foreground mb-8 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Lumina Voyage（以下簡稱「我們」）非常重視您的隱私權。本隱私政策說明我們如何收集、使用、儲存及保護您的個人資訊。使用我們的服務即表示您同意本政策所述之資料處理方式。
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
