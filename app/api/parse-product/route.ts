import { NextRequest, NextResponse } from "next/server";
type ProductData = {
  name: string;
  category: string;
  description: string;
  specifications: string;
  features: string;
  pricing: string;
  target_audience: string;
  target_market: string;
  competitors: string;
  planned_launch_date: string;
  product_advantages: string;
  expected_customer_needs: string;
  previous_generation_info: string;
  additional_notes: string;
};

const EMPTY_PRODUCT: ProductData = {
  name: "",
  category: "",
  description: "",
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
};

const FIELD_ALIASES: Record<keyof ProductData, string[]> = {
  name: ["product name", "product", "name", "title"],
  category: ["category", "product category", "industry"],
  description: ["description", "overview", "product description", "summary"],
  specifications: ["specifications", "specification", "specs", "technical specifications"],
  features: ["features", "key features", "functionalities", "functionality"],
  pricing: ["pricing", "price", "pricing strategy", "cost"],
  target_audience: ["target audience", "audience", "customer segment", "users"],
  target_market: ["target market", "market", "geography", "geographic market"],
  competitors: ["competitors", "competition", "competitive landscape"],
  planned_launch_date: ["planned launch date", "launch date", "release date", "launch"],
  product_advantages: ["product advantages", "advantages", "differentiators", "unique value proposition"],
  expected_customer_needs: ["expected customer needs", "customer needs", "needs", "problem solved"],
  previous_generation_info: ["previous generation", "previous generation info", "prior version", "v1 information"],
  additional_notes: ["additional notes", "notes", "additional information", "other information"],
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function fieldForKey(key: string): keyof ProductData | null {
  const normalized = normalizeKey(key);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
      return field as keyof ProductData;
    }
  }
  return null;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

function parseLabeledText(text: string) {
  const result = { ...EMPTY_PRODUCT };
  const detected = new Set<keyof ProductData>();
  const lines = text.split(/\r?\n/);
  const unrecognized: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([^:–—-]{2,60})\s*[:–—-]\s*(.+)$/);
    if (!match) {
      unrecognized.push(line);
      continue;
    }
    const field = fieldForKey(match[1]);
    if (field) {
      result[field] = clean(match[2]);
      detected.add(field);
    } else {
      unrecognized.push(line);
    }
  }

  if (!result.name) {
    const title = lines.find((line) => line.trim().length > 2 && line.trim().length < 100);
    if (title) result.name = title.trim();
  }
  if (unrecognized.length && !result.additional_notes) {
    result.additional_notes = unrecognized.join("\n");
  }
  return { result, detected };
}

function parseStructuredText(text: string, extension: string) {
  if (extension === "json") {
    const parsed = JSON.parse(text) as unknown;
    const source = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : { additional_notes: parsed };
    const result = { ...EMPTY_PRODUCT };
    const detected = new Set<keyof ProductData>();
    const rawExtras: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      const field = fieldForKey(key);
      if (field) {
        result[field] = Array.isArray(value) ? value.map(clean).join("\n") : clean(value);
        if (result[field]) detected.add(field);
      } else {
        rawExtras[key] = value;
      }
    }
    if (Object.keys(rawExtras).length) {
      result.additional_notes = [result.additional_notes, JSON.stringify(rawExtras, null, 2)].filter(Boolean).join("\n\n");
    }
    return { result, detected };
  }

  if (extension === "csv") {
    const rows = parseCsv(text);
    const result = { ...EMPTY_PRODUCT };
    const detected = new Set<keyof ProductData>();
    const firstRowKeys = rows.length ? rows[0].map(normalizeKey) : [];
    if (rows.length >= 2) {
      const isKeyValue = rows.every((row) => row.length === 2) && rows[0].length === 2 && !fieldForKey(rows[0][0]);
      if (isKeyValue) {
        for (const [key, value] of rows) {
          const field = fieldForKey(key);
          if (field) {
            result[field] = value;
            if (value) detected.add(field);
          }
        }
      } else {
        for (let index = 0; index < firstRowKeys.length; index += 1) {
          const field = fieldForKey(firstRowKeys[index]);
          const values = rows.slice(1).map((row) => row[index]).filter(Boolean);
          if (field && values.length) {
            result[field] = values.join("\n");
            detected.add(field);
          }
        }
      }
    }
    if (!result.additional_notes && rows.length) {
      const known = new Set(firstRowKeys.map(fieldForKey).filter(Boolean));
      const unknown = rows[0].filter((key) => !known.has(fieldForKey(key)));
      if (unknown.length) result.additional_notes = `Unrecognized columns: ${unknown.join(", ")}`;
    }
    return { result, detected };
  }

  return parseLabeledText(text);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select a non-empty product file." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Product files must be 20 MB or smaller." }, { status: 413 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "csv", "json", "txt"].includes(extension)) {
      return NextResponse.json({ error: "Only PDF, CSV, JSON, and TXT files are supported." }, { status: 415 });
    }

    let text: string;
    if (extension === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse(new Uint8Array(await file.arrayBuffer()));
      const parsed = await parser.getText();
      text = parsed.text ?? "";
    } else {
      text = Buffer.from(await file.arrayBuffer()).toString("utf-8");
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "The file contains no readable product information." }, { status: 422 });
    }

    const { result, detected } = parseStructuredText(text, extension);
    const fields = Object.keys(EMPTY_PRODUCT) as Array<keyof ProductData>;
    const notDetected = fields.filter((field) => !detected.has(field) && !result[field]);

    return NextResponse.json({
      ...result,
      sourceFileName: file.name,
      fileType: extension,
      extractionStatus: "complete",
      fieldsDetected: Array.from(detected),
      fieldsNotDetected: notDetected,
      extractionConfidence: detected.size / fields.length,
    });
  } catch (error) {
    console.error("Error parsing product file:", error);
    return NextResponse.json({ error: "Failed to parse the product file. Check that it is valid and readable." }, { status: 422 });
  }
}
