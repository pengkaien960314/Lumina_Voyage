import React, { createContext, useContext, useState, useEffect } from "react";

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "friend" | "bestFriend";
  addedAt: string;
  phone?: string;
  userId?: string;
}

export interface FriendRequest {
  id: string;
  fromName: string;
  fromAvatar: string;
  method: "phone" | "id" | "code" | "number";
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

interface FriendContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  myCode: string;
  myId: string;
  addFriend: (f: Friend) => void;
  removeFriend: (id: string) => void;
  toggleBestFriend: (id: string) => void;
  addFriendRequest: (r: FriendRequest) => void;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

const sampleFriends: Friend[] = [
  { id: "f1", name: "小明", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ming", status: "friend", addedAt: "2026-03-01" },
  { id: "f2", name: "美咲", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=misaki", status: "bestFriend", addedAt: "2026-02-15" },
  { id: "f3", name: "John", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=john", status: "friend", addedAt: "2026-01-20" },
];

const sampleRequests: FriendRequest[] = [
  { id: "r1", fromName: "櫻花妹", fromAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sakura", method: "id", createdAt: "2026-04-01", status: "pending" },
];

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>(sampleFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(sampleRequests);
  const [myCode] = useState(() => {
  const stored = localStorage.getItem("lumina_my_code");
  if (stored) return stored;
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  localStorage.setItem("lumina_my_code", code);
  return code;
});
  const [myId] = useState(() => {
  const stored = localStorage.getItem("lumina_my_id");
  if (stored) return stored;
  const id = "LV" + Math.floor(10000 + Math.random() * 90000);
  localStorage.setItem("lumina_my_id", id);
  return id;
});


  useEffect(() => {
    const stored = localStorage.getItem("lumina_friends");
    if (stored) setFriends(JSON.parse(stored));
  }, []);

  const save = (data: Friend[]) => localStorage.setItem("lumina_friends", JSON.stringify(data));

  const addFriend = (f: Friend) => { const next = [...friends, f]; setFriends(next); save(next); };
  const removeFriend = (id: string) => { const next = friends.filter((f) => f.id !== id); setFriends(next); save(next); };
  const toggleBestFriend = (id: string) => {
    const next = friends.map((f) => f.id === id ? { ...f, status: (f.status === "bestFriend" ? "friend" : "bestFriend") as "friend" | "bestFriend" } : f);
    setFriends(next);
    save(next);
  };
  const addFriendRequest = (r: FriendRequest) => setFriendRequests([...friendRequests, r]);
  const acceptRequest = (id: string) => {
    const req = friendRequests.find((r) => r.id === id);
    if (req) {
      addFriend({ id: `f${Date.now()}`, name: req.fromName, avatar: req.fromAvatar, status: "friend", addedAt: new Date().toISOString().split("T")[0] });
      setFriendRequests(friendRequests.map((r) => r.id === id ? { ...r, status: "accepted" } : r));
    }
  };
  const rejectRequest = (id: string) => setFriendRequests(friendRequests.map((r) => r.id === id ? { ...r, status: "rejected" } : r));

  return (
    <FriendContext.Provider value={{ friends, friendRequests, myCode, myId, addFriend, removeFriend, toggleBestFriend, addFriendRequest, acceptRequest, rejectRequest }}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendContext);
  if (!ctx) throw new Error("useFriends must be used within FriendProvider");
  return ctx;
}
