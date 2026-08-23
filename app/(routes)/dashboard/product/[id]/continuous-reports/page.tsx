import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getIntelligence, getReportSchedule } from "@/app/(routes)/dashboard/product/intelligence-actions";
import { IntelligenceModuleView } from "@/components/product/intelligence-module";
import { ReportSchedule } from "@/components/product/report-schedule";

export default async function ContinuousReportsPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const [report, schedule] = await Promise.all([getIntelligence(params.id, "continuous"), getReportSchedule(params.id)]);
  return <><ReportSchedule productId={product.id} initialSchedule={schedule} /><IntelligenceModuleView productId={product.id} module="continuous" title="Continuous Reports" description={`Manual update desk for ${product.name} · scheduled automation not claimed`} initialReport={report} /></>;
}
