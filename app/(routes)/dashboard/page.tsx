"use client";
import { motion } from "framer-motion";
import { BarChart3, Upload, MessageSquare, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const [statValues, setStatValues] = useState({
    uploads: "0",
    insights: "0",
    reports: "0",
    growth: "+0%",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch counts from Supabase concurrently
        const [
          { count: uploadsCount, error: uploadsError },
          { count: insightsCount, error: insightsError },
          { count: reportsCount, error: reportsError },
        ] = await Promise.all([
          supabase.from("feedback_sources").select("*", { count: "exact", head: true }),
          supabase.from("insights").select("*", { count: "exact", head: true }),
          supabase.from("reports").select("*", { count: "exact", head: true }),
        ]);

        if (uploadsError) throw uploadsError;
        if (insightsError) throw insightsError;
        if (reportsError) throw reportsError;

        // Calculate growth this month based on feedback sources uploaded in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: recentUploadsCount, error: recentError } = await supabase
          .from("feedback_sources")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());

        if (recentError) throw recentError;

        const total = uploadsCount || 0;
        const recent = recentUploadsCount || 0;
        const previous = total - recent;

        let growthString = "+0%";
        if (previous > 0) {
          const growthPct = Math.round((recent / previous) * 100);
          growthString = `+${growthPct}%`;
        } else if (recent > 0) {
          growthString = `+100%`;
        }

        if (isMounted) {
          setStatValues({
            uploads: String(total),
            insights: String(insightsCount || 0),
            reports: String(reportsCount || 0),
            growth: growthString,
          });
        }
      } catch (err: any) {
        console.error("Error loading dashboard statistics:", err);
        if (isMounted) {
          setError("Unable to load real-time statistics.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: "Uploads", value: statValues.uploads },
    { label: "Insights", value: statValues.insights },
    { label: "Reports", value: statValues.reports },
    { label: "Growth", value: statValues.growth },
  ];

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
      <div className="border-b-4 border-[#111111] pb-6 mb-12">
        <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
          Dashboard
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
          Latest intelligence metrics and actions
        </p>
      </div>

      {/* Error alert if fetch failed */}
      {error && (
        <div className="border-2 border-[#CC0000] bg-[#F9F9F7] p-4 flex items-center gap-3 text-sm text-[#CC0000] font-mono mb-8">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t-2 border-l-2 border-[#111111] mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="border-b-2 border-r-2 border-[#111111] p-6 bg-[#F9F9F7] hover:bg-[#E5E5E0] transition-colors"
          >
            {isLoading ? (
              <div className="space-y-3 w-full">
                <div className="h-4 w-24 bg-[#E5E5E0] animate-pulse" />
                <div className="h-8 w-16 bg-[#111111] opacity-20 animate-pulse animate-delay-150" />
              </div>
            ) : (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">{stat.label}</p>
                <p className="font-serif text-4xl font-bold text-[#111111]">
                  {stat.value}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-8 border-2 border-[#111111] p-8 lg:p-12 bg-[#111111] text-[#F9F9F7]">
          <h2 className="font-serif text-3xl font-bold mb-4">Command Center</h2>
          <p className="font-body text-base leading-relaxed text-[#A3A3A3] mb-8 max-w-lg">
            Your intelligence workspace is ready. Upload raw customer interviews, query the AI consultant for strategic alignments, or export executive summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 border border-[#F9F9F7] bg-[#F9F9F7] text-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#F9F9F7] transition-all"
            >
              Upload Data <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ai-consultant"
              className="inline-flex items-center justify-center gap-2 border border-[#F9F9F7] bg-transparent text-[#F9F9F7] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#F9F9F7] hover:text-[#111111] transition-all"
            >
              Consult AI
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 border-2 border-[#111111] p-8 bg-[#F9F9F7]">
          <h3 className="font-serif text-xl font-bold mb-6 border-b border-[#111111] pb-4">Shortcuts</h3>
          <nav className="space-y-4 flex flex-col font-mono text-xs font-bold uppercase tracking-widest">
            <Link
              href="/upload"
              className="flex items-center gap-2 text-[#111111] hover:text-[#CC0000] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all"
            >
              <Upload className="h-4 w-4" /> Upload Sources
            </Link>
            <Link
              href="/analysis"
              className="flex items-center gap-2 text-[#111111] hover:text-[#CC0000] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all"
            >
              <TrendingUp className="h-4 w-4" /> View Analysis
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-2 text-[#111111] hover:text-[#CC0000] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all"
            >
              <BarChart3 className="h-4 w-4" /> Generate Report
            </Link>
            <Link
              href="/ai-consultant"
              className="flex items-center gap-2 text-[#111111] hover:text-[#CC0000] hover:underline decoration-2 decoration-[#CC0000] underline-offset-4 transition-all"
            >
              <MessageSquare className="h-4 w-4" /> AI Consultant
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
