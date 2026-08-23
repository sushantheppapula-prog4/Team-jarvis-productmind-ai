import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getContinuousReport } from "@/app/(routes)/dashboard/product/continuous-actions";
import { getReportSchedule } from "@/app/(routes)/dashboard/product/intelligence-actions";
import { ContinuousReportView } from "@/components/product/continuous-report";
import { ReportSchedule } from "@/components/product/report-schedule";

export default async function ContinuousReportsPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const [report, schedule] = await Promise.all([getContinuousReport(product.id), getReportSchedule(product.id)]);
  return <><ReportSchedule productId={product.id} initialSchedule={schedule} /><ContinuousReportView productId={product.id} productName={product.name} initialReport={report} /></>;
}
