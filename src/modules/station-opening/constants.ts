import type {
  StationOpeningForm,
  StationOpeningApproval,
  FireExtinguisherItem,
} from './types';

export const DEFAULT_FIRE_EXTINGUISHERS: FireExtinguisherItem[] = [
  { id: '1', name: 'Automatic Dry Powder', weight_volume: '6 Kg', quantity: 0 },
  { id: '2', name: 'Automatic Foam', weight_volume: '6 Liters', quantity: 0 },
  { id: '3', name: 'Dry Powder', weight_volume: '6 Kg', quantity: 0 },
  { id: '4', name: 'Foam', weight_volume: '6 Liters', quantity: 0 },
  { id: '5', name: 'CO₂ Fire Extinguisher', weight_volume: '5 Kg', quantity: 0 },
  { id: '6', name: 'Sand Bucket', weight_volume: 'Standard', quantity: 0, is_available: false },
  { id: '7', name: 'Traffic Cone', weight_volume: 'Standard', quantity: 0, is_available: false },
  { id: '8', name: 'Waste Bin', weight_volume: 'Large', quantity: 0, is_available: false },
  { id: '9', name: 'CCTV 24/7 Monitoring', weight_volume: 'Standard', quantity: 0, is_available: false },
];

export const INITIAL_APPROVALS: StationOpeningApproval[] = [
  {
    role: 'safety_quality',
    role_display_name: 'Safety & Quality Control',
    status: 'pending',
  },
  {
    role: 'document_controller',
    role_display_name: 'Document Controller',
    status: 'pending',
  },
  {
    role: 'engineering',
    role_display_name: 'Engineering Department',
    status: 'pending',
  },
  {
    role: 'management',
    role_display_name: 'Al Noor United Management',
    status: 'pending',
  },
];

export function createEmptyStationOpeningForm(
  stationId: string = '',
  stationNo: string = '',
  stationName: string = '',
  stationAddress: string = '',
  creatorId: string = '',
  creatorName: string = '',
  creatorRole: any = 'Head of Operation'
): StationOpeningForm {
  const now = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const dateStr = now.substring(0, 7).replace('-', '');
  const formNo = `SOF-${dateStr}-${randomSuffix}`;

  return {
    id: `sof_${Date.now()}_${randomSuffix}`,
    form_number: formNo,
    station_id: stationId,
    station_no: stationNo,
    station_name: stationName,
    address: stationAddress || '',
    date_started: new Date().toISOString().split('T')[0],
    electric_meter_number: '',
    atm_machine: '',
    noor_khoy_machine: '',
    staff_house: '',

    station_supervisor_name: '',
    station_supervisor_signature_url: '',
    head_of_operation_name: creatorName || '',
    head_of_operation_signature_url: '',

    brand_of_fuel_pump: '',
    no_of_fuel_pump: 0,
    automation_enabled: false,
    nozzle_details: [
      { fuel_type: 'PETROL_91', quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'PETROL_95', quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'DIESEL', quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'COMBINED', quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'KEROSENE', quantity: 0, no_of_pumps: 0 },
    ],

    fuel_tanks: [
      { fuel_type: 'PETROL_91', is_available: false, tank_capacity: '', no_of_tanks: 0, nozzle_quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'PETROL_95', is_available: false, tank_capacity: '', no_of_tanks: 0, nozzle_quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'DIESEL', is_available: false, tank_capacity: '', no_of_tanks: 0, nozzle_quantity: 0, no_of_pumps: 0 },
      { fuel_type: 'KEROSENE', is_available: false, tank_capacity: '', no_of_tanks: 0, nozzle_quantity: 0, no_of_pumps: 0 },
    ],

    safety_equipment: {
      fire_pump: false,
      water_tanks: false,
      battery_for_fire_pump: false,
      earthing_cable: false,
      hose_couplings: false,
      vent_air_pipes: false,
      color_coding: false,
      sand_backfill: false,
      fire_hose_cabinet_locations: Array(12).fill(''),
      extinguishers: DEFAULT_FIRE_EXTINGUISHERS.map((ext) => ({
        ...ext,
        quantity: 0,
      })),
    },

    amenities: {
      noor_cladding: false,
      price_board_led: false,
      washrooms: false,
      pwd_ramp_parking: false,
      entrance_exit_signage: false,
      station_office: false,
      emergency_switch: false,
      assembly_point: false,
      backup_generator: false,
      diesel_truck_area: false,
      diesel_canopy_small_car: false,
      supermarket: false,
      restaurant: false,
      buffia: false,
      mosque: false,
      bank_machine: false,
      car_wash: false,
      auto_car_wash: false,
      buncher_shop: false,
      oil_change_shop: false,
      ev_charger: false,
      others_text: '',
    },

    current_status: 'draft',
    current_approver_role: null,
    returned_by_role: null,
    return_reason: null,

    approvals: JSON.parse(JSON.stringify(INITIAL_APPROVALS)),

    created_by: creatorId,
    created_by_name: creatorName,
    created_by_role: creatorRole,
    created_at: now,
    updated_at: now,
  };
}
