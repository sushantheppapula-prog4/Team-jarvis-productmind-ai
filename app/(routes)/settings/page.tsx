"use client";
import { motion } from "framer-motion";
import { Settings, Bell, Lock, User, Palette, CreditCard, CheckCircle2, Loader2, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentPlan, updateSubscriptionPlan } from "./actions";
import { getTelemetryAnalytics } from "@/lib/analytics";

const settingsSections = [
  {
    icon: User,
    title: "Account",
    description: "Manage your account information",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Control how you receive updates",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Manage passwords and permissions",
  },
  {
    icon: Palette,
    title: "Preferences",
    description: "Customize your experience",
  },
];

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

export default function SettingsPage() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "team">("free");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<string | null>(null);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);

  // Telemetry states
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoadingPlan(true);
        const plan = await getCurrentPlan();
        setCurrentPlan(plan);
      } catch (e) {
        console.error("Failed to load subscription plan:", e);
      } finally {
        setIsLoadingPlan(false);
      }
    }
    void loadPlan();
  }, []);

  const handleUpgrade = async (plan: "free" | "pro" | "team") => {
    try {
      setIsUpdatingPlan(plan);
      setBillingMessage(null);
      
      // Simulate connection/checkout redirect with payment provider
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const newPlan = await updateSubscriptionPlan(plan);
      setCurrentPlan(newPlan);
      setBillingMessage(`Successfully subscribed to the ${plan.toUpperCase()} plan! billing refreshed.`);
    } catch (e) {
      console.error("Checkout failed:", e);
      setBillingMessage("Payment processing failed. Please try again.");
    } finally {
      setIsUpdatingPlan(null);
    }
  };

  const handleOpenAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      setIsAnalyticsModalOpen(true);
      const data = await getTelemetryAnalytics();
      setAnalyticsData(data);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <motion.h1 variants={itemVariants} className="font-serif text-5xl font-black uppercase text-[#111111]">
          Settings
        </motion.h1>
        <motion.p variants={itemVariants} className="text-[#525252]">
          Manage your account, billing subscription status, and platform configuration.
        </motion.p>
      </motion.div>

      {/* Subscription & Billing Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-8 space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#111111]" />
            Subscription & Billing
          </h2>
          <p className="text-sm text-[#525252] mt-1">
            Current status: {isLoadingPlan ? "Loading..." : <span className="font-semibold uppercase text-[#111111]">{currentPlan} Plan</span>}
          </p>
        </div>

        {billingMessage && (
          <div className="rounded-none border border-primary/20 bg-[#111111]/5 p-4 text-xs text-[#111111] font-medium">
            {billingMessage}
          </div>
        )}

        {/* Pricing Cards Comparison */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <div className={`p-5 rounded-none border text-left flex flex-col justify-between h-80 transition-all ${
            currentPlan === "free" ? "border-primary bg-[#111111]/5 shadow-md" : "border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0]/30"
          }`}>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base text-[#111111]">Free Tier</h3>
                <p className="text-2xl font-extrabold text-[#111111] mt-1">$0<span className="text-xs font-normal text-[#525252]"> / month</span></p>
              </div>
              <ul className="space-y-2 text-xs text-[#525252]">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Basic RAG File searches</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Local analysis fallback</li>
                <li className="flex items-center gap-1.5 text-[#525252]/50 line-through">Gemini AI strategy consultant</li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("free")}
              disabled={currentPlan === "free" || isUpdatingPlan !== null}
              className="w-full rounded-none border-2 border-[#111111] bg-[#F9F9F7] py-2 text-xs font-semibold hover:bg-[#E5E5E0] transition-colors disabled:opacity-50"
            >
              {currentPlan === "free" ? "Current Active" : "Downgrade"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`p-5 rounded-none border text-left flex flex-col justify-between h-80 transition-all relative ${
            currentPlan === "pro" ? "border-primary bg-[#111111]/5 shadow-md" : "border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0]/30"
          }`}>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base text-[#111111] flex items-center gap-1.5">
                  Pro Plan
                  <span className="text-[9px] bg-[#111111] text-[#F9F9F7] font-bold px-1.5 py-0.5 rounded-none-sm uppercase tracking-wide">Popular</span>
                </h3>
                <p className="text-2xl font-extrabold text-[#111111] mt-1">$49<span className="text-xs font-normal text-[#525252]"> / month</span></p>
              </div>
              <ul className="space-y-2 text-xs text-[#525252]">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Dynamic Gemini AI strategy</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Unlimited shared reports</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Custom roadmap suggestions</li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={currentPlan === "pro" || isUpdatingPlan !== null}
              className="w-full rounded-none bg-[#111111] py-2 text-xs font-semibold text-[#F9F9F7] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdatingPlan === "pro" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {currentPlan === "pro" ? "Current Active" : "Upgrade via Stripe"}
            </button>
          </div>

          {/* Team Plan */}
          <div className={`p-5 rounded-none border text-left flex flex-col justify-between h-80 transition-all ${
            currentPlan === "team" ? "border-primary bg-[#111111]/5 shadow-md" : "border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0]/30"
          }`}>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base text-[#111111]">Team Plan</h3>
                <p className="text-2xl font-extrabold text-[#111111] mt-1">$149<span className="text-xs font-normal text-[#525252]"> / month</span></p>
              </div>
              <ul className="space-y-2 text-xs text-[#525252]">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Collaborative project workspaces</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Priority API rate limits</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" /> Dedicated fine-tuned RAG models</li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("team")}
              disabled={currentPlan === "team" || isUpdatingPlan !== null}
              className="w-full rounded-none border-2 border-[#111111] bg-[#F9F9F7] py-2 text-xs font-semibold hover:bg-[#E5E5E0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdatingPlan === "team" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {currentPlan === "team" ? "Current Active" : "Upgrade via Stripe"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account Settings Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Admin Analytics Card */}
        <motion.button
          variants={itemVariants}
          onClick={handleOpenAnalytics}
          className="text-left rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-start gap-4">
            <BarChart3 className="h-6 w-6 text-[#111111] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#111111]">
                Admin Analytics
              </h3>
              <p className="text-sm text-[#525252] mt-1">
                View telemetry logs and application usage metrics
              </p>
              <p className="text-xs text-[#111111] group-hover:underline transition-colors mt-3">
                View Telemetry →
              </p>
            </div>
          </div>
        </motion.button>

        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={index}
              variants={itemVariants}
              className="text-left rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <Icon className="h-6 w-6 text-[#111111] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#111111]">
                    {section.title}
                  </h3>
                  <p className="text-sm text-[#525252] mt-1">
                    {section.description}
                  </p>
                  <p className="text-xs text-[#111111] group-hover:underline transition-colors mt-3">
                    Manage →
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* API Settings */}
      <motion.div
        variants={itemVariants}
        className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-8 space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Settings
          </h2>
          <p className="text-sm text-[#525252] mt-1">
            Manage your API keys and integrations
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#111111]">
              API Key
            </label>
            <div className="flex gap-3 mt-2">
              <input
                type="password"
                placeholder="sk-..."
                className="flex-1 rounded-none border-2 border-[#111111] bg-[#F9F9F7] px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#E5E5E0] transition-colors">
                Copy
              </button>
            </div>
          </div>

          <button className="rounded-none bg-[#111111] px-4 py-2 text-sm font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity">
            Generate New Key
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={itemVariants}
        className="rounded-none border border-[#CC0000]/30 bg-[#F9F9F7] p-8 space-y-4"
      >
        <h2 className="text-lg font-semibold text-[#CC0000]">Danger Zone</h2>
        <p className="text-sm text-[#525252]">
          These actions cannot be undone.
        </p>
        <button className="rounded-none border border-[#CC0000] bg-[#F9F9F7] px-4 py-2 text-sm font-medium text-[#CC0000] hover:bg-[#CC0000]/10 transition-colors">
          Delete Account
        </button>
      </motion.div>

      {/* Admin Analytics Modal */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F9F7]/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#111111]" />
                Admin Analytics Telemetry
              </h3>
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="text-[#525252] hover:text-[#111111] text-sm font-semibold transition-colors p-1"
                aria-label="Close analytics"
              >
                ✕
              </button>
            </div>

            {isLoadingAnalytics ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
              </div>
            ) : analyticsData ? (
              <div className="space-y-4">
                {/* Summary Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/30 text-center">
                    <span className="text-[10px] text-[#525252] uppercase font-bold tracking-wider">File Uploads</span>
                    <p className="text-xl font-bold text-[#111111] mt-0.5">{analyticsData.summary.fileUploads}</p>
                  </div>
                  <div className="p-3 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/30 text-center">
                    <span className="text-[10px] text-[#525252] uppercase font-bold tracking-wider">AI Queries</span>
                    <p className="text-xl font-bold text-[#111111] mt-0.5">{analyticsData.summary.aiRequests}</p>
                  </div>
                  <div className="p-3 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/30 text-center">
                    <span className="text-[10px] text-[#525252] uppercase font-bold tracking-wider">Reports Gen</span>
                    <p className="text-xl font-bold text-[#111111] mt-0.5">{analyticsData.summary.reportGenerations}</p>
                  </div>
                  <div className="p-3 rounded-none border-2 border-[#111111] bg-[#E5E5E0]/30 text-center">
                    <span className="text-[10px] text-[#525252] uppercase font-bold tracking-wider">Errors Logged</span>
                    <p className="text-xl font-bold text-[#111111] mt-0.5">{analyticsData.summary.errors}</p>
                  </div>
                </div>

                {/* Event Logs List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Recent Activity Logs</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border-2 border-[#111111] rounded-none p-2.5 bg-[#E5E5E0]/10">
                    {analyticsData.recentEvents.map((evt: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] p-1.5 border-b border-[#111111]/30 last:border-0">
                        <span className="font-semibold uppercase text-[#111111]">{evt.type.replace("_", " ")}</span>
                        <span className="text-[#525252]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#525252] text-center py-6">Could not load analytics telemetry.</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
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
