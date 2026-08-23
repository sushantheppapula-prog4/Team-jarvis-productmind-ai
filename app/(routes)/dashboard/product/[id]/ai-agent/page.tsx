import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getAgentResponse } from "@/app/(routes)/dashboard/product/agent-actions";
import { AgentReportView } from "@/components/product/agent-report";

export default async function AIAgentPage({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);
  if (error || !product) return <div className="p-10 font-mono text-xs uppercase text-[#CC0000]">{error || "Product not found."}</div>;
  const report = await getAgentResponse(product.id);
  return <AgentReportView productId={product.id} productName={product.name} initialResponse={report} />;
}
