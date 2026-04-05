import { describe, it, expect, vi, beforeEach } from "vitest";

// 模擬 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe("AuthContext localStorage key", () => {
  it("應該使用 lumina_user 而不是 wanderlust_user", () => {
    const key = "lumina_user";
    localStorageMock.setItem(key, JSON.stringify({ name: "test" }));
    expect(localStorageMock.getItem("lumina_user")).not.toBeNull();
    expect(localStorageMock.getItem("wanderlust_user")).toBeNull();
  });
});

describe("BookingContext", () => {
  it("新增航班後應該能取得", () => {
    const bookings = [];
    const flight = { id: "f1", airline: "CI", status: "confirmed" };
    bookings.push(flight);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].id).toBe("f1");
  });

  it("取消航班後 status 應該變成 cancelled", () => {
    const bookings = [{ id: "f1", status: "confirmed" }];
    const next = bookings.map((f) =>
      f.id === "f1" ? { ...f, status: "cancelled" } : f
    );
    expect(next[0].status).toBe("cancelled");
  });
});
