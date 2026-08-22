"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function authErrorPath(path: "/login" | "/sign-up", message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function signIn(formData: FormData) {
  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("login", rlContext);
  if (!rl.success) redirect(authErrorPath("/login", "Too many login attempts. Please try again later."));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData));

  if (error) redirect(authErrorPath("/login", error.message));

  const nextPath = String(formData.get("next") ?? "/dashboard");
  redirect(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard");
}

export async function signUp(formData: FormData) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = headersList.get("origin") ?? `${protocol}://${host}`;

  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("signup", rlContext);
  if (!rl.success) redirect(authErrorPath("/sign-up", "Too many signup attempts. Please try again later."));

  const supabase = await createClient();
  
  const { error, data } = await supabase.auth.signUp({
    ...credentials(formData),
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) redirect(authErrorPath("/sign-up", error.message));

  if (!data.session) redirect("/login?message=Check your email to confirm your account.");

  redirect("/dashboard");
}


