
import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t-4 border-[#111111] bg-[#F9F9F7]">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:grid-cols-6 border-b border-[#111111] pb-12">
          {/* Logo & Info column */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3 space-y-4">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-2xl font-black tracking-tighter text-[#111111] uppercase">
                ProductMind
              </span>
            </Link>
            <p className="text-sm font-serif text-[#111111] max-w-xs leading-relaxed">
              Connecting customer signals to actionable product strategy roadmaps instantly.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-all">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#111111]">Product</h4>
            <ul className="mt-6 space-y-4 text-sm font-sans">
              <li>
                <a href="#features" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#111111]">Resources</h4>
            <ul className="mt-6 space-y-4 text-sm font-sans">
              <li>
                <a href="#faq" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  API Status
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#111111]">Company</h4>
            <ul className="mt-6 space-y-4 text-sm font-sans">
              <li>
                <a href="#" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-[#111111] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-[#111111]">
            &copy; {new Date().getFullYear()} ProductMind AI.
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-[#111111]">
            Edition: Vol 1.0 | Printed in Global
          </p>
        </div>
      </div>
    </footer>
  );
}
