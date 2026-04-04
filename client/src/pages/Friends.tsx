import { useState } from "react";
import { useFriends } from "@/contexts/FriendContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, QrCode, Phone, Hash, Shuffle, UserPlus, Star, Check, X, Copy, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Friends() {
  const { user } = useAuth();
  const { friends, friendRequests, myCode, myId, addFriend, removeFriend, toggleBestFriend, addFriendRequest, acceptRequest, rejectRequest } = useFriends();
  const [addMethod, setAddMethod] = useState<"scan" | "phone" | "id" | "number">("scan");
  const [phoneInput, setPhoneInput] = useState("");
  const [idInput, setIdInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const pendingRequests = friendRequests.filter((r) => r.status === "pending");
  const filteredFriends = friends.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddByPhone = () => {
    if (phoneInput.length < 8) { toast.error("請輸入有效的電話號碼"); return; }
    addFriendRequest({ id: `r${Date.now()}`, fromName: "未知用戶", fromAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${phoneInput}`, method: "phone", createdAt: new Date().toISOString(), status: "pending" });
    toast.success("好友請求已發送，等待對方同意");
    setPhoneInput("");
  };

  const handleAddById = () => {
    if (idInput.length < 3) { toast.error("請輸入有效的 ID"); return; }
    addFriendRequest({ id: `r${Date.now()}`, fromName: "ID用戶", fromAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${idInput}`, method: "id", createdAt: new Date().toISOString(), status: "pending" });
    toast.success("好友請求已發送，等待對方同意");
    setIdInput("");
  };

  const handleAddByNumber = () => {
    if (numberInput.length !== 4) { toast.error("請輸入4位數字"); return; }
    const simName = ["旅行達人", "冒險家", "探索者"][Math.floor(Math.random() * 3)];
    addFriend({ id: `f${Date.now()}`, name: simName, avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${numberInput}`, status: "friend", addedAt: new Date().toISOString().split("T")[0] });
    toast.success(`已成功配對！${simName} 已加入好友`);
    setNumberInput("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>好友</h1>
                <p className="text-muted-foreground">管理你的旅伴與好友</p>
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full gap-2"><UserPlus className="w-4 h-4" />新增好友</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle style={{ fontFamily: "var(--font-display)" }}>新增好友</DialogTitle></DialogHeader>

                  {/* Method Tabs */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { key: "scan" as const, icon: QrCode, label: "掃碼" },
                      { key: "phone" as const, icon: Phone, label: "電話" },
                      { key: "id" as const, icon: Hash, label: "ID" },
                      { key: "number" as const, icon: Shuffle, label: "數字" },
                    ].map((m) => (
                      <button key={m.key} onClick={() => setAddMethod(m.key)} className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${addMethod === m.key ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                        <m.icon className="w-5 h-5" />{m.label}
                      </button>
                    ))}
                  </div>

                  {/* Scan QR */}
                  {addMethod === "scan" && (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 border-2 border-dashed border-primary/30 flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-24 h-24 text-primary mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-mono">{myCode}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">讓好友掃描此 QR Code 即可加入</p>
                      <Button variant="outline" className="rounded-full gap-2" onClick={() => { navigator.clipboard.writeText(myCode); toast.success("邀請碼已複製"); }}>
                        <Copy className="w-4 h-4" />複製邀請碼
                      </Button>
                    </div>
                  )}

                  {/* Phone */}
                  {addMethod === "phone" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">輸入對方電話號碼</Label>
                        <Input placeholder="0912345678" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="rounded-xl" />
                      </div>
                      <p className="text-xs text-muted-foreground">透過電話號碼新增好友需等待對方同意</p>
                      <Button className="w-full rounded-xl" onClick={handleAddByPhone}>發送好友請求</Button>
                    </div>
                  )}

                  {/* ID */}
                  {addMethod === "id" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-secondary/50 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground mb-1">你的 ID</p>
                        <p className="font-bold text-lg font-mono">{myId}</p>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">輸入對方 ID</Label>
                        <Input placeholder="WL1234" value={idInput} onChange={(e) => setIdInput(e.target.value)} className="rounded-xl" />
                      </div>
                      <p className="text-xs text-muted-foreground">透過 ID 新增好友需等待對方同意</p>
                      <Button className="w-full rounded-xl" onClick={handleAddById}>發送好友請求</Button>
                    </div>
                  )}

                  {/* 4-digit Number */}
                  {addMethod === "number" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">雙方同時輸入相同的4位數字即可配對成為好友</p>
                      <Input placeholder="輸入4位數字" value={numberInput} onChange={(e) => setNumberInput(e.target.value.replace(/\D/g, "").slice(0, 4))} className="rounded-xl text-center text-2xl tracking-[0.5em] font-mono" maxLength={4} />
                      <Button className="w-full rounded-xl" onClick={handleAddByNumber} disabled={numberInput.length !== 4}>開始配對</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Badge className="bg-primary text-primary-foreground rounded-full">{pendingRequests.length}</Badge>好友請求
              </h2>
              <div className="space-y-2">
                {pendingRequests.map((r) => (
                  <Card key={r.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10"><AvatarImage src={r.fromAvatar} /><AvatarFallback>{r.fromName[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-semibold text-sm">{r.fromName}</p>
                          <p className="text-xs text-muted-foreground">透過{r.method === "phone" ? "電話" : r.method === "id" ? "ID" : r.method === "code" ? "邀請碼" : "數字配對"}新增</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => { acceptRequest(r.id); toast.success("已接受好友請求"); }}><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" className="rounded-full h-8 w-8 p-0" onClick={() => { rejectRequest(r.id); toast.info("已拒絕好友請求"); }}><X className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜尋好友..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-xl" />
          </div>

          {/* Friends List */}
          <div>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>好友列表 ({friends.length})</h2>
            {filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>尚無好友</p></div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-11 h-11"><AvatarImage src={f.avatar} /><AvatarFallback>{f.name[0]}</AvatarFallback></Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{f.name}</p>
                              {f.status === "bestFriend" && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 rounded-full text-[10px] px-1.5 py-0"><Star className="w-2.5 h-2.5 inline mr-0.5" />摯友</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">加入於 {f.addedAt}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0" onClick={() => { toggleBestFriend(f.id); toast.success(f.status === "bestFriend" ? "已取消摯友" : "已設為摯友"); }} title={f.status === "bestFriend" ? "取消摯友" : "設為摯友"}>
                            <Star className={`w-4 h-4 ${f.status === "bestFriend" ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => { removeFriend(f.id); toast.info("已移除好友"); }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
