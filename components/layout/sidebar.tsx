"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/analysis", label: "Analysis", icon: Lightbulb },
  { href: "/ai-consultant", label: "AI Consultant", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 border-r-4 border-[#111111] bg-[#F9F9F7] h-screen sticky top-0 flex flex-col">
      <div className="flex h-16 items-center border-b-4 border-[#111111] px-6">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-black uppercase tracking-tighter text-[#111111]">
            ProductMind
          </span>
        </div>
      </div>
      <nav className="flex flex-col flex-1 p-0">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 border-b border-[#111111]",
                isActive
                  ? "bg-[#111111] text-[#F9F9F7]"
                  : "text-[#111111] hover:bg-[#E5E5E0]"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-0 border-t-4 border-[#111111]">
        <Button
          variant="ghost"
          size="xl"
          className="w-full justify-start rounded-none font-mono text-xs font-bold uppercase tracking-widest border-none text-[#111111] hover:bg-[#CC0000] hover:text-[#F9F9F7]"
          onClick={() => void signOut()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
