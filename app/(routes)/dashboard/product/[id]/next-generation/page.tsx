import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getNextGenerationReport } from "@/app/(routes)/dashboard/product/next-generation-actions";
import { NextGenerationReportView } from "@/components/product/next-generation-report";

export default async function NextGenerationPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getNextGenerationReport(product.id);
  return <NextGenerationReportView productId={product.id} productName={product.name} initialReport={report} />;
}