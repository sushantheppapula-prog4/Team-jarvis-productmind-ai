"use client";

import { useState } from "react";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import { createProduct } from "@/app/(routes)/dashboard/product/actions";

interface ProductFormProps {
  initialData?: Record<string, any>;
  sourceFile?: File | null;
}

const fieldNames = [
  "name", "category", "description", "specifications", "features", "pricing",
  "target_audience", "target_market", "competitors", "planned_launch_date",
  "product_advantages", "expected_customer_needs", "previous_generation_info", "additional_notes",
] as const;

export function ProductForm({ initialData = {}, sourceFile = null }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => Object.fromEntries(fieldNames.map((field) => [field, initialData[field] || ""])));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = new FormData();
      fieldNames.forEach((field) => payload.append(field, formData[field]));
      if (sourceFile) payload.append("source_file", sourceFile, sourceFile.name);
      const result = await createProduct(payload);
      if (result?.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full border-2 border-[#111111] bg-[#F9F9F7] p-3 font-mono text-sm focus:outline-none focus:ring-0 focus:border-[#CC0000] transition-colors placeholder:text-[#A3A3A3]";
  const labelClasses = "block font-mono text-xs font-bold uppercase tracking-widest text-[#111111] mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
      {initialData.sourceFileName && (
        <div className="border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] p-5 font-mono text-xs uppercase tracking-widest">
          <p className="font-bold">Product information extracted</p>
          <p className="mt-2 opacity-75 normal-case tracking-normal">Review every field below before confirming. Source: {initialData.sourceFileName}</p>
          {initialData.fieldsNotDetected?.length > 0 && <p className="mt-2 opacity-75 normal-case tracking-normal">Not detected: {initialData.fieldsNotDetected.join(", ")}</p>}
        </div>
      )}
      {error && <div className="border-2 border-[#CC0000] bg-[#F9F9F7] p-4 flex items-center gap-3 text-sm text-[#CC0000] font-mono"><AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span></div>}

      <section>
        <h2 className="font-serif text-2xl font-bold mb-6 border-b-2 border-[#111111] pb-2">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2"><label className={labelClasses}>Product Name *</label><input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="e.g. EchoStream Pro" /></div>
          <div><label className={labelClasses}>Product Category</label><input type="text" name="category" value={formData.category} onChange={handleChange} className={inputClasses} placeholder="e.g. Consumer Electronics" /></div>
          <div><label className={labelClasses}>Planned Launch Date</label><input type="text" name="planned_launch_date" value={formData.planned_launch_date} onChange={handleChange} className={inputClasses} placeholder="e.g. Q4 2026" /></div>
          <div className="col-span-1 md:col-span-2"><label className={labelClasses}>Product Description</label><textarea name="description" value={formData.description} onChange={handleChange} className={inputClasses} rows={4} placeholder="High-level overview of the product..." /></div>
        </div>
      </section>

      <section><h2 className="font-serif text-2xl font-bold mb-6 border-b-2 border-[#111111] pb-2">Specifications & Features</h2><div className="grid grid-cols-1 gap-6">
        <div><label className={labelClasses}>Specifications</label><textarea name="specifications" value={formData.specifications} onChange={handleChange} className={inputClasses} rows={4} placeholder="Technical specs, materials, dimensions..." /></div>
        <div><label className={labelClasses}>Key Features</label><textarea name="features" value={formData.features} onChange={handleChange} className={inputClasses} rows={4} placeholder="Main selling points and functionalities..." /></div>
        <div><label className={labelClasses}>Product Advantages</label><textarea name="product_advantages" value={formData.product_advantages} onChange={handleChange} className={inputClasses} rows={3} placeholder="What makes this product better than alternatives?" /></div>
      </div></section>

      <section><h2 className="font-serif text-2xl font-bold mb-6 border-b-2 border-[#111111] pb-2">Market & Audience</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className={labelClasses}>Target Audience</label><textarea name="target_audience" value={formData.target_audience} onChange={handleChange} className={inputClasses} rows={3} placeholder="Demographics, psychographics, user personas..." /></div>
        <div><label className={labelClasses}>Target Market</label><textarea name="target_market" value={formData.target_market} onChange={handleChange} className={inputClasses} rows={3} placeholder="Geographic regions, market size, industry..." /></div>
        <div><label className={labelClasses}>Competitors</label><textarea name="competitors" value={formData.competitors} onChange={handleChange} className={inputClasses} rows={3} placeholder="Direct and indirect competitors..." /></div>
        <div><label className={labelClasses}>Expected Customer Needs</label><textarea name="expected_customer_needs" value={formData.expected_customer_needs} onChange={handleChange} className={inputClasses} rows={3} placeholder="What problems does this solve for the user?" /></div>
      </div></section>

      <section><h2 className="font-serif text-2xl font-bold mb-6 border-b-2 border-[#111111] pb-2">Additional Details</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className={labelClasses}>Pricing Strategy</label><input type="text" name="pricing" value={formData.pricing} onChange={handleChange} className={inputClasses} placeholder="e.g. $199 USD Retail" /></div>
        <div><label className={labelClasses}>Previous Gen Info</label><input type="text" name="previous_generation_info" value={formData.previous_generation_info} onChange={handleChange} className={inputClasses} placeholder="If this is a V2, what was V1?" /></div>
        <div className="col-span-1 md:col-span-2"><label className={labelClasses}>Additional Notes</label><textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} className={inputClasses} rows={3} placeholder="Any other relevant context..." /></div>
      </div></section>

      <div className="pt-8 border-t-4 border-[#111111] flex justify-end"><button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all disabled:opacity-50">{isSubmitting ? <>Saving...</> : <>Confirm & Create Product <ArrowRight className="h-4 w-4" /></>}</button></div>
    </form>
  );
}
