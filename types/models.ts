export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  pricing: string | null;
  target_audience: string | null;
  target_market: string | null;
  competitors: string | null;
  planned_launch_date: string | null;
  product_advantages: string | null;
  expected_customer_needs: string | null;
  previous_generation_info: string | null;
  additional_notes: string | null;
  status: string; // 'Not analyzed', 'Analyzing', 'Ready'
  created_at: string;
  updated_at: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  name: string;
  value: string;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
}

export interface Competitor {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
}

export interface ProductMemory {
  id: string;
  product_id: string;
  key: string;
  value: string;
}

export interface Analysis {
  id: string;
  product_id: string;
  type: string;
  content: string; // JSON or text
  status: string;
  created_at: string;
}

export interface Report {
  id: string;
  product_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  product_id: string;
  frequency: string;
  last_run: string | null;
}

export interface AgentRun {
  id: string;
  product_id: string;
  query: string;
  response: string;
  created_at: string;
}
