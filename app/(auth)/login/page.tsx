import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "../actions";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

type LoginPageProps = { searchParams: Promise<{ error?: string; message?: string; next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access ProductMind AI.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-primary">{message}</p>}
        
        <form action={signIn as any} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
          <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
          <Button type="submit" fullWidth>Sign in</Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-2 text-xs text-muted-foreground uppercase">
            Or continue with
          </span>
        </div>

        <GoogleAuthButton />

        <p className="text-sm text-muted-foreground">
          New to ProductMind? <a href="/sign-up">Create an account</a>
        </p>
      </div>
    </div>
  );
}
