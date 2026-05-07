"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

const UnreadCtx = React.createContext<number>(0);

export function useUnread(): number {
  return React.useContext(UnreadCtx);
}

export function UnreadProvider({
  initialCount,
  userId,
  children,
}: {
  initialCount: number;
  userId: string;
  children: React.ReactNode;
}) {
  const [count, setCount] = React.useState(initialCount);

  React.useEffect(() => {
    const supabase = createClient();

    const refetch = () => {
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null)
        .then(({ count: c }) => setCount(c ?? 0));
    };

    const channel = supabase
      .channel(`unread-${userId}`)
      // New message arrives → increment immediately
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      }, () => setCount((n) => n + 1))
      // Message marked as read → refetch real count
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      }, refetch)
      // Inbox cleared → refetch real count
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      }, refetch)
      .subscribe();

    // Resync badge count when the tab becomes visible again or the browser
    // comes back online — the WebSocket may have missed events while away.
    const handleVisibility = () => {
      if (!document.hidden) refetch();
    };
    const handleOnline = () => refetch();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, [userId]);

  return (
    <UnreadCtx.Provider value={count}>
      {children}
    </UnreadCtx.Provider>
  );
}
