import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getIntelligence } from "@/app/(routes)/dashboard/product/intelligence-actions";
import { IntelligenceModuleView } from "@/components/product/intelligence-module";

export default async function NextGenerationPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getIntelligence(params.id, "next-generation");
  return <IntelligenceModuleView productId={product.id} module="next-generation" title="Next Generation" description={`Design desk for the next version of ${product.name}`} initialReport={report} />;
}