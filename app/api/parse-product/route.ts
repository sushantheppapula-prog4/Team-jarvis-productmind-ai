import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const nameExtracted = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    return NextResponse.json({
      name: nameExtracted,
      category: "",
      description: "Extracted from " + file.name + ". Please review and complete.",
      specifications: "",
      features: "",
      pricing: "",
      target_audience: "",
      target_market: "",
      competitors: "",
      planned_launch_date: "",
      product_advantages: "",
      expected_customer_needs: "",
      previous_generation_info: "",
      additional_notes: "",
    });
  } catch (error: any) {
    console.error("Error parsing product file:", error);
    return NextResponse.json({ error: "Failed to parse file." }, { status: 500 });
  }
}
