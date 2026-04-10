/*
 * LiquidGlass — 液態玻璃元件
 * 
 * 效果：
 *  1. 放大背景圖（magnify）— 內部重新繪製 backgroundImage，比例放大
 *  2. 微暗（tint）— brightness 降低
 *  3. 模糊邊框（blurry edge）— 外層 box-shadow 散射
 *  4. 高光反射 + 色散折射（specular + caustics）— ::before / ::after
 *
 * 用法：
 *  <LiquidGlass bgImage="/images/home/experience.jpg" className="p-5">
 *    <h3>卡片內容</h3>
 *  </LiquidGlass>
 */
import React from "react";

interface LiquidGlassProps {
  /** 背景圖片路徑（會在玻璃內放大顯示） */
  bgImage: string;
  /** 放大倍率，預設 200% */
  zoom?: number;
  /** 背景圖在玻璃內的位置，預設 "center" */
  bgPosition?: string;
  /** 玻璃內暗度 0~1，預設 0.35 */
  dimAmount?: number;
  /** 圓角大小，預設 "1.5rem" */
  radius?: string;
  /** 額外的 className */
  className?: string;
  /** 子元素 */
  children: React.ReactNode;
  /** 點擊事件 */
  onClick?: () => void;
}

export default function LiquidGlass({
  bgImage,
  zoom = 200,
  bgPosition = "center",
  dimAmount = 0.35,
  radius = "1.5rem",
  className = "",
  children,
  onClick,
}: LiquidGlassProps) {
  return (
    <div
      className={`liquid-glass-wrap group ${className}`}
      style={{ borderRadius: radius }}
      onClick={onClick}
    >
      {/* Layer 1: 放大的背景圖 + 微暗 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          borderRadius: "inherit",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: bgPosition,
          backgroundRepeat: "no-repeat",
          filter: `brightness(${1 - dimAmount}) saturate(1.3)`,
        }}
      />

      {/* Layer 2: 極輕微磨砂（讓放大背景仍清晰可見） */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          borderRadius: "inherit",
          backdropFilter: "blur(0.8px) saturate(1.4)",
          WebkitBackdropFilter: "blur(0.8px) saturate(1.4)",
          background: "rgba(255,255,255,0.02)",
        }}
      />

      {/* Layer 3: 高光反射（左上角） */}
      <div
        className="absolute pointer-events-none z-[2]"
        style={{
          top: "-40%",
          left: "-25%",
          width: "85%",
          height: "90%",
          background:
            "radial-gradient(ellipse at 38% 38%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)",
        }}
      />

      {/* Layer 4: 色散折射（彩虹邊緣） */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(110deg, transparent 10%, rgba(255,140,140,0.05) 22%, rgba(140,255,180,0.04) 38%, rgba(140,180,255,0.06) 54%, rgba(255,220,140,0.04) 68%, rgba(200,140,255,0.04) 82%, transparent 92%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Layer 5: Hover 亮度提升 */}
      <div className="absolute inset-0 z-[3] bg-white/0 group-hover:bg-white/[0.06] transition-all duration-500" style={{ borderRadius: "inherit" }} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
