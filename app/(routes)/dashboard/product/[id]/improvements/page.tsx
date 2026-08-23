import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getImprovementsReport } from "@/app/(routes)/dashboard/product/improvements-actions";
import { ImprovementsReportView } from "@/components/product/improvements-report";

export default async function ImprovementsPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getImprovementsReport(product.id);
  return <ImprovementsReportView productId={product.id} productName={product.name} initialReport={report} />;
}
