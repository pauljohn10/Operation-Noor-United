export type UserRole =
  | 'Super Admin'
  | 'Management'
  | 'Account Manager'
  | 'Accountant'
  | 'Operation Supervisor';

export type UserStatus = 'active' | 'inactive';
export type StationStatus = 'active' | 'inactive';

export interface User {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  username: string;
  password_hash?: string;
  mobile_number?: string;
  position: string;
  role: UserRole;
  assigned_station_id?: string;
  assigned_station_name?: string;
  signature_url?: string;
  status: UserStatus;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FuelSectionTotals {
  fuel_type: FuelType;
  total_quantity: number;
  price: number;
  total_sales: number;
  final_closing_reading: number;
}

export type AuditStatus =
  | 'draft'
  | 'pending_accountant'
  | 'pending_account_manager'
  | 'pending_management'
  | 'approved'
  | 'rejected'
  | 'returned_for_correction';

export type FuelType = 'PETROL_91' | 'PETROL_95' | 'DIESEL';

// 3 Sequential Approval Roles (Accountant -> Account Manager -> Management)
export type ApprovalRole =
  | 'operation_supervisor'
  | 'accountant'
  | 'account_manager'
  | 'management';

export type ApprovalActionStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface Station {
  id: string;
  station_no: string;
  name: string;
  location: string;
  region?: string;
  status: StationStatus;
  operation_supervisor_id?: string;
  operation_supervisor_name?: string;
  created_at?: string;
}

export interface PumpReadingItem {
  id?: string;
  audit_id?: string;
  fuel_type: FuelType;
  pump_no: number; // 1 to 14
  start_reading?: number | null;
  end_reading?: number | null;
  quantity_sold?: number | null;
  price: number;
  amount?: number | null;
}

export interface ApprovalRecord {
  id?: string;
  audit_id?: string;
  role: ApprovalRole;
  role_display_name: string;
  approver_id?: string | null;
  approver_name?: string | null;
  approver_position?: string | null;
  status: ApprovalActionStatus;
  comments?: string | null;
  action_timestamp?: string | null;
  digital_signature_code?: string | null;
  signature_url?: string | null;
  created_at?: string;
}

export interface AuditComment {
  id: string;
  audit_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  comment_text: string;
  created_at: string;
}

export interface AuditNotification {
  id: string;
  audit_id: string;
  audit_number: string;
  station_name: string;
  recipient_role: UserRole | 'ALL';
  sender_name: string;
  action_type: 'submitted' | 'approved' | 'rejected' | 'returned' | 'commented';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface StationAudit {
  id: string;
  audit_number: string;
  station_id: string;
  station_no: string;
  station_name: string;
  location: string;
  audit_date: string;
  created_by: string;
  created_by_name: string;
  created_by_role: UserRole;
  
  // On-Site Inspection Preparation Signatures
  station_supervisor_name: string;
  station_supervisor_signature_url?: string;
  operation_supervisor_signature_url?: string;
  
  current_status: AuditStatus;
  
  // Rejection & Resubmission Tracking
  rejected_by_role?: ApprovalRole | null;
  rejection_reason?: string | null;
  
  noor_khoy_amount?: number | null;
  atm_amount?: number | null;
  cash_amount?: number | null;
  cash_received_amount?: number | null;
  
  total_sales: number;
  total_quantity: number;
  discrepancy_amount: number;

  // Fuel prices locked at the time the audit was created/saved.
  // Optional for backwards compatibility with older records.
  p91_price?: number;
  p95_price?: number;
  diesel_price?: number;

  notes?: string;

  created_at: string;
  updated_at: string;
  
  items: PumpReadingItem[];
  approvals: ApprovalRecord[];
  comments: AuditComment[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface SystemSettings {
  company_name: string;
  company_name_ar: string;
  session_timeout_minutes: number;
  p91_price: number;
  p95_price: number;
  diesel_price: number;
}
