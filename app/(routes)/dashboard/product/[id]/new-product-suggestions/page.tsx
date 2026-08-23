import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getSuggestionsReport } from "@/app/(routes)/dashboard/product/suggestions-actions";
import { ProductSuggestionsReportView } from "@/components/product/product-suggestions-report";

export default async function NewProductSuggestionsPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getSuggestionsReport(product.id);
  return <ProductSuggestionsReportView productId={product.id} productName={product.name} initialReport={report} />;
}
