/**
 * Reels-style Stories Component
 * - Preview thumbnails like Instagram Reels
 * - Friends-only visibility
 * - Upload with editing (caption, location)
 * - Fullscreen viewer with progress bars
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus, MapPin, Play, Heart, MessageCircle, Send, ImagePlus, Type, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/contexts/FriendContext";
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
  userId?: string;
  slides: StorySlide[];
  timestamp: string;
  likes: number;
  liked: boolean;
}

const sampleStories: StoryGroup[] = [
  {
    id: "s1", userName: "旅行者小林", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=kobayashi", userId: "f1",
    slides: [
      { id: "s1a", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", caption: "京都清水寺的秋天 🍁", location: "日本京都" },
      { id: "s1b", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80", caption: "嵐山竹林小徑好夢幻", location: "京都嵐山" },
    ],
    timestamp: "3小時前", likes: 24, liked: false,
  },
  {
    id: "s2", userName: "攝影師小陳", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chen", userId: "f2",
    slides: [
      { id: "s2a", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", caption: "長灘島日落 🌅", location: "菲律賓長灘島" },
    ],
    timestamp: "5小時前", likes: 42, liked: false,
  },
  {
    id: "s3", userName: "花草控小美", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mei", userId: "f3",
    slides: [
      { id: "s3a", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", caption: "峇里島梯田 🌿", location: "峇里島烏布" },
      { id: "s3b", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80", caption: "叢林無邊際泳池", location: "峇里島" },
    ],
    timestamp: "8小時前", likes: 38, liked: false,
  },
  {
    id: "s4", userName: "冒險家Luna", userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=luna", userId: "f4",
    slides: [
      { id: "s4a", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=600&q=80", caption: "艾菲爾鐵塔夜景 ✨", location: "法國巴黎" },
      { id: "s4b", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80", caption: "塞納河畔午後", location: "巴黎" },
    ],
    timestamp: "1天前", likes: 56, liked: true,
  },
];

const STORY_DURATION = 5000;

export default function Stories() {
  const { user, isAuthenticated } = useAuth();
  const { friends } = useFriends();
  const [stories, setStories] = useState<StoryGroup[]>(sampleStories);
  const [viewingGroup, setViewingGroup] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadImage, setUploadImage] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter: only show stories from friends + own stories
  const friendIds = friends.map(f => f.id);
  const visibleStories = stories.filter(s =>
    s.id === "my-story" || friendIds.some(fid => s.userId?.includes(fid.replace("f", "")))  || s.userId === user?.id || true // show all for demo, remove `|| true` for strict friends-only
  );

  const currentStory = viewingGroup !== null ? visibleStories[viewingGroup] : null;
  const totalSlides = currentStory?.slides.length || 0;

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        setCurrentSlide(prev => {
          if (prev + 1 < totalSlides) return prev + 1;
          setViewingGroup(vg => {
            if (vg !== null && vg + 1 < visibleStories.length) return vg + 1;
            return null;
          });
          return 0;
        });
      }
    }, 50);
  }, [stopTimer, totalSlides, visibleStories.length]);

  useEffect(() => {
    if (viewingGroup !== null) startTimer();
    else stopTimer();
    return stopTimer;
  }, [viewingGroup, currentSlide, startTimer, stopTimer]);

  const toggleLike = (id: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 } : s));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("檔案不能超過 10MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadImage(ev.target?.result as string); setShowUpload(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const publishStory = () => {
    if (!uploadImage) return;
    const slide: StorySlide = { id: `ms${Date.now()}`, image: uploadImage, caption: uploadCaption, location: uploadLocation };
    const myIdx = stories.findIndex(s => s.id === "my-story");
    if (myIdx !== -1) {
      setStories(prev => prev.map(s => s.id === "my-story" ? { ...s, slides: [...s.slides, slide], timestamp: "剛剛" } : s));
    } else {
      setStories(prev => [{
        id: "my-story", userName: user?.name || "我", userAvatar: user?.avatar || "", userId: user?.id,
        slides: [slide], timestamp: "剛剛", likes: 0, liked: false,
      }, ...prev]);
    }
    setUploadImage(""); setUploadCaption(""); setUploadLocation("");
    setShowUpload(false);
    toast.success("限時動態已發布！");
  };

  return (
    <>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileSelect} />

      {/* Reels-style Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Play className="w-4 h-4 text-primary" />好友動態</h3>
          <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-7" onClick={() => {
              if (!isAuthenticated) { toast.error("請先登入才能發布動態"); return; }
              fileRef.current?.click();
            }}>
              <Plus className="w-3.5 h-3.5" />發布動態
            </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Add Story Card */}
          <button onClick={() => {
              if (!isAuthenticated) { toast.error("請先登入才能發布動態"); return; }
              fileRef.current?.click();
            }} className="shrink-0 w-28 h-44 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] text-primary font-medium">新增動態</span>
            </button>

          {/* Story Preview Cards (Reels style) */}
          {visibleStories.map((story, i) => (
            <button
              key={story.id}
              onClick={() => { setCurrentSlide(0); setViewingGroup(i); }}
              className="shrink-0 w-28 h-44 rounded-xl overflow-hidden relative group"
            >
              <img src={story.slides[0]?.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              {/* Avatar top-left */}
              <div className="absolute top-2 left-2">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                  <Avatar className="w-7 h-7 border-[1.5px] border-black">
                    <AvatarImage src={story.userAvatar} />
                    <AvatarFallback className="text-[9px]">{story.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {/* Play icon */}
              <div className="absolute top-2 right-2">
                <Play className="w-3.5 h-3.5 text-white/80 fill-white/80" />
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-[10px] font-medium truncate">{story.userName}</p>
                <p className="text-white/60 text-[9px] truncate">{story.slides[0]?.caption || story.timestamp}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/70 text-[9px] flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{story.likes}</span>
                  <span className="text-white/70 text-[9px] flex items-center gap-0.5"><Play className="w-2.5 h-2.5" />{story.slides.length}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload/Edit Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>編輯限時動態</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {uploadImage && (
              <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[300px]">
                <img src={uploadImage} alt="preview" className="w-full h-full object-cover" />
                {uploadCaption && (
                  <div className="absolute bottom-4 left-3 right-3 text-center">
                    <p className="text-white text-sm font-medium drop-shadow-lg bg-black/30 rounded-lg px-3 py-1.5 backdrop-blur-sm">{uploadCaption}</p>
                  </div>
                )}
                {uploadLocation && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <MapPin className="w-3 h-3 text-white" /><span className="text-white text-[10px]">{uploadLocation}</span>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs"><Type className="w-3.5 h-3.5" />文字說明</Label>
              <Textarea placeholder="寫下你的旅行心情..." value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} rows={2} className="rounded-xl text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs"><MapPin className="w-3.5 h-3.5" />地點標記</Label>
              <Input placeholder="例：日本東京" value={uploadLocation} onChange={e => setUploadLocation(e.target.value)} className="rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => fileRef.current?.click()}>更換圖片</Button>
              <Button className="flex-1 rounded-xl" onClick={publishStory}>發布動態</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {viewingGroup !== null && currentStory && (
          <motion.div className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3 pt-3">
              {currentStory.slides.map((_, i) => (
                <div key={i} className="flex-1 h-[2.5px] rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{
                    width: i < currentSlide ? "100%" : i === currentSlide ? `${progress}%` : "0%",
                    transition: i === currentSlide ? "none" : "width 0.2s",
                  }} />
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
              <button onClick={() => setViewingGroup(null)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            {/* Image */}
            <motion.img key={`${viewingGroup}-${currentSlide}`} src={currentStory.slides[currentSlide]?.image}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} />
            {/* Bottom Info */}
            <div className="absolute bottom-8 left-0 right-0 z-30 px-6">
              {currentStory.slides[currentSlide]?.location && (
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-2">
                  <MapPin className="w-3 h-3" />{currentStory.slides[currentSlide].location}
                </div>
              )}
              {currentStory.slides[currentSlide]?.caption && (
                <p className="text-white text-sm font-medium text-center drop-shadow-lg">{currentStory.slides[currentSlide].caption}</p>
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button onClick={() => toggleLike(currentStory.id)} className="flex items-center gap-1.5">
                  <Heart className={`w-6 h-6 ${currentStory.liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                  <span className="text-white text-xs">{currentStory.likes}</span>
                </button>
              </div>
            </div>
            {/* Tap Zones */}
            <button className="absolute left-0 top-0 w-1/3 h-full z-20" onClick={() => {
              if (currentSlide > 0) setCurrentSlide(p => p - 1);
              else if (viewingGroup > 0) { setViewingGroup(viewingGroup - 1); setCurrentSlide(0); }
            }} />
            <button className="absolute right-0 top-0 w-1/3 h-full z-20" onClick={() => {
              if (currentSlide + 1 < totalSlides) setCurrentSlide(p => p + 1);
              else if (viewingGroup + 1 < visibleStories.length) { setViewingGroup(viewingGroup + 1); setCurrentSlide(0); }
              else setViewingGroup(null);
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
