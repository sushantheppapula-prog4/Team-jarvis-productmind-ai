
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const navLinks = [
    { label: "FEATURES", href: "#features" },
    { label: "PRICING", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F9F7]">
      {/* Top Edition Metadata Line */}
      <div className="border-b border-[#111111] py-1 text-center font-mono text-[10px] uppercase tracking-widest text-[#111111] hidden md:block">
        Vol. 1 | {dateStr} | Global Edition
      </div>
      
      <div className="border-b-4 border-[#111111] transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="font-serif text-3xl font-black tracking-tighter text-[#111111] uppercase">
              ProductMind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-xs font-semibold uppercase tracking-widest text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="font-mono text-xs font-semibold uppercase tracking-widest text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all">
              Log In
            </Link>

            <Link href="/dashboard">
              <button className="bg-[#111111] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-white hover:text-[#111111] border border-transparent hover:border-[#111111] min-h-[44px]">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-11 w-11 items-center justify-center border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b-4 border-[#111111] bg-[#F9F9F7] px-4 py-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-sm font-semibold uppercase tracking-widest text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-[#111111] pt-4 flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-sm font-semibold uppercase tracking-widest text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4"
                >
                  Log In
                </Link>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                  <button className="w-full bg-[#111111] border border-[#111111] py-3 font-mono text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-white hover:text-[#111111]">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
