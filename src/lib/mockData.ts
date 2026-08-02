import type { Station, StationAudit, PumpReadingItem, ApprovalRecord, AuditNotification, User, AuditLog, SystemSettings } from '../types/audit';
import { DEFAULT_FUEL_PRICES, calculateAuditTotals } from './calculations';

// 5 System Roles Only
export const INITIAL_USERS: User[] = [
  {
    id: 'user-001',
    employee_id: 'EMP-001',
    full_name: 'Eng. Ibrahim Al-Mansoor',
    email: 'admin@alnoor.sa',
    username: 'admin',
    password_hash: '',
    mobile_number: '+966 50 111 2233',
    position: 'Chief Enterprise Admin',
    role: 'Super Admin',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    employee_id: 'EMP-002',
    full_name: 'Sultan Al-Otaibi',
    email: 'sultan@alnoor.sa',
    username: 'sultan',
    password_hash: '',
    mobile_number: '+966 50 222 3344',
    position: 'Executive General Manager',
    role: 'Management',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-003',
    employee_id: 'EMP-003',
    full_name: 'Fahad Al-Harbi',
    email: 'fahad@alnoor.sa',
    username: 'fahad',
    password_hash: '',
    mobile_number: '+966 50 333 4455',
    position: 'Senior Account Manager',
    role: 'Account Manager',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-004',
    employee_id: 'EMP-004',
    full_name: 'Tariq Al-Zahrani',
    email: 'tariq@alnoor.sa',
    username: 'tariq',
    password_hash: '',
    mobile_number: '+966 50 444 5566',
    position: 'Senior Station Accountant',
    role: 'Accountant',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-005',
    employee_id: 'EMP-005',
    full_name: 'Khalid Al-Ghamdi',
    email: 'khalid@alnoor.sa',
    username: 'khalid',
    password_hash: '',
    mobile_number: '+966 50 555 6677',
    position: 'Operations Supervisor (Riyadh)',
    role: 'Operation Supervisor',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-006',
    employee_id: 'EMP-006',
    full_name: 'Samir Al-Dossary',
    email: 'samir@alnoor.sa',
    username: 'samir',
    password_hash: '',
    mobile_number: '+966 50 666 7788',
    position: 'Operations Supervisor (Eastern)',
    role: 'Operation Supervisor',
    status: 'active',
    signature_url: '',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'st-001',
    station_no: 'ST-101',
    name: 'Al Malaz Fuel Station',
    location: 'Riyadh - Al Malaz District',
    region: 'Central Region',
    status: 'active',
    operation_supervisor_id: 'user-005',
    operation_supervisor_name: 'Khalid Al-Ghamdi',
  },
  {
    id: 'st-002',
    station_no: 'ST-102',
    name: 'Al Olaya Grand Station',
    location: 'Riyadh - King Fahd Rd',
    region: 'Central Region',
    status: 'active',
    operation_supervisor_id: 'user-005',
    operation_supervisor_name: 'Khalid Al-Ghamdi',
  },
  {
    id: 'st-003',
    station_no: 'ST-201',
    name: 'Corniche Central Station',
    location: 'Jeddah - North Corniche',
    region: 'Western Region',
    status: 'active',
    operation_supervisor_id: 'user-005',
    operation_supervisor_name: 'Khalid Al-Ghamdi',
  },
  {
    id: 'st-004',
    station_no: 'ST-301',
    name: 'Al Shafa Highway Station',
    location: 'Taif - Al Shafa Main Road',
    region: 'Western Region',
    status: 'active',
    operation_supervisor_id: 'user-005',
    operation_supervisor_name: 'Khalid Al-Ghamdi',
  },
  {
    id: 'st-005',
    station_no: 'ST-401',
    name: 'Dammam Port Station',
    location: 'Dammam - Coastal Highway',
    region: 'Eastern Region',
    status: 'active',
    operation_supervisor_id: 'user-005',
    operation_supervisor_name: 'Khalid Al-Ghamdi',
  },
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  company_name: 'Al Noor United Fuel Est.',
  company_name_ar: 'مؤسسة النور المتحدة للوقود',
  session_timeout_minutes: 30,
  p91_price: 2.18,
  p95_price: 2.33,
  diesel_price: 1.15,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    user_id: 'user-001',
    user_name: 'Eng. Ibrahim Al-Mansoor',
    action: 'SYSTEM_BOOT',
    details: 'Production Station Audit System initialized.',
    ip_address: '192.168.1.100',
    created_at: new Date().toISOString(),
  },
  {
    id: 'log-002',
    user_id: 'user-005',
    user_name: 'Khalid Al-Ghamdi',
    action: 'USER_LOGIN',
    details: 'User authenticated successfully.',
    ip_address: '192.168.1.105',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function generateEmptyItems(): PumpReadingItem[] {
  const items: PumpReadingItem[] = [];
  const fuels: ('PETROL_91' | 'PETROL_95' | 'DIESEL')[] = ['PETROL_91', 'PETROL_95', 'DIESEL'];

  fuels.forEach((fuel) => {
    const price = DEFAULT_FUEL_PRICES[fuel];
    for (let p = 1; p <= 14; p++) {
      items.push({
        fuel_type: fuel,
        pump_no: p,
        start_reading: null,
        end_reading: null,
        quantity_sold: null,
        price: price,
        amount: null,
      });
    }
  });

  return items;
}

export function generateSampleItems(): PumpReadingItem[] {
  const items: PumpReadingItem[] = [];
  
  for (let p = 1; p <= 14; p++) {
    const start = 12000 + p * 450;
    const end = start + (p <= 6 ? 320 + p * 15 : 0);
    const qty = end - start;
    const price = DEFAULT_FUEL_PRICES.PETROL_91;
    items.push({
      fuel_type: 'PETROL_91',
      pump_no: p,
      start_reading: start,
      end_reading: end,
      quantity_sold: qty,
      price: price,
      amount: Number((qty * price).toFixed(2)),
    });
  }

  for (let p = 1; p <= 14; p++) {
    const start = 8500 + p * 320;
    const end = start + (p <= 4 ? 280 + p * 12 : 0);
    const qty = end - start;
    const price = DEFAULT_FUEL_PRICES.PETROL_95;
    items.push({
      fuel_type: 'PETROL_95',
      pump_no: p,
      start_reading: start,
      end_reading: end,
      quantity_sold: qty,
      price: price,
      amount: Number((qty * price).toFixed(2)),
    });
  }

  for (let p = 1; p <= 14; p++) {
    const start = 24000 + p * 600;
    const end = start + (p <= 5 ? 450 + p * 25 : 0);
    const qty = end - start;
    const price = DEFAULT_FUEL_PRICES.DIESEL;
    items.push({
      fuel_type: 'DIESEL',
      pump_no: p,
      start_reading: start,
      end_reading: end,
      quantity_sold: qty,
      price: price,
      amount: Number((qty * price).toFixed(2)),
    });
  }

  return items;
}

// 3 Sequential Approval Records
export function createDefaultApprovals(): ApprovalRecord[] {
  return [
    {
      role: 'accountant',
      role_display_name: 'Accountant',
      approver_id: undefined,
      approver_name: undefined,
      approver_position: undefined,
      status: 'pending',
      comments: undefined,
      action_timestamp: undefined,
      digital_signature_code: undefined,
      signature_url: undefined,
    },
    {
      role: 'account_manager',
      role_display_name: 'Account Manager',
      approver_id: undefined,
      approver_name: undefined,
      approver_position: undefined,
      status: 'pending',
      comments: undefined,
      action_timestamp: undefined,
      digital_signature_code: undefined,
      signature_url: undefined,
    },
    {
      role: 'management',
      role_display_name: 'Al Noor United Management',
      approver_id: undefined,
      approver_name: undefined,
      approver_position: undefined,
      status: 'pending',
      comments: undefined,
      action_timestamp: undefined,
      digital_signature_code: undefined,
      signature_url: undefined,
    },
  ];
}

export function generateInitialAudits(): StationAudit[] {
  const sampleItems1 = generateSampleItems();
  const totals1 = calculateAuditTotals(
    sampleItems1,
    DEFAULT_FUEL_PRICES,
    3500.0,
    2800.0,
    1500.0
  );

  const audit1: StationAudit = {
    id: 'aud-001',
    audit_number: 'SA-2026-0001',
    station_id: 'st-001',
    station_no: 'ST-101',
    station_name: 'Al Malaz Fuel Station',
    location: 'Riyadh - Al Malaz District',
    audit_date: '2026-07-22',
    created_by: 'user-005',
    created_by_name: 'Khalid Al-Ghamdi',
    created_by_role: 'Operation Supervisor',
    station_supervisor_name: '',
    station_supervisor_signature_url: '',
    operation_supervisor_signature_url: '',
    current_status: 'draft',
    noor_khoy_amount: 3500.0,
    atm_amount: 2800.0,
    cash_amount: totals1.expectedCash,
    cash_received_amount: totals1.expectedCash,
    total_sales: totals1.grandTotalSales,
    total_quantity: totals1.grandTotalQuantity,
    discrepancy_amount: 0.0,
    notes: 'Regular daily audit executed.',
    created_at: '2026-07-22T08:30:00Z',
    updated_at: '2026-07-22T11:15:00Z',
    items: sampleItems1,
    approvals: createDefaultApprovals(),
    comments: [
      {
        id: 'c-101',
        audit_id: 'aud-001',
        user_id: 'user-005',
        user_name: 'Khalid Al-Ghamdi',
        user_role: 'Operation Supervisor',
        comment_text: 'Created daily station audit for Al Malaz.',
        created_at: '2026-07-22T08:30:00Z',
      },
    ],
  };

  return [audit1];
}

export const INITIAL_NOTIFICATIONS: AuditNotification[] = [
  {
    id: 'notif-001',
    audit_id: 'aud-001',
    audit_number: 'SA-2026-0001',
    station_name: 'Al Malaz Fuel Station',
    recipient_role: 'Operation Supervisor',
    sender_name: 'System',
    action_type: 'submitted',
    message: 'New draft Station Audit SA-2026-0001 created for Al Malaz Fuel Station.',
    is_read: false,
    created_at: '2026-07-22T08:30:00Z',
  },
];
