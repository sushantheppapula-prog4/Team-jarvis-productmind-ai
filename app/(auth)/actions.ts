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

function authErrorPath(path: string, message: string) {
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



export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = headersList.get("origin") ?? `${protocol}://${host}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) redirect(authErrorPath("/login", error?.message || "Unable to start Google sign-in."));
  redirect(data.url);
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = headersList.get("origin") ?? `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) redirect(authErrorPath("/forgot-password", error.message));
  redirect("/forgot-password?message=Check your email for the reset link.");
}

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) redirect(authErrorPath("/reset-password", error.message));
  redirect("/login?message=Password updated successfully.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
