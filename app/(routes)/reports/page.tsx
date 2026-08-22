"use client";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, AlertCircle, CheckCircle2, Award, Heart, ShieldAlert, Sparkles, AlertTriangle, HelpCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getLatestReport, generateExecutiveSummary, getProductHealthReport, getRoadmapRecommendations, shareReport, revokeShare } from "./actions";

interface ReportContent {
  title: string;
  overall_sentiment: string;
  sentiment_summary: string;
  top_pain_points: string[];
  requested_features: string[];
  key_bugs: string[];
  positive_feedback: string[];
  recommended_actions: string[];
  shared?: boolean;
  shareToken?: string | null;
}

interface HealthData {
  healthScore: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  recurringIssues: Array<{ title: string; count: number; isBug: boolean }>;
  featureTrends: Array<{ title: string; confidence: number; count: number }>;
  satisfactionSummary: string;
}

interface RoadmapItem {
  title: string;
  summary: string;
  category: string;
  confidence: number;
  count: number;
  sentiment: string;
  isBug: boolean;
  priorityScore: number;
}

interface RoadmapData {
  buildNext: RoadmapItem[];
  improve: RoadmapItem[];
  monitor: RoadmapItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"executive" | "health" | "roadmap">("executive");
  
  // Executive Summary states
  const [report, setReport] = useState<any | null>(null);
  const [isLoadingExec, setIsLoadingExec] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  // Health Report states
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Roadmap states
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharingToggling, setIsSharingToggling] = useState(false);

  // Load Executive Summary
  useEffect(() => {
    async function loadExecReport() {
      try {
        setIsLoadingExec(true);
        setExecError(null);
        const data = await getLatestReport();
        setReport(data);
      } catch (err: any) {
        console.error("Failed to load exec report:", err);
        setExecError("Could not load the latest report.");
      } finally {
        setIsLoadingExec(false);
      }
    }
    void loadExecReport();
  }, []);

  // Load Product Health Report
  useEffect(() => {
    async function loadHealthReport() {
      try {
        setIsLoadingHealth(true);
        setHealthError(null);
        const data = await getProductHealthReport();
        setHealthData(data);
      } catch (err: any) {
        console.error("Failed to load health report:", err);
        setHealthError("Could not calculate product health report.");
      } finally {
        setIsLoadingHealth(false);
      }
    }
    void loadHealthReport();
  }, [report]);

  // Load Roadmap Recommendations
  useEffect(() => {
    async function loadRoadmapData() {
      try {
        setIsLoadingRoadmap(true);
        setRoadmapError(null);
        const data = await getRoadmapRecommendations();
        setRoadmapData(data);
      } catch (err: any) {
        console.error("Failed to load roadmap details:", err);
        setRoadmapError("Could not calculate roadmap recommendations.");
      } finally {
        setIsLoadingRoadmap(false);
      }
    }
    void loadRoadmapData();
  }, [report]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setExecError(null);
      const data = await generateExecutiveSummary();
      setReport(data);
    } catch (err: any) {
      console.error("Failed to generate report:", err);
      setExecError(err.message || "Failed to generate report. Make sure you have feedback uploaded first.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleShare = async () => {
    if (!report) return;
    try {
      setIsSharingToggling(true);
      const isCurrentlyShared = !!report.content?.shared;
      let updated;
      if (isCurrentlyShared) {
        updated = await revokeShare(report.id);
      } else {
        updated = await shareReport(report.id);
      }
      setReport(updated);
    } catch (e) {
      console.error("Error toggling report sharing:", e);
    } finally {
      setIsSharingToggling(false);
    }
  };

  const copyShareLink = () => {
    if (!report || !report.content?.shareToken) return;
    const link = `${window.location.origin}/reports/share/${report.id}?token=${report.content.shareToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-500";
      case "negative":
        return "border-rose-500/20 bg-rose-500/5 text-rose-500";
      case "mixed":
        return "border-amber-500/20 bg-amber-500/5 text-amber-500";
      default:
        return "border-[#111111] bg-[#F9F9F7] text-[#525252]";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  const reportData = report?.content as ReportContent | undefined;

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)] relative">
      {/* Title Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <motion.h1 variants={itemVariants} className="font-serif text-5xl font-black uppercase text-[#111111]">
            Reports
          </motion.h1>
          <motion.p variants={itemVariants} className="text-[#525252]">
            Generate and manage comprehensive reports from your customer insights.
          </motion.p>
        </div>
        <div className="flex gap-2">
          {reportData && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-none border-2 border-[#111111] bg-[#F9F9F7] px-4 py-2.5 text-sm font-medium text-[#111111] hover:bg-[#E5E5E0] transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              {activeTab === "executive" && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-none bg-[#111111] px-4 py-2.5 text-sm font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate Summary
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Tabs Switcher */}
      <motion.div variants={itemVariants} className="border-b border-[#111111] flex gap-4">
        <button
          onClick={() => setActiveTab("executive")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "executive" ? "border-primary text-[#111111]" : "border-transparent text-[#525252] hover:text-[#111111]"
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "health" ? "border-primary text-[#111111]" : "border-transparent text-[#525252] hover:text-[#111111]"
          }`}
        >
          Product Health
        </button>
        <button
          onClick={() => setActiveTab("roadmap")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "roadmap" ? "border-primary text-[#111111]" : "border-transparent text-[#525252] hover:text-[#111111]"
          }`}
        >
          Roadmap
        </button>
      </motion.div>

      {/* ERROR PANELS */}
      {activeTab === "executive" && execError && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-none border border-[#CC0000] bg-[#CC0000]/10 p-4 flex items-center gap-3 text-sm text-[#CC0000]"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{execError}</span>
        </motion.div>
      )}

      {activeTab === "health" && healthError && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-none border border-[#CC0000] bg-[#CC0000]/10 p-4 flex items-center gap-3 text-sm text-[#CC0000]"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{healthError}</span>
        </motion.div>
      )}

      {activeTab === "roadmap" && roadmapError && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-none border border-[#CC0000] bg-[#CC0000]/10 p-4 flex items-center gap-3 text-sm text-[#CC0000]"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{roadmapError}</span>
        </motion.div>
      )}

      {/* TAB CONTENT: EXECUTIVE SUMMARY */}
      {activeTab === "executive" && (
        isLoadingExec ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-[#E5E5E0] rounded-none w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-[#E5E5E0] rounded-none" />
              <div className="h-64 bg-[#E5E5E0] rounded-none" />
            </div>
          </div>
        ) : reportData ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Sentiment Summary Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Executive Analysis</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getSentimentColor(reportData.overall_sentiment)}`}>
                  {reportData.overall_sentiment} Sentiment
                </span>
              </div>
              <p className="text-sm text-[#525252] leading-relaxed">
                {reportData.sentiment_summary}
              </p>
            </motion.div>

            {/* Main 2-column Analysis Grid */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Top Pain Points */}
              <motion.div variants={itemVariants} className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b border-[#111111] pb-2 text-[#111111]">Top Pain Points</h3>
                <ul className="space-y-3">
                  {reportData.top_pain_points.map((p, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-[#525252]">
                      <span className="text-[#111111] font-bold">{idx + 1}.</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Requested Features */}
              <motion.div variants={itemVariants} className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b border-[#111111] pb-2 text-[#111111]">Most Requested Features</h3>
                <ul className="space-y-3">
                  {reportData.requested_features.map((f, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-[#525252]">
                      <span className="text-[#111111] font-bold">★</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Key Bugs */}
              <motion.div variants={itemVariants} className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b border-[#111111] pb-2 text-[#111111]">Key Bug Issues</h3>
                <ul className="space-y-3">
                  {reportData.key_bugs.length > 0 ? (
                    reportData.key_bugs.map((b, idx) => (
                      <li key={idx} className="flex gap-2.5 text-sm text-[#525252]">
                        <span className="text-[#CC0000] font-bold">!</span>
                        <span>{b}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#525252]">No bug reports identified.</li>
                  )}
                </ul>
              </motion.div>

              {/* Positive Feedback */}
              <motion.div variants={itemVariants} className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b border-[#111111] pb-2 text-[#111111]">Positive Signals</h3>
                <ul className="space-y-3">
                  {reportData.positive_feedback.map((p, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-[#525252]">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Recommended Next Actions */}
            <motion.div
              variants={itemVariants}
              className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-[#111111] pb-2">
                <Award className="h-5 w-5 text-[#111111]" />
                <h3 className="font-semibold text-lg text-[#111111]">Recommended Next Actions</h3>
              </div>
              <ul className="space-y-3">
                {reportData.recommended_actions.map((act, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-sm text-[#525252]">
                    <CheckCircle2 className="h-4 w-4 text-[#111111] flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-12 text-center"
          >
            <BarChart3 className="h-12 w-12 text-[#525252] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Executive Summary Yet</h2>
            <p className="text-[#525252] mb-6 max-w-sm mx-auto">
              Compile customer feedback files and run analysis insights first to compose your summary.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-none bg-[#111111] px-6 py-2.5 text-sm font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Summary...
                </span>
              ) : (
                "Generate Executive Summary"
              )}
            </button>
          </motion.div>
        )
      )}

      {/* TAB CONTENT: PRODUCT HEALTH */}
      {activeTab === "health" && (
        isLoadingHealth ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="h-32 bg-[#E5E5E0] rounded-none" />
              <div className="h-32 bg-[#E5E5E0] rounded-none md:col-span-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-[#E5E5E0] rounded-none" />
              <div className="h-64 bg-[#E5E5E0] rounded-none" />
            </div>
          </div>
        ) : healthData ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Top Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Score Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 flex flex-col items-center justify-center text-center space-y-2"
              >
                <Heart className="h-8 w-8 text-[#111111] animate-pulse" />
                <span className="text-sm font-medium text-[#525252]">Product Health Score</span>
                <div className={`text-4xl font-extrabold px-4 py-1.5 rounded-full border ${getHealthScoreColor(healthData.healthScore)}`}>
                  {healthData.healthScore}<span className="text-lg font-medium opacity-70">/100</span>
                </div>
              </motion.div>

              {/* Sentiment Chart Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 md:col-span-2 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Sentiment Distribution</h3>
                  <p className="text-xs text-[#525252]">{healthData.satisfactionSummary}</p>
                </div>
                
                {/* Horizontal simple stacked percentage chart */}
                <div className="space-y-2.5">
                  <div className="h-4 w-full flex rounded-full overflow-hidden bg-[#E5E5E0]">
                    <div style={{ width: `${healthData.positivePct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Positive: ${healthData.positivePct}%`} />
                    <div style={{ width: `${healthData.neutralPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Neutral: ${healthData.neutralPct}%`} />
                    <div style={{ width: `${healthData.negativePct}%` }} className="bg-rose-500 transition-all duration-500" title={`Negative: ${healthData.negativePct}%`} />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-[#525252]">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Positive ({healthData.positivePct}%)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Neutral ({healthData.neutralPct}%)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Negative ({healthData.negativePct}%)</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* List Details Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recurring Issues */}
              <motion.div
                variants={itemVariants}
                className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-[#111111] pb-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  <h3 className="font-semibold text-lg text-[#111111]">Top Recurring Issues</h3>
                </div>
                <ul className="space-y-3">
                  {healthData.recurringIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 rounded-none bg-[#E5E5E0]/30 border-2 border-[#111111]/50 text-sm">
                      <span className="font-medium text-[#111111] truncate pr-2">{issue.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        issue.isBug ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {issue.count} Report{issue.count > 1 ? "s" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Feature Request Trends */}
              <motion.div
                variants={itemVariants}
                className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-[#111111] pb-2">
                  <Sparkles className="h-5 w-5 text-[#111111]" />
                  <h3 className="font-semibold text-lg text-[#111111]">Feature Demand & Trends</h3>
                </div>
                <ul className="space-y-3">
                  {healthData.featureTrends.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 rounded-none bg-[#E5E5E0]/30 border-2 border-[#111111]/50 text-sm">
                      <span className="font-medium text-[#111111] truncate pr-2">{feature.title}</span>
                      <span className="text-[10px] font-semibold text-[#525252] flex items-center gap-1.5">
                        <span className="text-[#111111] font-bold">★</span>
                        {(feature.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-12 text-center"
          >
            <BarChart3 className="h-12 w-12 text-[#525252] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Health Data Available</h2>
            <p className="text-[#525252] mb-4 max-w-sm mx-auto">
              Please analyze your uploads first to calculate satisfaction and recurring metrics.
            </p>
          </motion.div>
        )
      )}

      {/* TAB CONTENT: ROADMAP */}
      {activeTab === "roadmap" && (
        isLoadingRoadmap ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="h-80 bg-[#E5E5E0] rounded-none" />
              <div className="h-80 bg-[#E5E5E0] rounded-none" />
              <div className="h-80 bg-[#E5E5E0] rounded-none" />
            </div>
          </div>
        ) : roadmapData ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-3"
          >
            {/* Column 1: Build Next */}
            <motion.div
              variants={itemVariants}
              className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-5 flex flex-col space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-[#111111] pb-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold text-lg text-[#111111]">Build Next</h3>
                <span className="text-[10px] ml-auto bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">High Priority</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[60vh] pr-1.5">
                {roadmapData.buildNext.length > 0 ? (
                  roadmapData.buildNext.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-none border border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/10 transition-colors space-y-2">
                      <h4 className="font-bold text-[#111111] text-sm flex justify-between gap-1 items-start">
                        {item.title}
                        {item.isBug && (
                          <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1 rounded-sm uppercase tracking-wide flex-shrink-0 mt-0.5">Bug</span>
                        )}
                      </h4>
                      <p className="text-xs text-[#525252] leading-relaxed">{item.summary}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-rose-500/10">
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Score: {item.priorityScore.toFixed(0)}
                        </span>
                        <span className="text-[9px] text-[#525252] font-bold">•</span>
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#525252] text-center py-8">No high priority features logged.</p>
                )}
              </div>
            </motion.div>

            {/* Column 2: Improve */}
            <motion.div
              variants={itemVariants}
              className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-5 flex flex-col space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-[#111111] pb-2.5">
                <Sparkles className="h-5 w-5 text-[#111111]" />
                <h3 className="font-semibold text-lg text-[#111111]">Improve</h3>
                <span className="text-[10px] ml-auto bg-[#111111]/10 border border-primary/20 text-[#111111] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Medium</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[60vh] pr-1.5">
                {roadmapData.improve.length > 0 ? (
                  roadmapData.improve.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-none border border-primary/15 bg-[#111111]/5 hover:bg-[#111111]/10 transition-colors space-y-2">
                      <h4 className="font-bold text-[#111111] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#525252] leading-relaxed">{item.summary}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-primary/10">
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Score: {item.priorityScore.toFixed(0)}
                        </span>
                        <span className="text-[9px] text-[#525252] font-bold">•</span>
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#525252] text-center py-8">No refinements queued.</p>
                )}
              </div>
            </motion.div>

            {/* Column 3: Monitor */}
            <motion.div
              variants={itemVariants}
              className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-5 flex flex-col space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-[#111111] pb-2.5">
                <HelpCircle className="h-5 w-5 text-[#525252]" />
                <h3 className="font-semibold text-lg text-[#111111]">Monitor</h3>
                <span className="text-[10px] ml-auto bg-[#E5E5E0] border-2 border-[#111111] text-[#525252] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Low</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[60vh] pr-1.5">
                {roadmapData.monitor.length > 0 ? (
                  roadmapData.monitor.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/20 hover:bg-[#E5E5E0]/30 transition-colors space-y-2">
                      <h4 className="font-bold text-[#111111] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#525252] leading-relaxed">{item.summary}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#111111]">
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Score: {item.priorityScore.toFixed(0)}
                        </span>
                        <span className="text-[9px] text-[#525252] font-bold">•</span>
                        <span className="text-[9px] font-semibold text-[#525252] uppercase tracking-wide">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#525252] text-center py-8">No general items to monitor.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-12 text-center"
          >
            <BarChart3 className="h-12 w-12 text-[#525252] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Roadmap Suggestions</h2>
            <p className="text-[#525252] mb-4 max-w-sm mx-auto">
              Please analyze your uploads first to dynamically score roadmap recommendations.
            </p>
          </motion.div>
        )
      )}

      {/* Share Report Modal */}
      {isShareModalOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F9F7]/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-[#111111]">Share Executive Summary</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-[#525252] hover:text-[#111111] text-sm font-semibold transition-colors p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Public Link Sharing</p>
                  <p className="text-xs text-[#525252]">Anyone with this secure link can read the report.</p>
                </div>
                <button
                  onClick={handleToggleShare}
                  disabled={isSharingToggling}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    report.content?.shared ? "bg-[#111111]" : "bg-[#E5E5E0]"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`bg-[#F9F9F7] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      report.content?.shared ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {report.content?.shared ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Secure Access Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/reports/share/${report.id}?token=${report.content.shareToken}`}
                      className="flex-1 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/50 px-3 py-1.5 text-xs text-[#525252] select-all focus:outline-none"
                    />
                    <button
                      onClick={copyShareLink}
                      className="rounded-none bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-500 font-semibold">✓ Link is active and secure.</p>
                </div>
              ) : (
                <div className="rounded-none border border-dashed border-[#111111] p-4 text-center text-xs text-[#525252]">
                  Link sharing is currently disabled. Toggle the switch to generate a secure shared URL.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0] px-4 py-2 text-sm font-medium text-[#111111] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
