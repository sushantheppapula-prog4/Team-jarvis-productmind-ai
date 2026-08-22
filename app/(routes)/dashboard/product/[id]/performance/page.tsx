import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getPerformanceContext } from "@/app/(routes)/dashboard/product/performance-actions";
import { PerformanceReportView } from "@/components/product/performance-report";

export default async function PerformancePage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const context = await getPerformanceContext(product.id);
  return <PerformanceReportView productId={product.id} productName={product.name} report={context.report} marketAvailable={context.marketAvailable} reviewAvailable={context.reviewAvailable} initialMessage={context.error} />;
}
