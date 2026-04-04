import { Button } from "@/components/ui/button";
import { MapPin, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>404</h1>
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            找不到這個頁面
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            抱歉，你要找的頁面不存在或已被移動。
            <br />
            讓我們幫你回到正確的旅途吧！
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setLocation("/")} className="rounded-xl gap-2">
              <Home className="w-4 h-4" />回到首頁
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="rounded-xl gap-2">
              <ArrowLeft className="w-4 h-4" />返回上一頁
            </Button>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
