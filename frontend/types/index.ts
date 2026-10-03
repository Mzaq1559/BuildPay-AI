export type UserRole = 
  | 'contractor' 
  | 'consultant' 
  | 'quantity_surveyor' 
  | 'client' 
  | 'project_manager' 
  | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  organization?: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: number;
  project_number: string;
  name: string;
  description?: string;
  location: string;
  client_name: string;
  contractor_name: string;
  consultant_name?: string;
  status: ProjectStatus;
  contract_value: number;
  currency: string;
  retention_rate: number;
  start_date?: string;
  end_date?: string;
  boq_type?: string;
  created_at: string;
}

export type BOQSection = 'Mobilization' | 'Grey Structure' | 'Finishing' | 'Other';

export interface BOQItem {
  id: number;
  boq_id: number;
  item_code: string;
  section: BOQSection;
  description: string;
  unit: string;
  original_quantity: number;
  unit_rate: number;
  amount: number;
  notes?: string;
  executed_quantity: number;
  certified_quantity: number;
  approved_variation_quantity: number;
  current_approved_quantity: number;
  created_at: string;
}

export interface BOQ {
  id: number;
  project_id: number;
  name: string;
  boq_type: string;
  currency: string;
  plot_area_sqft?: number;
  covered_area_sqft?: number;
  storeys: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  items?: BOQItem[];
}

export type CheckRequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'ai_review' 
  | 'human_review' 
  | 'approved' 
  | 'returned' 
  | 'rejected';

export interface CheckRequest {
  id: number;
  cr_number: string;
  project_id: number;
  boq_item_id: number;
  submitted_by: number;
  status: CheckRequestStatus;
  location?: string;
  description: string;
  requested_quantity: number;
  unit: string;
  notes?: string;
  ai_review_id?: number;
  ai_confidence?: number;
  approved_by?: number;
  decision_notes?: string;
  submitted_at?: string;
  ai_reviewed_at?: string;
  decided_at?: string;
  created_at: string;
  boq_item?: BOQItem;
  ai_review?: AIReview;
  documents?: Document[];
}

export type MeasurementStatus = 'recorded' | 'verified' | 'disputed';

export interface Measurement {
  id: number;
  project_id: number;
  check_request_id?: number;
  boq_item_id: number;
  recorded_by: number;
  verified_by?: number;
  status: MeasurementStatus;
  current_quantity: number;
  previously_certified_quantity: number;
  cumulative_quantity: number;
  remaining_approved_quantity: number;
  measurement_date: string;
  location_description?: string;
  comments?: string;
  is_overrun: boolean;
  overrun_quantity: number;
  variation_id?: number;
  created_at: string;
  boq_item?: BOQItem;
}

export type VariationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'ai_review' 
  | 'human_review' 
  | 'approved' 
  | 'returned' 
  | 'rejected';

export interface Variation {
  id: number;
  variation_number: string;
  project_id: number;
  boq_item_id: number;
  requested_by: number;
  status: VariationStatus;
  title: string;
  justification: string;
  original_quantity: number;
  proposed_quantity: number;
  quantity_delta: number;
  unit_rate: number;
  original_amount: number;
  proposed_amount: number;
  amount_delta: number;
  percentage_change: number;
  ai_review_id?: number;
  ai_confidence?: number;
  approved_by?: number;
  decision_notes?: string;
  submitted_at?: string;
  decided_at?: string;
  created_at: string;
  boq_item?: BOQItem;
  ai_review?: AIReview;
}

export type IPCStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'certified' 
  | 'approved' 
  | 'paid' 
  | 'rejected';

export interface IPCLine {
  id: number;
  ipc_id: number;
  boq_item_id: number;
  item_code: string;
  description: string;
  unit: string;
  unit_rate: number;
  contract_quantity: number;
  previous_certified_qty: number;
  current_claimed_qty: number;
  cumulative_qty: number;
  previous_certified_amount: number;
  current_claimed_amount: number;
  cumulative_amount: number;
  completion_percentage: number;
}

export interface IPC {
  id: number;
  ipc_number: string;
  project_id: number;
  period_number: number;
  period_start: string;
  period_end: string;
  status: IPCStatus;
  gross_amount: number;           // gross_current_amount → gross_amount (backend field)
  retention_amount: number;
  previous_certified_total: number;
  current_certified_amount: number;
  cumulative_certified_amount: number;
  net_payable: number;            // net_payable_amount → net_payable (backend field)
  has_exceptions: boolean;
  exceptions_notes?: string;
  ai_confidence?: number;
  certified_by?: number;
  decision_notes?: string;
  submitted_at?: string;
  decided_at?: string;
  created_at: string;
  lines?: IPCLine[];
  ai_review?: AIReview;
}

export type AIFindingSeverity = 'critical' | 'high' | 'warning' | 'info' | 'pass';

export interface AIFinding {
  id: number;
  ai_review_id: number;
  agent_name: string;
  severity: AIFindingSeverity;
  title: string;
  finding: string;
  evidence_citation?: string;
  recommendation?: string;
  confidence_score: number;
  metadata_json?: string;
  created_at: string;
}

export interface AIReview {
  id: number;
  entity_type: string;
  entity_id: number;
  overall_status: string;
  overall_confidence: number;
  summary_text?: string;
  risk_score: number;
  requires_human_override: boolean;
  reviewed_at: string;
  findings: AIFinding[];
}

export interface Document {
  id: number;
  project_id: number;
  entity_type: string;
  entity_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  status: string;
  description?: string;
  uploaded_by: number;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  project_id?: number;
  event_type: string;
  entity_type: string;
  entity_id: number;
  actor_id?: number;
  actor_name?: string;
  actor_role?: string;
  summary: string;
  details_json?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface OverviewMetrics {
  total_projects: number;
  total_contract_value: number;
  active_crs: number;
  pending_variations: number;
  current_ipc_value: number;
  ai_flags_count: number;
  total_certified_amount: number;
}
