import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTranslations } from "@/hooks/usePageTranslations";

/** Topnav direct-messages entry point with an unread badge. */
export default function MessagesIcon() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const timer = useRef<any>(null);

  const fetchCount = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/messages/unread_count/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (r.ok) { const d = await r.json(); setUnread(d.count || 0); }
    } catch { /* offline — ignore */ }
  }, []);

  useEffect(() => {
    fetchCount();
    timer.current = setInterval(fetchCount, 45000);
    return () => clearInterval(timer.current);
  }, [fetchCount]);

  return (
    <Button variant="ghost" size="icon" title={pt("Messages")} className="relative" onClick={() => navigate("/messages")}>
      <MessageCircle className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Button>
  );
}
