/*
 * Design: Organic Naturalism — AI Translation
 * Uses Google Gemini API for high-quality translations
 */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Send, Loader2, ArrowRightLeft, Copy, Volume2,
  RotateCcw, Languages, MessageSquare, Mic, ChevronDown, ChevronUp,
  BookOpen, Star, History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GEMINI_API_KEY = "AIzaSyB_tEx6ILOy6U7NOwtYmclHwLWqNXyRQmQ";

interface TranslationResult {
  id: string;
  source: string;
  translated: string;
  fromLang: string;
  toLang: string;
  timestamp: string;
  pronunciation?: string;
  alternatives?: string[];
  context?: string;
}

interface ConversationMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  translation?: string;
}

const languages = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "簡體中文", flag: "🇨🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "th", label: "ภาษาไทย", flag: "🇹🇭" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
];

const travelPhrases = [
  { category: "基本問候", phrases: ["你好", "謝謝", "不好意思", "再見", "請問"] },
  { category: "交通", phrases: ["請問車站在哪裡？", "我要搭計程車", "這班車到哪裡？", "多少錢？"] },
  { category: "餐廳", phrases: ["請給我菜單", "我要點餐", "結帳", "好吃", "不辣"] },
  { category: "住宿", phrases: ["我有預訂", "幾點退房？", "Wi-Fi 密碼是什麼？", "可以寄放行李嗎？"] },
  { category: "緊急", phrases: ["請幫幫我", "我迷路了", "請叫救護車", "我的護照不見了"] },
];

export default function AiTranslate() {
  const [mode, setMode] = useState<"translate" | "conversation" | "phrases">("translate");
  const [fromLang, setFromLang] = useState("zh-TW");
  const [toLang, setToLang] = useState("ja");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Conversation mode
  const [convoMessages, setConvoMessages] = useState<ConversationMessage[]>([]);
  const [convoInput, setConvoInput] = useState("");
  const [convoLoading, setConvoLoading] = useState(false);
  const convoRef = useRef<HTMLDivElement>(null);

  // Phrases
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [phraseLoading, setPhraseLoading] = useState<string | null>(null);

  useEffect(() => {
    convoRef.current?.scrollTo({ top: convoRef.current.scrollHeight, behavior: "smooth" });
  }, [convoMessages]);

  const callGemini = async (prompt: string): Promise<string> => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );
    if (!response.ok) throw new Error(`API 錯誤: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const translate = async () => {
    if (!inputText.trim()) { toast.error("請輸入要翻譯的文字"); return; }
    setLoading(true);
    setResult(null);

    const fromLabel = languages.find((l) => l.code === fromLang)?.label || fromLang;
    const toLabel = languages.find((l) => l.code === toLang)?.label || toLang;

    const prompt = `你是一位專業翻譯。請將以下文字從${fromLabel}翻譯成${toLabel}。

原文：${inputText}

請以 JSON 格式回覆（不要加 markdown 代碼塊標記）：
{
  "translated": "翻譯結果",
  "pronunciation": "發音指南（用原文語言的羅馬拼音或注音，如果目標語言是中文則不需要）",
  "alternatives": ["替代翻譯1", "替代翻譯2"],
  "context": "使用場景或文化背景說明"
}`;

    try {
      const text = await callGemini(prompt);
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) jsonStr = jsonStr.substring(braceStart, braceEnd + 1);

      const parsed = JSON.parse(jsonStr);
      const newResult: TranslationResult = {
        id: `t${Date.now()}`,
        source: inputText,
        translated: parsed.translated,
        fromLang,
        toLang,
        timestamp: new Date().toLocaleTimeString(),
        pronunciation: parsed.pronunciation,
        alternatives: parsed.alternatives,
        context: parsed.context,
      };
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev].slice(0, 20));
      toast.success("翻譯完成");
    } catch (err) {
      console.error("Translation error:", err);
      toast.error("翻譯失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    if (result) {
      setInputText(result.translated);
      setResult(null);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  const speak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // Conversation mode
  const sendConvoMessage = async () => {
    if (!convoInput.trim()) return;
    setConvoLoading(true);

    const fromLabel = languages.find((l) => l.code === fromLang)?.label || fromLang;
    const toLabel = languages.find((l) => l.code === toLang)?.label || toLang;

    const userMsg: ConversationMessage = { id: `cm${Date.now()}`, role: "user", text: convoInput };
    setConvoMessages((prev) => [...prev, userMsg]);
    setConvoInput("");

    const prompt = `你是一位旅行翻譯助手。使用者用${fromLabel}說了：「${convoInput}」
請翻譯成${toLabel}，並以旅行情境給出自然的回覆建議。

以 JSON 格式回覆（不要加 markdown 代碼塊標記）：
{
  "translation": "翻譯結果",
  "suggestion": "一個簡短的旅行情境回覆建議（用${fromLabel}）"
}`;

    try {
      const text = await callGemini(prompt);
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) jsonStr = jsonStr.substring(braceStart, braceEnd + 1);

      const parsed = JSON.parse(jsonStr);
      const aiMsg: ConversationMessage = {
        id: `cm${Date.now() + 1}`,
        role: "ai",
        text: parsed.suggestion || "翻譯完成",
        translation: parsed.translation,
      };
      setConvoMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Convo error:", err);
      toast.error("翻譯失敗");
    } finally {
      setConvoLoading(false);
    }
  };

  // Phrase translation
  const translatePhrase = async (phrase: string) => {
    setPhraseLoading(phrase);
    const toLabel = languages.find((l) => l.code === toLang)?.label || toLang;

    try {
      const text = await callGemini(
        `將「${phrase}」翻譯成${toLabel}，只回覆翻譯結果，不要其他文字。`
      );
      toast(
        <div>
          <p className="font-medium">{phrase}</p>
          <p className="text-muted-foreground mt-1">{text.trim()}</p>
        </div>,
        { duration: 5000 }
      );
    } catch {
      toast.error("翻譯失敗");
    } finally {
      setPhraseLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/5 to-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>AI 翻譯</h1>
                <p className="text-muted-foreground text-sm">AI 驅動的智慧翻譯，支援多語言與旅行情境</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "translate", label: "翻譯", icon: Languages },
              { key: "conversation", label: "對話翻譯", icon: MessageSquare },
              { key: "phrases", label: "旅行常用語", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant={mode === tab.key ? "default" : "outline"}
                  className="rounded-full gap-2 flex-1"
                  onClick={() => setMode(tab.key as any)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Language Selector */}
          <Card className="mb-6 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Select value={fromLang} onValueChange={setFromLang}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.flag} {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={swapLanguages}>
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Select value={toLang} onValueChange={setToLang}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.flag} {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translate Mode */}
          {mode === "translate" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <Textarea
                    placeholder="輸入要翻譯的文字..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    className="rounded-xl border-0 bg-transparent resize-none text-base focus-visible:ring-0"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => speak(inputText, fromLang)} disabled={!inputText}>
                        <Volume2 className="w-3.5 h-3.5" />朗讀
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => { setInputText(""); setResult(null); }}>
                        <RotateCcw className="w-3.5 h-3.5" />清除
                      </Button>
                    </div>
                    <Button className="rounded-xl gap-2" onClick={translate} disabled={loading || !inputText.trim()}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI 翻譯
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <p className="text-lg font-medium leading-relaxed flex-1">{result.translated}</p>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyText(result.translated)}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => speak(result.translated, result.toLang)}>
                              <Volume2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {result.pronunciation && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mic className="w-3.5 h-3.5 shrink-0" />
                            <span className="italic">{result.pronunciation}</span>
                          </div>
                        )}

                        {result.alternatives && result.alternatives.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">其他翻譯：</p>
                            <div className="flex gap-2 flex-wrap">
                              {result.alternatives.map((alt, i) => (
                                <Badge key={i} variant="outline" className="rounded-full text-xs cursor-pointer hover:bg-primary/10" onClick={() => copyText(alt)}>
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.context && (
                          <div className="pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground">
                              <Star className="w-3 h-3 inline mr-1" />
                              {result.context}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History */}
              {history.length > 0 && (
                <div>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2" onClick={() => setShowHistory(!showHistory)}>
                    <History className="w-3.5 h-3.5" />
                    翻譯紀錄 ({history.length})
                    {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <AnimatePresence>
                    {showHistory && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
                        {history.map((h) => (
                          <Card key={h.id} className="border-border/30">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span>{languages.find((l) => l.code === h.fromLang)?.flag}</span>
                                <span>→</span>
                                <span>{languages.find((l) => l.code === h.toLang)?.flag}</span>
                                <span className="ml-auto">{h.timestamp}</span>
                              </div>
                              <p className="text-sm">{h.source}</p>
                              <p className="text-sm text-primary mt-1">{h.translated}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* Conversation Mode */}
          {mode === "conversation" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div ref={convoRef} className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {convoMessages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">開始 AI 對話翻譯</p>
                        <p className="text-muted-foreground text-xs mt-1">輸入文字，AI 會翻譯並給出旅行情境建議</p>
                      </div>
                    )}
                    {convoMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary rounded-tl-sm"}`}>
                          <p className="text-sm">{msg.text}</p>
                          {msg.translation && (
                            <div className={`mt-2 pt-2 border-t ${msg.role === "user" ? "border-primary-foreground/20" : "border-border/50"}`}>
                              <p className="text-xs opacity-70">翻譯：</p>
                              <p className="text-sm font-medium">{msg.translation}</p>
                              <div className="flex gap-1 mt-1.5">
                                <Button variant="ghost" size="sm" className={`h-6 px-2 rounded-full text-[10px] ${msg.role === "user" ? "text-primary-foreground/70 hover:text-primary-foreground" : ""}`} onClick={() => copyText(msg.translation!)}>
                                  <Copy className="w-3 h-3 mr-1" />複製
                                </Button>
                                <Button variant="ghost" size="sm" className={`h-6 px-2 rounded-full text-[10px] ${msg.role === "user" ? "text-primary-foreground/70 hover:text-primary-foreground" : ""}`} onClick={() => speak(msg.translation!, toLang)}>
                                  <Volume2 className="w-3 h-3 mr-1" />朗讀
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {convoLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary rounded-2xl rounded-tl-sm p-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border/50 p-3 flex gap-2">
                    <input
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground px-3 py-2 rounded-xl border border-input"
                      placeholder={`輸入 ${languages.find((l) => l.code === fromLang)?.label} 文字...`}
                      value={convoInput}
                      onChange={(e) => setConvoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendConvoMessage()}
                      disabled={convoLoading}
                    />
                    <Button size="sm" className="rounded-xl shrink-0" onClick={sendConvoMessage} disabled={convoLoading || !convoInput.trim()}>
                      {convoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full rounded-xl mt-4" onClick={() => setConvoMessages([])}>
                <RotateCcw className="w-4 h-4 mr-2" />重新開始對話
              </Button>
            </motion.div>
          )}

          {/* Phrases Mode */}
          {mode === "phrases" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                點擊常用語即可翻譯為 {languages.find((l) => l.code === toLang)?.flag} {languages.find((l) => l.code === toLang)?.label}
              </p>
              {travelPhrases.map((cat) => (
                <Card key={cat.category} className="border-border/50 overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                  >
                    <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>{cat.category}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full text-xs">{cat.phrases.length} 句</Badge>
                      {expandedCategory === cat.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedCategory === cat.category && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <CardContent className="pt-0 pb-4 px-4 space-y-2">
                          {cat.phrases.map((phrase) => (
                            <Button
                              key={phrase}
                              variant="outline"
                              className="w-full justify-start rounded-xl text-sm h-auto py-3 px-4"
                              onClick={() => translatePhrase(phrase)}
                              disabled={phraseLoading === phrase}
                            >
                              {phraseLoading === phrase ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />
                              ) : (
                                <Languages className="w-4 h-4 mr-2 shrink-0 text-primary" />
                              )}
                              {phrase}
                            </Button>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
