import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Calendar, MapPin, Users, Clock, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MyBookings() {
  const { flightBookings, hotelBookings, cancelFlightBooking, cancelHotelBooking } = useBooking();

  const statusColor = (s: string) => {
    if (s === "confirmed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };
  const statusLabel = (s: string) => s === "confirmed" ? "已確認" : s === "pending" ? "待確認" : "已取消";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-8 bg-secondary/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>我的預訂</h1>
            <p className="text-muted-foreground">查看已預訂的機票、飯店與行程</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-4xl">
          <Tabs defaultValue="flights" className="space-y-6">
            <TabsList className="grid grid-cols-2 h-12 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger value="flights" className="rounded-lg gap-2 data-[state=active]:bg-background"><Plane className="w-4 h-4" />機票 ({flightBookings.length})</TabsTrigger>
              <TabsTrigger value="hotels" className="rounded-lg gap-2 data-[state=active]:bg-background"><Hotel className="w-4 h-4" />飯店 ({hotelBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="flights">
              {flightBookings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Plane className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>尚未預訂任何機票</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flightBookings.map((f, i) => (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {f.logo ? <img src={f.logo} alt={f.airline} className="w-8 h-8 rounded" /> : <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center"><Plane className="w-4 h-4 text-primary" /></div>}
                              <div>
                                <p className="font-semibold text-sm">{f.airline} {f.code}</p>
                                <p className="text-xs text-muted-foreground">{f.class}</p>
                              </div>
                            </div>
                            <Badge className={`${statusColor(f.status)} border-0 rounded-full text-xs`}>{statusLabel(f.status)}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="text-center"><p className="font-bold">{f.departTime}</p><p className="text-xs text-muted-foreground">{f.from}</p></div>
                            <div className="flex-1 flex flex-col items-center"><span className="text-xs text-muted-foreground">{f.duration}</span><div className="w-full h-px bg-border" /></div>
                            <div className="text-center"><p className="font-bold">{f.arriveTime}</p><p className="text-xs text-muted-foreground">{f.to}</p></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{f.date}</span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{f.passengers}人</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary">${f.price.toLocaleString()}</span>
                              {f.status !== "cancelled" && <Button size="sm" variant="outline" className="rounded-full text-xs h-7" onClick={() => { cancelFlightBooking(f.id); toast.info("已取消機票預訂"); }}><X className="w-3 h-3 mr-1" />取消</Button>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hotels">
              {hotelBookings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Hotel className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>尚未預訂任何飯店</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelBookings.map((h, i) => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border/50 overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <img src={h.image} alt={h.hotelName} className="w-full sm:w-40 h-32 object-cover" />
                          <CardContent className="p-4 flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{h.hotelName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{h.location}</p>
                              </div>
                              <Badge className={`${statusColor(h.status)} border-0 rounded-full text-xs`}>{statusLabel(h.status)}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span>{h.checkIn} → {h.checkOut}</span>
                              <span>{h.guests}位房客</span>
                              <span>{h.roomType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">${h.totalPrice.toLocaleString()}</span>
                              {h.status !== "cancelled" && <Button size="sm" variant="outline" className="rounded-full text-xs h-7" onClick={() => { cancelHotelBooking(h.id); toast.info("已取消飯店預訂"); }}><X className="w-3 h-3 mr-1" />取消</Button>}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
}
