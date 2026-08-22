import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/analysis/:path*",
    "/ai-consultant/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/insights/:path*",
    "/chat/:path*",
  ],
};
