import React from 'react';
import type { StationOpeningForm } from '../types';

interface Props {
  form: StationOpeningForm;
}

export const SOPdfLayout: React.FC<Props> = ({ form }) => {
  const getApprovalByRole = (role: string) => {
    return form.approvals?.find((a) => a.role === role);
  };

  const safetyQualityApp = getApprovalByRole('safety_quality');
  const docControllerApp = getApprovalByRole('document_controller');
  const engineeringApp = getApprovalByRole('engineering');
  const managementApp = getApprovalByRole('management');

  const getTank = (fuelType: string) => {
    return form.fuel_tanks?.find((t) => t.fuel_type === fuelType);
  };

  const getNozzle = (fuelType: string) => {
    return form.nozzle_details?.find((n) => n.fuel_type === fuelType);
  };

  // Total nozzles count calculation
  const totalNozzles = form.nozzle_details?.reduce((acc, n) => acc + (n.quantity || 0), 0) || 0;

  // Helper for Checkbox rendering
  const renderCheck = (checked: boolean | undefined) => (
    <span
      style={{
        display: 'inline-block',
        width: '11px',
        height: '11px',
        border: '1px solid #000000',
        backgroundColor: checked ? '#000000' : '#ffffff',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: '9px',
        fontSize: '8px',
        fontWeight: 'bold',
        marginLeft: '4px',
        marginRight: '4px',
        verticalAlign: 'middle',
      }}
    >
      {checked ? '✓' : ''}
    </span>
  );

  const renderYesNo = (val: boolean | undefined) => (
    <span style={{ fontSize: '8px', fontWeight: 'bold' }}>
      {renderCheck(val === true)} Yes {renderCheck(val === false)} No
    </span>
  );

  const defaultExtinguishers: (typeof form.safety_equipment.extinguishers[0])[] = [
    { id: '1', name: 'Automatic Dry Powder', weight_volume: '6 Kg', quantity: 0, is_available: false },
    { id: '2', name: 'Automatic Foam', weight_volume: '6 Liters', quantity: 0, is_available: false },
    { id: '3', name: 'Dry Powder', weight_volume: '6 Kg', quantity: 0, is_available: false },
    { id: '4', name: 'Foam', weight_volume: '6 Liters', quantity: 0, is_available: false },
    { id: '5', name: 'CO₂ Fire Extinguisher', weight_volume: '5 Kg', quantity: 0, is_available: false },
    { id: '6', name: 'Sand Bucket', weight_volume: 'Standard', quantity: 0, is_available: false },
    { id: '7', name: 'Traffic Cone', weight_volume: 'Standard', quantity: 0, is_available: false },
    { id: '8', name: 'Waste Bin', weight_volume: 'Large', quantity: 0, is_available: false },
    { id: '9', name: 'CCTV 24/7 Monitoring', weight_volume: 'Standard', quantity: 0, is_available: false },
  ];

  const extinguishersList =
    form.safety_equipment?.extinguishers && form.safety_equipment.extinguishers.length > 0
      ? form.safety_equipment.extinguishers
      : defaultExtinguishers;

  return (
    <div
      id="station-opening-pdf-document"
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '10px 14px',
        fontSize: '8px',
        lineHeight: '1.15',
        border: '1px solid #000000',
        margin: '0 auto',
      }}
    >
      {/* 1. TOP HEADER WITH OFFICIAL COMPANY LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        {/* LOGO */}
        <div style={{ width: '150px' }}>
          <img
            src="/logo_transparent.png"
            alt="Al Noor United Fuel Est. Logo"
            style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* TITLE */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '13px', fontWeight: '900', margin: 0, color: '#000000', letterSpacing: '0.5px' }}>
            AL NOOR UNITED FUEL EST.
          </h1>
          <div style={{ fontSize: '11px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '2px', color: '#0369a1' }}>
            STATION OPENING FORM
          </div>
        </div>

        {/* METADATA */}
        <div style={{ width: '150px', textAlign: 'right', fontSize: '8px', fontWeight: 'bold' }}>
          <div>Form #: <span style={{ fontFamily: 'monospace' }}>{form.form_number}</span></div>
          <div>Date: {form.date_started}</div>
        </div>
      </div>

      <div style={{ borderBottom: '2px dashed #000000', marginBottom: '6px' }} />

      {/* 2. STATION BASIC INFORMATION GRID */}
      <div style={{ border: '1px solid #000000', marginBottom: '6px', padding: '4px 8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8.5px', marginBottom: '3px', textTransform: 'uppercase', color: '#0f172a' }}>
          1. Station Basic Information
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px 12px', fontSize: '7.5px' }}>
          <div>Name of Station: <strong>{form.station_name}</strong></div>
          <div>Station Number: <strong>{form.station_no}</strong></div>
          <div>Date Started: <strong>{form.date_started}</strong></div>

          <div style={{ gridColumn: 'span 2' }}>Address: <strong>{form.address}</strong></div>
          <div>Electric Meter #: <strong>{form.electric_meter_number || 'N/A'}</strong></div>

          <div>ATM Machine: <strong>{form.atm_machine || 'Available'}</strong></div>
          <div>Noor Khoy Machine: <strong>{form.noor_khoy_machine || 'Installed'}</strong></div>
          <div>Staff House: <strong>{form.staff_house || 'Available'}</strong></div>

          <div style={{ gridColumn: 'span 3', borderTop: '1px solid #e2e8f0', paddingTop: '2px', marginTop: '1px' }}>
            Head of Operation: <strong>{form.head_of_operation_name || form.created_by_name}</strong>
          </div>
        </div>
      </div>

      {/* 3. FUEL PUMPS & PRODUCT TANKS SPECIFICATIONS */}
      <div style={{ border: '1px solid #000000', marginBottom: '6px' }}>
        <div style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #000000', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '8.5px' }}>
          2. FUEL PUMPS & PRODUCT TANKS SPECIFICATIONS
        </div>

        {/* Table Header Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', backgroundColor: '#f1f5f9', borderBottom: '1px solid #000000', textAlign: 'center', fontWeight: 'bold', fontSize: '8px', padding: '2px' }}>
          <div>PUMP DETAILS</div>
          <div>PRODUCT TYPE</div>
          <div>TANK CAPACITY</div>
          <div>NO. OF TANKS</div>
        </div>

        {/* Table Body Rows */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', fontSize: '7.5px' }}>
          {/* Col 1: Pump Metadata */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div>Brand of Fuel Pump: <strong>{form.brand_of_fuel_pump || 'N/A'}</strong></div>
            <div>No. of Fuel Pump: <strong>{form.no_of_fuel_pump || 0}</strong></div>
            <div>Automation: {renderYesNo(form.automation_enabled)}</div>
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '1px' }}>
              Total No. of Nozzles: <strong>{totalNozzles}</strong>
            </div>
          </div>

          {/* Col 2: Product Types Checkboxes */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ color: '#15803d', fontWeight: 'bold' }}>
              PETROL 91 {renderCheck(getTank('PETROL_91')?.is_available)}
            </div>
            <div style={{ color: '#b91c1c', fontWeight: 'bold' }}>
              PETROL 95 {renderCheck(getTank('PETROL_95')?.is_available)}
            </div>
            <div style={{ color: '#b45309', fontWeight: 'bold' }}>
              DIESEL {renderCheck(getTank('DIESEL')?.is_available)}
            </div>
            <div style={{ color: '#475569', fontWeight: 'bold' }}>
              KEROSENE {renderCheck(getTank('KEROSENE')?.is_available)}
            </div>
          </div>

          {/* Col 3: Tank Capacities */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>P91: <strong>{getTank('PETROL_91')?.tank_capacity || '0'} L</strong></div>
            <div>P95: <strong>{getTank('PETROL_95')?.tank_capacity || '0'} L</strong></div>
            <div>Diesel: <strong>{getTank('DIESEL')?.tank_capacity || '0'} L</strong></div>
            <div>Kerosene: <strong>{getTank('KEROSENE')?.tank_capacity || '0'} L</strong></div>
          </div>

          {/* Col 4: No. of Tanks */}
          <div style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>Tanks: <strong>{getTank('PETROL_91')?.no_of_tanks || 0}</strong></div>
            <div>Tanks: <strong>{getTank('PETROL_95')?.no_of_tanks || 0}</strong></div>
            <div>Tanks: <strong>{getTank('DIESEL')?.no_of_tanks || 0}</strong></div>
            <div>Tanks: <strong>{getTank('KEROSENE')?.no_of_tanks || 0}</strong></div>
          </div>
        </div>

        {/* Sub-Table for Nozzles & Piping Checks */}
        <div style={{ borderTop: '1px solid #000000', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', fontSize: '7.5px' }}>
          {/* Nozzles Breakdown Table */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000000', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                  <th style={{ textAlign: 'left', padding: '2px' }}>No. of nozzles</th>
                  <th style={{ textAlign: 'center', padding: '2px' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '2px' }}>No. of Pump</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ textAlign: 'left', color: '#15803d', fontWeight: 'bold' }}>Petrol 91</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getNozzle('PETROL_91')?.quantity || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{getNozzle('PETROL_91')?.no_of_pumps || 0}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ textAlign: 'left', color: '#b91c1c', fontWeight: 'bold' }}>Petrol 95</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getNozzle('PETROL_95')?.quantity || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{getNozzle('PETROL_95')?.no_of_pumps || 0}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ textAlign: 'left', color: '#b45309', fontWeight: 'bold' }}>Diesel</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getNozzle('DIESEL')?.quantity || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{getNozzle('DIESEL')?.no_of_pumps || 0}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ textAlign: 'left', color: '#0f172a', fontWeight: 'bold' }}>Combined Petrol & Diesel</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getNozzle('COMBINED')?.quantity || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{getNozzle('COMBINED')?.no_of_pumps || 0}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', color: '#475569', fontWeight: 'bold' }}>Kerosene</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getNozzle('KEROSENE')?.quantity || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{getNozzle('KEROSENE')?.no_of_pumps || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tank Accessories & Piping Safety Checklist */}
          <div style={{ padding: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
            <div style={{ gridColumn: 'span 2', fontWeight: 'bold', fontSize: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              TANK & PIPING SAFETY CHECKLIST
            </div>
            <div>Earthing Cable: {renderYesNo(form.safety_equipment?.earthing_cable)}</div>
            <div>Hose & Couplings: {renderYesNo(form.safety_equipment?.hose_couplings)}</div>
            <div>Vent Air Pipes: {renderYesNo(form.safety_equipment?.vent_air_pipes)}</div>
            <div>Color Coding G-R-B-K: {renderYesNo(form.safety_equipment?.color_coding)}</div>
            <div style={{ gridColumn: 'span 2' }}>
              Tank with Sand Backfill: {renderYesNo(form.safety_equipment?.sand_backfill)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SAFETY EQUIPMENT SECTION */}
      <div style={{ border: '1px solid #000000', marginBottom: '6px' }}>
        <div style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #000000', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '8.5px' }}>
          3. SAFETY EQUIPMENT & EXTINGUISHERS INSPECTION
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', fontSize: '7.5px' }}>
          {/* Left: Fire Pump & Hose Cabinet Locations */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>Fire Pump: {renderYesNo(form.safety_equipment?.fire_pump)}</div>
            <div>Water Tanks: {renderYesNo(form.safety_equipment?.water_tanks)}</div>
            <div>Battery for Fire Pump: {renderYesNo(form.safety_equipment?.battery_for_fire_pump)}</div>

            <div style={{ borderTop: '1px solid #ccc', paddingTop: '3px', marginTop: '2px' }}>
              <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '3px' }}>
                Fire Hose Cabinet Locations (1 to 12)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 8px', fontSize: '7px' }}>
                <div>1: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[0] || '___'}</strong></div>
                <div>7: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[6] || '___'}</strong></div>
                <div>2: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[1] || '___'}</strong></div>
                <div>8: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[7] || '___'}</strong></div>
                <div>3: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[2] || '___'}</strong></div>
                <div>9: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[8] || '___'}</strong></div>
                <div>4: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[3] || '___'}</strong></div>
                <div>10: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[9] || '___'}</strong></div>
                <div>5: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[4] || '___'}</strong></div>
                <div>11: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[10] || '___'}</strong></div>
                <div>6: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[5] || '___'}</strong></div>
                <div>12: <strong>{form.safety_equipment?.fire_hose_cabinet_locations?.[11] || '___'}</strong></div>
              </div>
            </div>
          </div>

          {/* Right: Fire Extinguishers Table */}
          <div style={{ padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '7px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000000', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                  <th style={{ textAlign: 'left', padding: '2px' }}>Equipment Item</th>
                  <th style={{ padding: '2px' }}>Weight / Volume</th>
                  <th style={{ padding: '2px' }}>Quantity / Available</th>
                </tr>
              </thead>
              <tbody>
                {extinguishersList.map((ext) => {
                  const isYesNoItem = ['6', '7', '8', '9'].includes(ext.id) || ['Sand Bucket', 'Traffic Cone', 'Waste Bin', 'CCTV 24/7 Monitoring'].some(n => ext.name.includes(n));
                  const isAvailable = (ext.quantity > 0) || Boolean(ext.is_available);
                  const displayQty = isYesNoItem ? (isAvailable ? 'Yes' : 'No') : (ext.quantity ?? 0);

                  return (
                    <tr key={ext.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ textAlign: 'left', padding: '1.5px 2px', fontWeight: 'bold' }}>{ext.name}</td>
                      <td style={{ padding: '1.5px 2px' }}>{ext.weight_volume || '-'}</td>
                      <td style={{ padding: '1.5px 2px', fontWeight: 'bold' }}>{displayQty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. OPERATIONAL AMENITIES SECTION (22 ITEMS) */}
      <div style={{ border: '1px solid #000000', marginBottom: '6px' }}>
        <div style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #000000', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '8.5px' }}>
          4. OPERATIONAL AMENITIES CHECKLIST (22 ITEMS)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px', padding: '4px', fontSize: '7px' }}>
          <div>Noor Cladding: {renderYesNo(form.amenities?.noor_cladding)}</div>
          <div>Supermarket: {renderYesNo(form.amenities?.supermarket)}</div>

          <div>Price Board & LED Price: {renderYesNo(form.amenities?.price_board_led)}</div>
          <div>Restaurant: {renderYesNo(form.amenities?.restaurant)}</div>

          <div>Wash Room for Men/Women: {renderYesNo(form.amenities?.washrooms)}</div>
          <div>Buffia: {renderYesNo(form.amenities?.buffia)}</div>

          <div>PWD Ramp & Parking: {renderYesNo(form.amenities?.pwd_ramp_parking)}</div>
          <div>Mosque Men/Women: {renderYesNo(form.amenities?.mosque)}</div>

          <div>Entrance & Exit Signage: {renderYesNo(form.amenities?.entrance_exit_signage)}</div>
          <div>Bank Machine: {renderYesNo(form.amenities?.bank_machine)}</div>

          <div>Station Office: {renderYesNo(form.amenities?.station_office)}</div>
          <div>Car Wash: {renderYesNo(form.amenities?.car_wash)}</div>

          <div>Emergency Switch: {renderYesNo(form.amenities?.emergency_switch)}</div>
          <div>Automatic Car Wash: {renderYesNo(form.amenities?.auto_car_wash)}</div>

          <div>Assembly Point: {renderYesNo(form.amenities?.assembly_point)}</div>
          <div>Buncher Shop: {renderYesNo(form.amenities?.buncher_shop)}</div>

          <div>Back Up Generator: {renderYesNo(form.amenities?.backup_generator)}</div>
          <div>Oil Change Shop: {renderYesNo(form.amenities?.oil_change_shop)}</div>

          <div>Diesel area for trucks: {renderYesNo(form.amenities?.diesel_truck_area)}</div>
          <div>Electric Vehicle Charger: {renderYesNo(form.amenities?.ev_charger)}</div>

          <div style={{ gridColumn: 'span 2' }}>
            Diesel inside Noor canopy (small car): {renderYesNo(form.amenities?.diesel_canopy_small_car)}
          </div>
          {form.amenities?.others_text && (
            <div style={{ gridColumn: 'span 2', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '2px' }}>
              Others: <span style={{ fontWeight: 'normal' }}>{form.amenities.others_text}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. MANAGEMENT APPROVAL SECTION (6 SIGNATURE BOXES) */}
      <div style={{ border: '1px solid #000000' }}>
        <div style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #000000', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '8.5px' }}>
          5. MANAGEMENT APPROVAL & SIGNATURES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', fontSize: '7px', textAlign: 'center' }}>
          {/* Box 1: Station Supervisor */}
          <div style={{ borderRight: '1px solid #000000', borderBottom: '1px solid #000000', padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Station Supervisor</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>On-Site Physical Inspection</div>
            <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{form.station_supervisor_name || 'N/A'}</div>
            {form.station_supervisor_signature_url ? (
              <img src={form.station_supervisor_signature_url} alt="Supervisor Signature" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>Signature Line</div>
            )}
          </div>

          {/* Box 2: Head of Operation */}
          <div style={{ borderRight: '1px solid #000000', borderBottom: '1px solid #000000', padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Head of Operation</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Form Creator & Submitter</div>
            <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{form.head_of_operation_name || form.created_by_name}</div>
            {form.head_of_operation_signature_url ? (
              <img src={form.head_of_operation_signature_url} alt="Head of Op Signature" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>Signed on Submission</div>
            )}
          </div>

          {/* Box 3: Safety & Quality Control */}
          <div style={{ borderBottom: '1px solid #000000', padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Safety & Quality Control</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Approver: {safetyQualityApp?.approver_name || 'Pending'}</div>
            {safetyQualityApp?.signature_url ? (
              <img src={safetyQualityApp.signature_url} alt="Safety Sig" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>{safetyQualityApp?.status === 'approved' ? 'Approved' : 'Pending Approval'}</div>
            )}
          </div>

          {/* Box 4: Document Controller */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Document Controller</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Approver: {docControllerApp?.approver_name || 'Pending'}</div>
            {docControllerApp?.signature_url ? (
              <img src={docControllerApp.signature_url} alt="Doc Controller Sig" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>{docControllerApp?.status === 'approved' ? 'Approved' : 'Pending Approval'}</div>
            )}
          </div>

          {/* Box 5: Engineering Department */}
          <div style={{ borderRight: '1px solid #000000', padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Engineering Department</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Approver: {engineeringApp?.approver_name || 'Pending'}</div>
            {engineeringApp?.signature_url ? (
              <img src={engineeringApp.signature_url} alt="Engineering Sig" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>{engineeringApp?.status === 'approved' ? 'Approved' : 'Pending Approval'}</div>
            )}
          </div>

          {/* Box 6: Al Noor United Management */}
          <div style={{ padding: '4px', minHeight: '44px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Al Noor United Management</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Approver: {managementApp?.approver_name || 'Pending'}</div>
            {managementApp?.signature_url ? (
              <img src={managementApp.signature_url} alt="Management Sig" style={{ maxHeight: '22px', margin: '2px auto 0 auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>{managementApp?.status === 'approved' ? 'Approved' : 'Pending Final Approval'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
