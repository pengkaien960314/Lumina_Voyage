/**
 * Instagram-style Stories Component
 * - Circular avatars with gradient ring
 * - Fullscreen story viewer with progress bar
 * - Auto-advance timer
 * - Tap left/right to navigate
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Plus, ImagePlus, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StorySlide {
  id: string;
  image: string;
  caption?: string;
  location?: string;
}

interface StoryGroup {
  id: string;
  userName: string;
  userAvatar: string;
  slides: StorySlide[];
  timestamp: string;
  viewed: boolean;
}

const sampleStories: StoryGroup[] = [
  {
    id: "s1", userName: "旅行者小林", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi",
    slides: [
      { id: "s1a", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", caption: "京都清水寺的秋天 🍁", location: "日本京都" },
      { id: "s1b", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80", caption: "嵐山竹林小徑好夢幻", location: "日本京都嵐山" },
    ],
    timestamp: "3小時前", viewed: false,
  },
  {
    id: "s2", userName: "攝影師小陳", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chen",
    slides: [
      { id: "s2a", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", caption: "長灘島的日落太美了 🌅", location: "菲律賓長灘島" },
    ],
    timestamp: "5小時前", viewed: false,
  },
  {
    id: "s3", userName: "花草控小美", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mei",
    slides: [
      { id: "s3a", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", caption: "峇里島的梯田太療癒了 🌿", location: "印尼峇里島烏布" },
      { id: "s3b", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80", caption: "叢林裡的無邊際泳池", location: "峇里島" },
      { id: "s3c", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&q=80", caption: "吳哥窟的日出太震撼了", location: "柬埔寨暹粒" },
    ],
    timestamp: "8小時前", viewed: false,
  },
  {
    id: "s4", userName: "美食家阿傑", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jie",
    slides: [
      { id: "s4a", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80", caption: "拉麵之神！一蘭必吃 🍜", location: "日本東京新宿" },
    ],
    timestamp: "12小時前", viewed: true,
  },
  {
    id: "s5", userName: "冒險家Luna", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=luna",
    slides: [
      { id: "s5a", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=600&q=80", caption: "艾菲爾鐵塔的夜景 ✨", location: "法國巴黎" },
      { id: "s5b", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80", caption: "塞納河畔的浪漫午後", location: "法國巴黎" },
    ],
    timestamp: "1天前", viewed: true,
  },
];

const STORY_DURATION = 5000; // 5 seconds per slide

export default function Stories() {
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState<StoryGroup[]>(sampleStories);
  const [viewingGroup, setViewingGroup] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const fileRef = useRef<HTMLInputElement>(null);

  const currentStory = viewingGroup !== null ? stories[viewingGroup] : null;
  const totalSlides = currentStory?.slides.length || 0;

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        // Auto-advance
        setCurrentSlide(prev => {
          if (prev + 1 < totalSlides) return prev + 1;
          // Move to next story group
          setViewingGroup(vg => {
            if (vg !== null && vg + 1 < stories.length) return vg + 1;
            return null; // Close
          });
          return 0;
        });
      }
    }, 50);
  }, [stopTimer, totalSlides, stories.length]);

  useEffect(() => {
    if (viewingGroup !== null) {
      startTimer();
      // Mark as viewed
      setStories(prev => prev.map((s, i) => i === viewingGroup ? { ...s, viewed: true } : s));
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [viewingGroup, currentSlide, startTimer, stopTimer]);

  const openStory = (index: number) => {
    setCurrentSlide(0);
    setViewingGroup(index);
  };

  const goNext = () => {
    if (currentSlide + 1 < totalSlides) {
      setCurrentSlide(prev => prev + 1);
    } else if (viewingGroup !== null && viewingGroup + 1 < stories.length) {
      setViewingGroup(viewingGroup + 1);
      setCurrentSlide(0);
    } else {
      setViewingGroup(null);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else if (viewingGroup !== null && viewingGroup > 0) {
      setViewingGroup(viewingGroup - 1);
      setCurrentSlide(0);
    }
  };

  const addMyStory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("檔案不能超過 10MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = ev.target?.result as string;
      const myStoryIndex = stories.findIndex(s => s.id === "my-story");
      if (myStoryIndex !== -1) {
        setStories(prev => prev.map(s => s.id === "my-story" ? {
          ...s, slides: [...s.slides, { id: `ms${Date.now()}`, image: img, caption: "" }],
          timestamp: "剛剛",
        } : s));
      } else {
        const myStory: StoryGroup = {
          id: "my-story", userName: user?.name || "我", userAvatar: user?.avatar || "",
          slides: [{ id: `ms${Date.now()}`, image: img, caption: "" }],
          timestamp: "剛剛", viewed: true,
        };
        setStories(prev => [myStory, ...prev]);
      }
      toast.success("限時動態已發布！");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <input type="file" ref={fileRef} accept="image/*,video/*" className="hidden" onChange={addMyStory} />

      {/* Story Circles */}
      <div className="flex gap-4 overflow-x-auto pb-2 px-1 scrollbar-none">
        {/* Add Story Button */}
        {isAuthenticated && (
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[11px] text-muted-foreground">我的動態</span>
          </button>
        )}

        {/* Story Circles */}
        {stories.map((story, i) => (
          <button key={story.id} onClick={() => openStory(i)} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`p-[2.5px] rounded-full ${story.viewed ? "bg-muted" : "bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600"}`}>
              <Avatar className="w-[58px] h-[58px] border-2 border-background">
                <AvatarImage src={story.userAvatar} />
                <AvatarFallback className="text-xs">{story.userName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[11px] text-muted-foreground max-w-[64px] truncate">{story.userName}</span>
          </button>
        ))}
      </div>

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {viewingGroup !== null && currentStory && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3 pt-3">
              {currentStory.slides.map((_, i) => (
                <div key={i} className="flex-1 h-[2.5px] rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{
                      width: i < currentSlide ? "100%" : i === currentSlide ? `${progress}%` : "0%",
                      transition: i === currentSlide ? "none" : "width 0.2s",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border border-white/30">
                  <AvatarImage src={currentStory.userAvatar} />
                  <AvatarFallback className="text-xs text-white">{currentStory.userName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm font-semibold">{currentStory.userName}</p>
                  <p className="text-white/60 text-[10px]">{currentStory.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setViewingGroup(null)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <motion.img
              key={`${viewingGroup}-${currentSlide}`}
              src={currentStory.slides[currentSlide]?.image}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />

            {/* Caption & Location */}
            <div className="absolute bottom-8 left-0 right-0 z-30 px-6 text-center">
              {currentStory.slides[currentSlide]?.location && (
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-2">
                  <MapPin className="w-3 h-3" />{currentStory.slides[currentSlide].location}
                </div>
              )}
              {currentStory.slides[currentSlide]?.caption && (
                <p className="text-white text-sm font-medium drop-shadow-lg">{currentStory.slides[currentSlide].caption}</p>
              )}
            </div>

            {/* Tap Zones */}
            <button className="absolute left-0 top-0 w-1/3 h-full z-20" onClick={goPrev} />
            <button className="absolute right-0 top-0 w-1/3 h-full z-20" onClick={goNext} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
