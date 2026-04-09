import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

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

  // 讀取 localStorage
  useEffect(() => {
    try {
      const storedFriends = localStorage.getItem("lumina_friends");
      if (storedFriends) setFriends(JSON.parse(storedFriends));
    } catch { /* ignore */ }
    try {
      const storedRequests = localStorage.getItem("lumina_friend_requests");
      if (storedRequests) setFriendRequests(JSON.parse(storedRequests));
    } catch { /* ignore */ }
  }, []);

  const saveFriends = useCallback((data: Friend[]) => {
    setFriends(data);
    localStorage.setItem("lumina_friends", JSON.stringify(data));
  }, []);

  const saveRequests = useCallback((data: FriendRequest[]) => {
    setFriendRequests(data);
    localStorage.setItem("lumina_friend_requests", JSON.stringify(data));
  }, []);

  const addFriend = useCallback((f: Friend) => {
    setFriends(prev => {
      // 避免重複
      if (prev.some(existing => existing.name === f.name && existing.avatar === f.avatar)) return prev;
      const next = [...prev, f];
      localStorage.setItem("lumina_friends", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFriend = useCallback((id: string) => {
    setFriends(prev => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem("lumina_friends", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleBestFriend = useCallback((id: string) => {
    setFriends(prev => {
      const next = prev.map((f) =>
        f.id === id
          ? { ...f, status: (f.status === "bestFriend" ? "friend" : "bestFriend") as "friend" | "bestFriend" }
          : f
      );
      localStorage.setItem("lumina_friends", JSON.stringify(next));
      return next;
    });
  }, []);

  const addFriendRequest = useCallback((r: FriendRequest) => {
    setFriendRequests(prev => {
      const next = [...prev, r];
      localStorage.setItem("lumina_friend_requests", JSON.stringify(next));
      return next;
    });
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setFriendRequests(prev => {
      const req = prev.find((r) => r.id === id);
      if (req) {
        const newFriend: Friend = {
          id: `f${Date.now()}`,
          name: req.fromName,
          avatar: req.fromAvatar,
          status: "friend",
          addedAt: new Date().toISOString().split("T")[0],
        };
        setFriends(fp => {
          const next = [...fp, newFriend];
          localStorage.setItem("lumina_friends", JSON.stringify(next));
          return next;
        });
      }
      const next = prev.map((r) => r.id === id ? { ...r, status: "accepted" as const } : r);
      localStorage.setItem("lumina_friend_requests", JSON.stringify(next));
      return next;
    });
  }, []);

  const rejectRequest = useCallback((id: string) => {
    setFriendRequests(prev => {
      const next = prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r);
      localStorage.setItem("lumina_friend_requests", JSON.stringify(next));
      return next;
    });
  }, []);

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
