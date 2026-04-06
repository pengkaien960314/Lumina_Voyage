import React, { createContext, useContext, useState, useEffect } from "react";

export interface FlightBooking {
  id: string;
  airline: string;
  code: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: number;
  date: string;
  returnDate?: string;
  passengers: number;
  class: string;
  status: "confirmed" | "pending" | "cancelled";
  bookedAt: string;
  logo?: string;
}

export interface HotelBooking {
  id: string;
  hotelName: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  pricePerNight: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
  bookedAt: string;
}

export interface BookingContextType {
  flightBookings: FlightBooking[];
  hotelBookings: HotelBooking[];
  addFlightBooking: (b: FlightBooking) => void;
  addHotelBooking: (b: HotelBooking) => void;
  cancelFlightBooking: (id: string) => void;
  cancelHotelBooking: (id: string) => void;
  updateFlightBooking: (id: string, changes: Partial<FlightBooking>) => void;
  updateHotelBooking: (id: string, changes: Partial<HotelBooking>) => void;

}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);

  useEffect(() => {
    const fb = localStorage.getItem("lumina_flights");
    const hb = localStorage.getItem("lumina_hotels");
    if (fb) setFlightBookings(JSON.parse(fb));
    if (hb) setHotelBookings(JSON.parse(hb));
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const addFlightBooking = (b: FlightBooking) => {
    const next = [...flightBookings, b];
    setFlightBookings(next);
    save("lumina_flights", next);
  };

  const addHotelBooking = (b: HotelBooking) => {
    const next = [...hotelBookings, b];
    setHotelBookings(next);
    save("lumina_hotels", next);
  };

  const cancelFlightBooking = (id: string) => {
    const next = flightBookings.map((f) => f.id === id ? { ...f, status: "cancelled" as const } : f);
    setFlightBookings(next);
    save("lumina_flights", next);
  };

  const cancelHotelBooking = (id: string) => {
    const next = hotelBookings.map((h) => h.id === id ? { ...h, status: "cancelled" as const } : h);
    setHotelBookings(next);
    save("lumina_hotels", next);
  };
  
  const updateFlightBooking = (id: string, changes: Partial<FlightBooking>) => {
    const next = flightBookings.map((f) => f.id === id ? { ...f, ...changes } : f);
    setFlightBookings(next);
    save("lumina_flights", next);
  };

  const updateHotelBooking = (id: string, changes: Partial<HotelBooking>) => {
    const next = hotelBookings.map((h) => h.id === id ? { ...h, ...changes } : h);
    setHotelBookings(next);
    save("lumina_hotels", next);
  };
      return (
    <BookingContext.Provider
      value={{
        flightBookings,
        hotelBookings,
        addFlightBooking,
        addHotelBooking,
        cancelFlightBooking,
        cancelHotelBooking,
        updateFlightBooking,
        updateHotelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
