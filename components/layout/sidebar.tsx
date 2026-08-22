"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Target,
  MessageSquare,
  Activity,
  Zap,
  TrendingUp,
  FastForward,
  Lightbulb,
  Repeat,
  Bot,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Extract product ID if we are in a product route
  const match = pathname?.match(/\/dashboard\/product\/([^/]+)/);
  const productId = match ? match[1] : null;

  // Base navigation
  let navigation = [
    { href: "/dashboard", label: "01 OVERVIEW", icon: LayoutDashboard },
  ];

  if (productId) {
    const base = `/dashboard/product/${productId}`;
    navigation = [
      { href: "/dashboard", label: "01 OVERVIEW", icon: LayoutDashboard },
      { href: `${base}`, label: "02 PRODUCT DETAILS", icon: FileText },
      { href: `${base}/market-suggestion`, label: "03 MARKET SUGGESTION", icon: Target },
      { href: `${base}/review-report`, label: "04 REVIEW REPORT", icon: MessageSquare },
      { href: `${base}/performance`, label: "05 PERFORMANCE", icon: Activity },
      { href: `${base}/scalability`, label: "06 SCALABILITY", icon: Zap },
      { href: `${base}/improvements`, label: "07 IMPROVEMENTS", icon: TrendingUp },
      { href: `${base}/next-generation`, label: "08 NEXT GENERATION", icon: FastForward },
      { href: `${base}/new-product-suggestions`, label: "09 NEW PRODUCT SUGGESTIONS", icon: Lightbulb },
      { href: `${base}/continuous-reports`, label: "10 CONTINUOUS REPORTS", icon: Repeat },
      { href: `${base}/ai-agent`, label: "AI AGENT", icon: Bot },
    ];
  }

  return (
    <aside className="w-64 border-r-4 border-[#111111] bg-[#F9F9F7] h-screen sticky top-0 flex flex-col z-20">
      <div className="flex h-16 items-center border-b-4 border-[#111111] px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <ClyraLogoSymbol className="w-5 h-5 text-[#111111]" />
          <span className="font-serif text-xl font-black uppercase tracking-tighter text-[#111111]">
            Clyra
          </span>
        </Link>
      </div>

      <nav className="flex flex-col flex-1 p-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-200 border-b border-[#111111]",
                isActive
                  ? "bg-[#111111] text-[#F9F9F7]"
                  : "text-[#111111] hover:bg-[#E5E5E0]"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
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
