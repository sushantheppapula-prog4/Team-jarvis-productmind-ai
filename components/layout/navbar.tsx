"use client";
import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setMounted(true);
    setDateStr(new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="border-b-4 border-[#111111] bg-[#F9F9F7]">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-[#111111]">
          {dateStr}
        </div>

        <div className="flex items-center">
          <button type="button" aria-label="Notifications" className="h-16 px-4 border-l border-r border-[#111111] hover:bg-[#E5E5E0] transition-colors flex items-center justify-center">
            <Bell className="h-5 w-5 text-[#111111]" />
          </button>

          <button type="button" aria-label={user ? `Signed in as ${user.email}` : "Signed out"} className="h-16 px-4 border-r border-[#111111] hover:bg-[#E5E5E0] transition-colors flex items-center justify-center">
            <User className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
      </div>
    </nav>
  );
}
