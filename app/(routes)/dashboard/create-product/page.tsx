"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/product/product-form";

export default function CreateProductPage() {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "upload" | "manual" | "form">("choose");
  const [parsedData, setParsedData] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setStep("upload");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse file");
      }

      const data = await response.json();
      setParsedData(data);
      setStep("form");
    } catch (err: any) {
      setError(err.message || "An error occurred while parsing the file.");
      setStep("choose");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
      <div className="border-b-4 border-[#111111] pb-6 mb-12 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
            Create Product
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
            Initialize a new product intelligence workspace
          </p>
        </div>
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="border-2 border-[#CC0000] bg-[#F9F9F7] p-4 flex items-center gap-3 text-sm text-[#CC0000] font-mono mb-8">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === "choose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          {/* Option A: Upload */}
          <div className="border-2 border-[#111111] bg-[#F9F9F7] p-8 flex flex-col items-center justify-center text-center hover:bg-[#111111] hover:text-[#F9F9F7] transition-all group relative cursor-pointer">
            <input 
              type="file" 
              accept=".pdf,.csv,.json,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
            />
            <Upload className="h-12 w-12 mb-6 text-[#111111] group-hover:text-[#F9F9F7]" />
            <h3 className="font-serif text-2xl font-bold mb-4">Upload Document</h3>
            <p className="font-mono text-xs uppercase tracking-widest mb-6 opacity-70">
              PDF, CSV, JSON, TXT
            </p>
            <p className="font-body text-sm px-4">
              We will automatically parse your product documentation and extract the relevant fields.
            </p>
            <div className="mt-8 border-2 border-current px-6 py-2 font-mono text-xs uppercase tracking-widest font-bold">
              Select File
            </div>
          </div>

          {/* Option B: Manual */}
          <div 
            onClick={() => { setParsedData({}); setStep("form"); }}
            className="border-2 border-[#111111] bg-[#F9F9F7] p-8 flex flex-col items-center justify-center text-center hover:bg-[#111111] hover:text-[#F9F9F7] transition-all group cursor-pointer"
          >
            <FileText className="h-12 w-12 mb-6 text-[#111111] group-hover:text-[#F9F9F7]" />
            <h3 className="font-serif text-2xl font-bold mb-4">Manual Entry</h3>
            <p className="font-mono text-xs uppercase tracking-widest mb-6 opacity-70">
              Start from scratch
            </p>
            <p className="font-body text-sm px-4">
              Enter all product details manually into our structured intelligence framework.
            </p>
            <div className="mt-8 border-2 border-current px-6 py-2 font-mono text-xs uppercase tracking-widest font-bold">
              Start Typing
            </div>
          </div>
        </div>
      )}

      {step === "upload" && (
        <div className="border-2 border-[#111111] border-dashed p-24 flex flex-col items-center justify-center bg-[#F9F9F7] max-w-4xl mx-auto mt-12">
          <div className="w-16 h-16 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mb-8"></div>
          <h3 className="font-serif text-2xl font-bold mb-2 text-[#111111]">Parsing Document</h3>
          <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">Extracting intelligence framework...</p>
        </div>
      )}

      {step === "form" && (
        <ProductForm initialData={parsedData} />
      )}
    </div>
  );
}
