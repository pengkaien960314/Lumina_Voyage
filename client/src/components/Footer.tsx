/*
 * Design: Organic Naturalism
 * - Warm earth-tone footer with subtle leaf decoration
 */
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Wanderlust
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              探索世界的每一個角落，<br />
              記錄旅途中的每一份感動。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-sans)" }}>探索</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/spots" className="hover:text-foreground transition-colors">熱門景點</a></li>
              <li><a href="/planner" className="hover:text-foreground transition-colors">行程規劃</a></li>
              <li><a href="/diary" className="hover:text-foreground transition-colors">旅遊日記</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-sans)" }}>服務</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/hotels" className="hover:text-foreground transition-colors">旅館預訂</a></li>
              <li><a href="/flights" className="hover:text-foreground transition-colors">機票查詢</a></li>
              <li><a href="/tools" className="hover:text-foreground transition-colors">旅行工具</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-sans)" }}>關於</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">關於我們</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">隱私政策</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">服務條款</a></li>
            </ul>
          </div>
        </div>

        <div className="leaf-divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Wanderlust 旅行探索. 資管系專題作品.
          </p>
          <p className="text-xs text-muted-foreground">
            以自然之心，探索世界之美
          </p>
        </div>
      </div>
    </footer>
  );
}
