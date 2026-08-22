"use client";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertCircle, Filter, RefreshCw, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Insight {
  id: string;
  project_id: string;
  analysis_job_id: string | null;
  user_id: string;
  category: "feature_request" | "pain_point" | "trend" | "other";
  title: string;
  summary: string;
  confidence: number | null;
  metadata: {
    sentiment?: "positive" | "negative" | "neutral";
    is_bug?: boolean;
    sub_type?: string;
    count?: number;
  };
  created_at: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortByConfidence, setSortByConfidence] = useState(false);
  const [last7DaysOnly, setLast7DaysOnly] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadInsights() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("You must be logged in to view insights.");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("insights")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setInsights(data || []);
        }
      } catch (err: any) {
        console.error("Error fetching insights:", err);
        if (isMounted) {
          setError("Failed to load insights. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle filtering and sorting
  useEffect(() => {
    let result = [...insights];

    if (categoryFilter) {
      if (categoryFilter === "trend") {
        result = result.filter(i => i.category === "trend" || i.category === "other");
      } else {
        result = result.filter(i => i.category === categoryFilter);
      }
    }

    if (last7DaysOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(i => new Date(i.created_at) >= sevenDaysAgo);
    }

    if (sortByConfidence) {
      result.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredInsights(result);
  }, [insights, categoryFilter, sortByConfidence, last7DaysOnly]);

  const featureRequestsCount = insights.filter(i => i.category === "feature_request").length;
  const painPointsCount = insights.filter(i => i.category === "pain_point").length;
  const trendsCount = insights.filter(i => i.category === "trend" || i.category === "other").length;

  const insightCategories = [
    {
      title: "Feature Requests",
      count: featureRequestsCount,
      icon: Lightbulb,
      color: "text-[#111111]",
      filter: "feature_request",
    },
    {
      title: "Pain Points",
      count: painPointsCount,
      icon: AlertCircle,
      color: "text-[#CC0000]",
      filter: "pain_point",
    },
    {
      title: "Trends",
      count: trendsCount,
      icon: TrendingUp,
      color: "text-[#525252]",
      filter: "trend",
    },
  ];

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
      <div className="border-b-4 border-[#111111] pb-6 mb-12">
        <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
          Analysis
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
          Synthesized intelligence from connected signals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-12 border-b-2 border-[#111111] pb-6">
        <Filter className="h-5 w-5 text-[#111111]" />
        <button
          onClick={() => setCategoryFilter(null)}
          className={`border-2 border-[#111111] px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            categoryFilter === null
              ? "bg-[#111111] text-[#F9F9F7]"
              : "bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setLast7DaysOnly(prev => !prev)}
          className={`border-2 border-[#111111] px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            last7DaysOnly
              ? "bg-[#111111] text-[#F9F9F7]"
              : "bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]"
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setSortByConfidence(prev => !prev)}
          className={`border-2 border-[#111111] px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            sortByConfidence
              ? "bg-[#111111] text-[#F9F9F7]"
              : "bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]"
          }`}
        >
          Sort by Confidence
        </button>
      </div>

      {/* Insight Categories */}
      <div className="grid gap-0 md:grid-cols-3 border-t-2 border-l-2 border-[#111111] mb-12">
        {insightCategories.map((category, index) => {
          const Icon = category.icon;
          const isActive = categoryFilter === category.filter;
          return (
            <div
              key={index}
              onClick={() => setCategoryFilter(isActive ? null : category.filter)}
              className={`p-8 border-b-2 border-r-2 transition-all cursor-pointer group ${
                isActive ? "bg-[#111111] text-[#F9F9F7] border-[#111111]" : "bg-[#F9F9F7] hover:bg-[#E5E5E0] border-[#111111]"
              }`}
            >
              <div className="space-y-4">
                <Icon className={`h-8 w-8 ${isActive ? 'text-[#F9F9F7]' : category.color} opacity-70`} />
                <div>
                  <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${isActive ? 'text-[#A3A3A3]' : 'text-[#525252]'}`}>
                    {category.title}
                  </p>
                  <p className={`font-serif text-4xl font-bold ${isActive ? 'text-[#F9F9F7]' : 'text-[#111111]'}`}>
                    {category.count}
                  </p>
                </div>
                <p className={`font-mono text-xs uppercase tracking-widest flex items-center gap-2 ${isActive ? 'text-[#A3A3A3]' : 'text-[#525252] group-hover:text-[#111111]'} transition-colors`}>
                  {isActive ? "RESET FILTER" : "VIEW DETAILS"} <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights List */}
      <div className="border-2 border-[#111111] bg-[#F9F9F7] p-8 lg:p-12 mb-12">
        <h2 className="font-serif text-3xl font-bold mb-8 uppercase border-b border-[#111111] pb-4">Intelligence Feed</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-[#111111] animate-spin mx-auto mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">Loading intelligence...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-[#CC0000] flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10" />
            <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-[#111111] mx-auto mb-4 opacity-20" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">
              No intelligence parsed yet. Mount sources to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInsights.map((insight, index) => {
              const isBug = !!insight.metadata?.is_bug;
              const sentiment = insight.metadata?.sentiment;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-2 border-[#111111] bg-[#F9F9F7] p-6 hover:bg-[#E5E5E0] transition-colors relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-2xl font-bold text-[#111111]">{insight.title}</h3>
                        
                        <span className={`font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-1 border-2 ${
                          insight.category === "feature_request" ? "border-[#111111] bg-[#111111] text-[#F9F9F7]" :
                          insight.category === "pain_point" ? "border-[#CC0000] bg-[#CC0000] text-[#F9F9F7]" :
                          "border-[#111111] bg-transparent text-[#111111]"
                        }`}>
                          {insight.category === "feature_request" ? "Feature" :
                           insight.category === "pain_point" ? (isBug ? "Bug" : "Pain Point") : "Trend"}
                        </span>

                        {sentiment && (
                          <span className={`font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-1 border-2 ${
                            sentiment === "positive" ? "border-emerald-700 text-emerald-700 bg-emerald-100" :
                            sentiment === "negative" ? "border-[#CC0000] text-[#CC0000] bg-red-100" :
                            "border-[#111111] text-[#111111] bg-transparent"
                          }`}>
                            {sentiment}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm text-[#525252] leading-relaxed max-w-3xl">{insight.summary}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {insight.confidence !== null && (
                        <div className="space-y-1">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Confidence</p>
                          <p className="font-serif text-2xl font-black text-[#111111]">{Math.round(insight.confidence * 100)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] p-8 lg:p-12 space-y-4">
        <h3 className="font-serif text-2xl font-bold border-b border-[#333333] pb-4 uppercase">Field Manual</h3>
        <ul className="space-y-3 font-mono text-xs uppercase tracking-widest text-[#A3A3A3]">
          <li>• Mount diverse data types for high-fidelity synthesis</li>
          <li>• Supply metadata context for precise categorization</li>
          <li>• Validate anomalous signals manually</li>
          <li>• Deploy AI Consultant for deep-dives into specific insights</li>
        </ul>
      </div>
    </div>
  );
}
