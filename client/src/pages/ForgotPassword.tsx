/*
 * Design: Organic Naturalism — Forgot Password Page
 * - Clean form with email verification flow
 * - OTP code input and new password setup
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, KeyRound, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      toast.error("請輸入有效的電子郵件地址");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success("驗證碼已發送至您的信箱");
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("請輸入完整的驗證碼");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (otp === "0000") {
      toast.error("驗證碼錯誤，請重試");
      return;
    }
    toast.success("驗證成功");
    setStep("newPassword");
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("密碼至少需要6個字元");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("兩次輸入的密碼不一致");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success("密碼重設成功！");
    setStep("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="absolute top-4 left-4 gap-1.5">
                <ArrowLeft className="w-4 h-4" />返回登入
              </Button>
            </Link>
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>忘記密碼</CardTitle>
                  <CardDescription className="mt-2">輸入您的電子郵件，我們將發送驗證碼</CardDescription>
                </motion.div>
              )}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4 mt-4">
                    <KeyRound className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>輸入驗證碼</CardTitle>
                  <CardDescription className="mt-2">驗證碼已發送至 {email}</CardDescription>
                </motion.div>
              )}
              {step === "newPassword" && (
                <motion.div key="newPass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4 mt-4">
                    <KeyRound className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>設定新密碼</CardTitle>
                  <CardDescription className="mt-2">請輸入您的新密碼</CardDescription>
                </motion.div>
              )}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4 mt-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>密碼重設成功</CardTitle>
                  <CardDescription className="mt-2">您現在可以使用新密碼登入</CardDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div key="email-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵件</Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <Button className="w-full h-11 rounded-xl" onClick={handleSendOtp} disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />發送中...</> : "發送驗證碼"}
                  </Button>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">驗證碼</Label>
                    <Input id="otp" type="text" placeholder="輸入6位數驗證碼" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="h-11 rounded-xl text-center text-lg tracking-[0.5em]" maxLength={6} />
                  </div>
                  <Button className="w-full h-11 rounded-xl" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />驗證中...</> : "驗證"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleSendOtp} disabled={loading}>
                    重新發送驗證碼
                  </Button>
                </motion.div>
              )}

              {step === "newPassword" && (
                <motion.div key="pass-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新密碼</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPassword ? "text" : "password"} placeholder="至少6個字元" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 rounded-xl pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">確認新密碼</Label>
                    <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="再次輸入新密碼" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <Button className="w-full h-11 rounded-xl" onClick={handleResetPassword} disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />重設中...</> : "重設密碼"}
                  </Button>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Button className="w-full h-11 rounded-xl" onClick={() => navigate("/login")}>
                    返回登入頁面
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
