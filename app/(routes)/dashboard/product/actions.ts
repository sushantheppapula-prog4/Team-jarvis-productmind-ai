"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const fields = [
  "name",
  "category",
  "description",
  "specifications",
  "features",
  "pricing",
  "target_audience",
  "target_market",
  "competitors",
  "planned_launch_date",
  "product_advantages",
  "expected_customer_needs",
  "previous_generation_info",
  "additional_notes",
] as const;

function readProduct(formData: FormData) {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "").trim() || null]));
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to create a product." };

  const product = readProduct(formData);
  if (!product.name) return { error: "Product name is required." };

  const { data: saved, error } = await supabase
    .from("products")
    .insert({ ...product, user_id: user.id, status: "ready_for_analysis" })
    .select("*")
    .single();
  if (error || !saved) return { error: "Unable to save the product. Confirm the products table is configured." };

  const sourceFile = formData.get("source_file");
  if (sourceFile instanceof File && sourceFile.size > 0) {
    const safeName = sourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${user.id}/${saved.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("product-files")
      .upload(storagePath, Buffer.from(await sourceFile.arrayBuffer()), {
        contentType: sourceFile.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      await supabase.from("products").delete().eq("id", saved.id);
      return { error: "The product was not saved because the source file could not be stored." };
    }
    const { error: fileError } = await supabase.from("product_files").insert({
      product_id: saved.id,
      user_id: user.id,
      file_name: sourceFile.name,
      storage_path: storagePath,
      file_type: sourceFile.type || "application/octet-stream",
    });
    if (fileError) {
      await supabase.storage.from("product-files").remove([storagePath]);
      await supabase.from("products").delete().eq("id", saved.id);
      return { error: "The product was not saved because its file metadata could not be stored." };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/product/${saved.id}`);
  redirect(`/dashboard/product/${saved.id}`);
}

export async function getProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { product: null, error: "You must be logged in to view this product." };
  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  return { product: data, error: error ? "Unable to load this product." : null };
}

export async function queueProductAnalysis(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to analyze a product." };
  const { data: product } = await supabase.from("products").select("id").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { data: job, error } = await supabase.from("product_analysis_jobs").insert({ product_id: productId, user_id: user.id, status: "queued" }).select("id, status").single();
  if (error || !job) return { error: "Unable to queue product analysis." };
  await supabase.from("products").update({ status: "analysis_queued", updated_at: new Date().toISOString() }).eq("id", productId).eq("user_id", user.id);
  revalidatePath(`/dashboard/product/${productId}`);
  return { job };
}
