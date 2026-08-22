"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentPlan(): Promise<"free" | "pro" | "team"> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  return user.user_metadata?.plan || "free";
}

export async function updateSubscriptionPlan(plan: "free" | "pro" | "team") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized.");

  const { data, error } = await supabase.auth.updateUser({
    data: { plan }
  });

  if (error) throw error;
  return data.user.user_metadata?.plan || "free";
}
