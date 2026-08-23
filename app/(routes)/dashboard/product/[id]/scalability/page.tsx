import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getScalabilityReport } from "@/app/(routes)/dashboard/product/scalability-actions";
import { ScalabilityReportView } from "@/components/product/scalability-report";

export default async function ScalabilityPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getScalabilityReport(product.id);
  return <ScalabilityReportView productId={product.id} productName={product.name} initialReport={report} />;
}
