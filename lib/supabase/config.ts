export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("INVALID_SUPABASE_CONFIGURATION");
  }

  return { url, key };
}

export function isSupabaseConfigurationError(error: unknown) {
  return error instanceof Error && error.message === "INVALID_SUPABASE_CONFIGURATION";
}

export function getSafeAuthError(error: unknown) {
  if (isSupabaseConfigurationError(error)) {
    return "Invalid Supabase configuration.";
  }

  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Supabase connection failed. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export function getSupabaseConfigStatus() {
  return {
    urlPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publicKeyPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    geminiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
  };
}
