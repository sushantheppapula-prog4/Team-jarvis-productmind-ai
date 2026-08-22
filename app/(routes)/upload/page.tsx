"use client";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFeedbackFile, parseFeedbackFile, analyzeFeedback } from "./actions";
import { Button } from "@/components/ui/button";

const uploadTypes = [
  {
    type: "Interviews",
    description: "Customer interview transcripts and notes",
    icon: FileText,
  },
  {
    type: "Support Tickets",
    description: "Help desk and support conversations",
    icon: FileText,
  },
  {
    type: "Surveys",
    description: "Survey responses and feedback forms",
    icon: FileText,
  },
  {
    type: "Reviews",
    description: "Product reviews and ratings",
    icon: FileText,
  },
  {
    type: "Feature Requests",
    description: "Feature request submissions",
    icon: FileText,
  },
  {
    type: "Other",
    description: "Any other customer feedback",
    icon: FileText,
  },
];

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'parsing' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress('uploading');
    setErrorMessage(null);

    try {
      // Step 1: Upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sourceType", selectedType ?? "Other");

      const uploadResult = await uploadFeedbackFile(formData);

      // Step 2: Parse
      setProgress('parsing');
      await parseFeedbackFile(
        uploadResult.sourceId,
        uploadResult.projectId,
        uploadResult.storagePath,
        uploadResult.fileType,
        uploadResult.fileName
      );

      // Step 3: AI Analysis (generates insights & executive report)
      setProgress('analyzing');
      await analyzeFeedback(uploadResult.sourceId, uploadResult.projectId);

      setProgress('success');
      setTimeout(() => {
        router.push("/insights");
      }, 1500);

    } catch (err: any) {
      console.error("Upload pipeline failed on client:", err);
      setProgress('error');
      setErrorMessage(err.message || String(err) || "An unexpected error occurred during processing.");
    }
  };

  const isPending = progress !== 'idle' && progress !== 'success' && progress !== 'error';

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
      <div className="border-b-4 border-[#111111] pb-6 mb-12">
        <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
          Data Ingestion
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
          Select source material to begin analysis pipeline
        </p>
      </div>

      {/* Upload Types Grid */}
      <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-t-2 border-l-2 border-[#111111] mb-12">
        {uploadTypes.map((item, index) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;

          return (
            <button
              key={index}
              disabled={isPending}
              onClick={() => {
                setSelectedType(item.type);
                setFile(null);
                setProgress('idle');
                setErrorMessage(null);
              }}
              className={`text-left p-6 border-b-2 border-r-2 border-[#111111] transition-colors ${
                isSelected
                  ? "bg-[#111111] text-[#F9F9F7]"
                  : "bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]"
              } disabled:opacity-50`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">{item.type}</h3>
                  <p className={`text-xs ${isSelected ? "text-[#A3A3A3]" : "text-[#525252]"}`}>
                    {item.description}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-[#F9F9F7] flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Upload Area */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-[#111111] bg-[#E5E5E0] p-12 text-center space-y-4 mb-12"
        >
          <Upload className="h-12 w-12 text-[#111111] mx-auto opacity-50" />
          <div>
            <h3 className="font-serif text-2xl font-bold mb-2 text-[#111111]">
              Mount Source File
            </h3>
            <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mb-4">
              Supported formats: CSV, JSON, TXT, PDF
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.txt,.json,text/csv,application/pdf,text/plain,application/json"
              className="sr-only"
              disabled={isPending}
              onChange={handleFileChange}
            />
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="flex gap-4 justify-center">
                <Button
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                  size="xl"
                  className="bg-[#111111] text-[#F9F9F7] hover:bg-[#CC0000] border-none shadow-none"
                >
                  SELECT FILE
                </Button>
                <Button
                  variant="outline"
                  disabled={isPending}
                  size="xl"
                >
                  LOAD SAMPLE
                </Button>
              </div>

              {progress === 'uploading' && (
                <div className="font-mono text-xs uppercase tracking-widest text-[#111111] flex items-center justify-center gap-2 mt-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading {file?.name || "file"}...
                </div>
              )}

              {progress === 'parsing' && (
                <div className="font-mono text-xs uppercase tracking-widest text-[#111111] flex items-center justify-center gap-2 mt-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Parsing feedback data...
                </div>
              )}

              {progress === 'analyzing' && (
                <div className="font-mono text-xs uppercase tracking-widest text-[#111111] flex items-center justify-center gap-2 mt-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating AI Insights...
                </div>
              )}

              {progress === 'success' && (
                <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-2 mt-4 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> SUCCESS. REDIRECTING...
                </div>
              )}

              {progress === 'error' && (
                <div className="mt-4 border-2 border-[#CC0000] bg-[#F9F9F7] p-4 text-[#CC0000] font-mono text-xs flex flex-col items-center justify-center gap-2 max-w-md mx-auto text-center">
                  <div className="flex items-center gap-2 uppercase tracking-widest font-bold">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Analysis Failed</span>
                  </div>
                  <p className="text-xs">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <div className="border-2 border-[#111111] bg-[#F9F9F7] p-8 lg:p-12">
        <h3 className="font-serif text-2xl font-bold border-b border-[#111111] pb-4 mb-6 uppercase">Protocol Sequence</h3>
        <ol className="space-y-4 font-mono text-xs uppercase tracking-widest text-[#525252]">
          <li className="flex gap-4 items-center">
            <span className="font-black text-[#111111] text-lg bg-[#E5E5E0] px-3 py-1 border border-[#111111]">01</span>
            <span>Declare data classification type</span>
          </li>
          <li className="flex gap-4 items-center">
            <span className="font-black text-[#111111] text-lg bg-[#E5E5E0] px-3 py-1 border border-[#111111]">02</span>
            <span>Mount raw source file</span>
          </li>
          <li className="flex gap-4 items-center">
            <span className="font-black text-[#111111] text-lg bg-[#E5E5E0] px-3 py-1 border border-[#111111]">03</span>
            <span>Initialize automated extraction</span>
          </li>
          <li className="flex gap-4 items-center">
            <span className="font-black text-[#111111] text-lg bg-[#E5E5E0] px-3 py-1 border border-[#111111]">04</span>
            <span>Review generated strategic insights</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
