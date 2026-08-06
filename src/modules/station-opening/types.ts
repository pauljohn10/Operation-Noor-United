import type { UserRole } from '../../types/audit';

export type StationOpeningStatus =
  | 'pending_safety_quality'
  | 'pending_document_controller'
  | 'pending_engineering'
  | 'pending_management'
  | 'approved'
  | 'returned'
  | 'rejected';

export type StationOpeningApprovalRole =
  | 'safety_quality'
  | 'document_controller'
  | 'engineering'
  | 'management';

export type StationOpeningSystemRole =
  | 'Head of Operation'
  | 'Safety & Quality Control'
  | 'Document Controller'
  | 'Engineering Department'
  | 'Al Noor United Management';

export type ApprovalActionStatus = 'pending' | 'approved' | 'returned' | 'rejected';

export interface StationOpeningUser {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  username: string;
  password_hash?: string;
  role: StationOpeningSystemRole;
  mobile_number?: string;
  signature_url?: string;
  profile_photo_url?: string;
  status: 'active' | 'inactive';
  login_enabled: boolean;
  last_login_at?: string;
  created_at?: string;
  created_by?: string;
  created_by_name?: string;
}

export interface StationOpeningFuelTankDetail {
  fuel_type: 'PETROL_91' | 'PETROL_95' | 'DIESEL' | 'KEROSENE';
  is_available: boolean;
  tank_capacity: string;
  no_of_tanks: number;
  nozzle_quantity: number;
  no_of_pumps: number;
}

export interface StationOpeningNozzleDetail {
  fuel_type: 'PETROL_91' | 'PETROL_95' | 'DIESEL' | 'COMBINED' | 'KEROSENE';
  quantity: number;
  no_of_pumps: number;
}

export interface FireExtinguisherItem {
  id: string;
  name: string;
  weight_volume: string;
  quantity: number;
  is_available?: boolean;
}

export interface StationOpeningSafetyEquipment {
  fire_pump: boolean;
  water_tanks: boolean;
  battery_for_fire_pump: boolean;
  earthing_cable: boolean;
  hose_couplings: boolean;
  vent_air_pipes: boolean;
  color_coding: boolean;
  sand_backfill: boolean;
  fire_hose_cabinet_locations: string[]; // 12 cabinet location text fields
  extinguishers: FireExtinguisherItem[];
}

export interface StationOpeningAmenities {
  noor_cladding: boolean;
  price_board_led: boolean;
  washrooms: boolean;
  pwd_ramp_parking: boolean;
  entrance_exit_signage: boolean;
  station_office: boolean;
  emergency_switch: boolean;
  assembly_point: boolean;
  backup_generator: boolean;
  diesel_truck_area: boolean;
  diesel_canopy_small_car: boolean;
  supermarket: boolean;
  restaurant: boolean;
  buffia: boolean;
  mosque: boolean;
  bank_machine: boolean;
  car_wash: boolean;
  auto_car_wash: boolean;
  buncher_shop: boolean;
  oil_change_shop: boolean;
  ev_charger: boolean;
  others_text: string;
}

export interface StationOpeningApproval {
  id?: string;
  form_id?: string;
  role: StationOpeningApprovalRole;
  role_display_name: string;
  approver_id?: string | null;
  approver_name?: string | null;
  approver_position?: string | null;
  status: ApprovalActionStatus;
  comments?: string | null;
  digital_signature_code?: string | null;
  signature_url?: string | null;
  action_timestamp?: string | null;
  created_at?: string;
}

export interface StationOpeningNotification {
  id: string;
  form_id: string;
  form_number: string;
  station_name: string;
  recipient_role: StationOpeningSystemRole | 'ALL';
  recipient_id?: string;
  form_creator_id?: string;
  sender_name: string;
  action_type: 'submitted' | 'approved' | 'returned' | 'rejected' | 'resubmitted' | 'final_approval';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface StationOpeningForm {
  id: string;
  form_number: string;
  station_id: string;
  station_no: string;
  station_name: string;
  address: string;
  date_started: string;
  electric_meter_number: string;
  atm_machine: string;
  noor_khoy_machine: string;
  staff_house: string;

  // Initial Creator & On-site Signatures
  station_supervisor_name: string;
  station_supervisor_signature_url?: string;
  station_supervisor_signed_at?: string;

  head_of_operation_name: string;
  head_of_operation_signature_url?: string;
  head_of_operation_signed_at?: string;

  // Fuel Pump Details
  brand_of_fuel_pump: string;
  no_of_fuel_pump: number;
  automation_enabled: boolean;
  nozzle_details: StationOpeningNozzleDetail[];

  // Products & Tanks
  fuel_tanks: StationOpeningFuelTankDetail[];

  // Safety Equipment & Amenities
  safety_equipment: StationOpeningSafetyEquipment;
  amenities: StationOpeningAmenities;

  // Workflow & Status
  current_status: StationOpeningStatus;
  current_approver_role?: StationOpeningApprovalRole | null;
  returned_by_role?: StationOpeningApprovalRole | null;
  return_reason?: string | null;

  // Approvals Chain (4 sequential approvals)
  approvals: StationOpeningApproval[];

  // Metadata
  created_by: string;
  created_by_name: string;
  created_by_role: UserRole;
  created_at: string;
  updated_at: string;
}

export type StationOpeningActivityActionType =
  | 'created'
  | 'updated'
  | 'submitted'
  | 'returned'
  | 'resubmitted'
  | 'approved_stage'
  | 'rejected'
  | 'final_approval';

export interface StationOpeningActivityLog {
  id: string;
  form_id: string;
  form_number: string;
  station_id: string;
  station_name: string;
  action_type: StationOpeningActivityActionType;
  action_title: string;
  action_description?: string;
  status_at_time: StationOpeningStatus;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  form_creator_id?: string;
  created_at: string;
}
