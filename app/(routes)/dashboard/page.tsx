"use client";

import { useEffect, useState } from "react";
import { Plus, PackageSearch, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; name: string; category: string | null; status: string };

export default function DashboardOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) setIsLoading(false); return; }
      const { data, error: queryError } = await supabase.from("products").select("id, name, category, status").eq("user_id", user.id).order("created_at", { ascending: false });
      if (!active) return;
      if (queryError) setError("Products are not available yet. Confirm the Supabase products table is configured.");
      else setProducts((data || []) as Product[]);
      setIsLoading(false);
    }
    void loadProducts();
    return () => { active = false; };
  }, []);

  const stats = [
    { label: "Products", value: products.length.toString() },
    { label: "Active Analyses", value: "0" },
    { label: "Latest Report", value: "None" },
    { label: "Product Health", value: "N/A" },
  ];

  return <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
    <div className="border-b-4 border-[#111111] pb-6 mb-12"><h1 className="font-serif text-5xl font-black uppercase text-[#111111]">Clyra</h1><p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">Welcome back.</p></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t-2 border-l-2 border-[#111111] mb-12">{stats.map((stat) => <div key={stat.label} className="border-b-2 border-r-2 border-[#111111] p-6 bg-[#F9F9F7]"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">{stat.label}</p><p className="font-serif text-3xl font-bold text-[#111111]">{stat.value}</p></div>)}</div>
    <div className="flex justify-between items-end border-b-2 border-[#111111] pb-4 mb-8"><h2 className="font-serif text-3xl font-bold text-[#111111]">My Products</h2><Link href="/dashboard/create-product" className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all"><Plus className="h-4 w-4" /> Create Product</Link></div>
    {error && <div className="mb-8 border-2 border-[#CC0000] p-4 flex items-center gap-3 text-sm text-[#CC0000] font-mono"><AlertCircle className="h-5 w-5" />{error}</div>}
    {isLoading ? <div className="border-2 border-[#111111] border-dashed p-12 text-center"><p className="font-mono text-xs uppercase tracking-widest text-[#525252]">Loading products...</p></div> : products.length === 0 ? <div className="border-2 border-[#111111] border-dashed p-16 flex flex-col items-center justify-center bg-[#F9F9F7]"><PackageSearch className="h-12 w-12 text-[#525252] mb-4" /><p className="font-serif text-xl font-bold text-[#111111] mb-2">No products yet.</p><p className="font-mono text-xs uppercase tracking-widest text-[#525252] mb-6 text-center max-w-sm">Upload your product details to begin analysis and generate insights.</p><Link href="/dashboard/create-product" className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all"><Plus className="h-4 w-4" /> Create Product</Link></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{products.map((product) => <Link key={product.id} href={`/dashboard/product/${product.id}`} className="group block border-2 border-[#111111] bg-[#F9F9F7] hover:bg-[#111111] hover:text-[#F9F9F7] transition-all p-6"><h3 className="font-serif text-xl font-bold mb-2">{product.name}</h3><p className="font-mono text-xs uppercase tracking-widest text-[#525252] group-hover:text-[#A3A3A3] mb-6">{product.category || "Uncategorized"}</p><div className="flex justify-between items-center border-t-2 border-[#111111] group-hover:border-[#F9F9F7] pt-4 mt-4"><span className="font-mono text-[10px] uppercase tracking-widest">Status: {product.status}</span><ArrowRight className="h-4 w-4" /></div></Link>)}</div>}
  </div>;
}
