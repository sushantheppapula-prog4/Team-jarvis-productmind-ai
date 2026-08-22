import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getReviewReport } from "@/app/(routes)/dashboard/product/review-actions";
import { ReviewReportView } from "@/components/product/review-report";

export default async function ReviewReportPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getReviewReport(product.id);
  return <ReviewReportView productId={product.id} productName={product.name} initialReport={report} />;
}
