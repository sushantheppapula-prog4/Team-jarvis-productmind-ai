import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { forgotPassword } from "@/app/(auth)/actions";
import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";

type PageProps = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen bg-[#F9F9F7]">
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-sm space-y-12">
          <div className="space-y-4">
            <Link href="/" className="inline-block mb-4">
              <ClyraLogoSymbol className="h-8 w-8 text-[#111111]" />
            </Link>
            <h1 className="font-serif text-4xl font-black uppercase text-[#111111] tracking-tighter">
              Recovery
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {error && <p className="font-mono text-xs uppercase tracking-widest text-[#CC0000] border-2 border-[#CC0000] p-4">{error}</p>}
          {message && <p className="font-mono text-xs uppercase tracking-widest text-[#111111] border-2 border-[#111111] p-4 bg-[#E5E5E0]">{message}</p>}
          
          <form action={forgotPassword as any} className="space-y-6">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-widest text-[#111111] mb-2">Email</label>
              <input name="email" type="email" placeholder="Email" required className="w-full border-2 border-[#111111] bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-[#CC0000] transition-colors" />
            </div>
            <button type="submit" className="w-full border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all">
              Send Reset Link
            </button>
          </form>

          <div className="text-center border-t-2 border-[#111111] pt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden w-1/2 bg-[#111111] lg:block p-12">
        <div className="h-full w-full border-2 border-[#F9F9F7]/20 flex flex-col items-center justify-center text-[#F9F9F7] text-center p-12">
          <h2 className="font-serif text-3xl font-bold mb-4">Secure Access</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#A3A3A3] max-w-sm leading-relaxed">
            Protecting your strategic product intelligence and market research data.
          </p>
        </div>
      </div>
    </div>
  );
}
