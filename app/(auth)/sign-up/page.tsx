import Link from "next/link";
import { signUp } from "../actions";
import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";

type PageProps = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function SignUpPage({ searchParams }: PageProps) {
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
              Create Account
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">
              Initialize your intelligence workspace.
            </p>
          </div>

          {error && <p className="font-mono text-xs uppercase tracking-widest text-[#CC0000] border-2 border-[#CC0000] p-4">{error}</p>}
          {message && <p className="font-mono text-xs uppercase tracking-widest text-[#111111] border-2 border-[#111111] p-4 bg-[#E5E5E0]">{message}</p>}
          
          <form action={signUp as any} className="space-y-6">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-widest text-[#111111] mb-2">Email</label>
              <input name="email" type="email" placeholder="Email" required className="w-full border-2 border-[#111111] bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-[#CC0000] transition-colors" />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-widest text-[#111111] mb-2">Password</label>
              <input name="password" type="password" placeholder="Password" required className="w-full border-2 border-[#111111] bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-[#CC0000] transition-colors" />
            </div>

            <button type="submit" className="w-full border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all">
              Sign up
            </button>
          </form>

          <div className="text-center border-t-2 border-[#111111] pt-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252]">
              Already have an account? <Link href="/login" className="text-[#111111] hover:underline underline-offset-4 decoration-2 decoration-[#CC0000]">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="hidden w-1/2 bg-[#111111] lg:block p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />
        <div className="relative h-full w-full border-2 border-[#F9F9F7]/20 flex flex-col items-center justify-center text-[#F9F9F7] text-center p-12">
          <h2 className="font-serif text-3xl font-bold mb-4">Scale Your Strategy</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#A3A3A3] max-w-sm leading-relaxed">
            Data-backed product decisions driven by continuous customer intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
