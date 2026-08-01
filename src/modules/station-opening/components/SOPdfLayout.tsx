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

  // Status Badge Component for PDF
  const renderStatusBadge = (val: boolean | undefined, trueText = 'Available', falseText = 'Not Available') => {
    const isTrue = val === true;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '7.5px',
          fontWeight: 'bold',
          backgroundColor: isTrue ? '#ECFDF5' : '#F1F5F9',
          color: isTrue ? '#047857' : '#475569',
          border: `1px solid ${isTrue ? '#A7F3D0' : '#CBD5E1'}`,
        }}
      >
        <span>{isTrue ? '✓' : '✕'}</span>
        <span>{isTrue ? trueText : falseText}</span>
      </span>
    );
  };

  const renderPassFailBadge = (val: boolean | undefined) => {
    const isPass = val === true;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '7.5px',
          fontWeight: 'bold',
          backgroundColor: isPass ? '#ECFDF5' : '#FEF2F2',
          color: isPass ? '#047857' : '#B91C1C',
          border: `1px solid ${isPass ? '#A7F3D0' : '#FECACA'}`,
        }}
      >
        <span>{isPass ? '✓ PASS' : '✕ PENDING'}</span>
      </span>
    );
  };

  const defaultExtinguishers = [
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

  const getFormStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'DRAFT FORM', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
      case 'pending_safety_quality': return { label: 'PENDING SAFETY & QUALITY', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      case 'pending_document_controller': return { label: 'PENDING DOC CONTROLLER', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      case 'pending_engineering': return { label: 'PENDING ENGINEERING', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      case 'pending_management': return { label: 'PENDING FINAL MANAGEMENT', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      case 'approved': return { label: 'OFFICIALLY APPROVED', bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' };
      case 'rejected': return { label: 'REJECTED', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' };
      case 'returned_for_correction': return { label: 'RETURNED FOR REVISION', bg: '#FFEDD5', color: '#9A3412', border: '#FDBA74' };
      default: return { label: status.toUpperCase().replace(/_/g, ' '), bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
  };

  const statusBadge = getFormStatusLabel(form.current_status || 'draft');

  return (
    <div
      id="station-opening-pdf-document"
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        padding: '16px 20px',
        fontSize: '8.5px',
        lineHeight: '1.3',
        margin: '0 auto',
      }}
    >
      {/* 1. EXECUTIVE REPORT COVER HEADER */}
      <div
        style={{
          borderRadius: '8px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #0284C7',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo_transparent.png"
            alt="Al Noor Logo"
            style={{ maxHeight: '44px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.5px', color: '#FFFFFF' }}>
              AL NOOR UNITED FUEL EST.
            </div>
            <div style={{ fontSize: '9px', fontWeight: '700', color: '#38BDF8' }}>
              مؤسسة النور المتحدة للوقود — Executive Technical Report
            </div>
          </div>
        </div>

        {/* REPORT TITLE & METADATA */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>
            STATION OPENING FORM
          </div>
          <div style={{ fontSize: '8px', color: '#94A3B8', marginTop: '2px', fontWeight: 'bold' }}>
            FORM NO: <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{form.form_number}</span>
          </div>
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '7.5px',
                fontWeight: '900',
                backgroundColor: statusBadge.bg,
                color: statusBadge.color,
                border: `1px solid ${statusBadge.border}`,
              }}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: STATION BASIC INFORMATION */}
      <div style={{ marginBottom: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>1. STATION BASIC INFORMATION</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 01 of 06</span>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px 12px' }}>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Station Name</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#0F172A' }}>{form.station_name || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Station Code</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#0F172A' }}>{form.station_no || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Date Started</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#0F172A' }}>{form.date_started || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Electric Meter #</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>
                {form.electric_meter_number || 'N/A'}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Location / Address</div>
              <div style={{ fontSize: '8.5px', fontWeight: '700', color: '#0F172A' }}>{form.address || 'Saudi Arabia'}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>Head of Operation (Creator)</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0369A1' }}>
                {form.head_of_operation_name || form.created_by_name || 'N/A'}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}
          >
            <div>
              <span style={{ color: '#64748B', fontWeight: 'bold' }}>ATM Machine: </span>
              {renderStatusBadge(form.atm_machine === 'Available', 'Available', 'Not Available')}
            </div>
            <div>
              <span style={{ color: '#64748B', fontWeight: 'bold' }}>Noor Khoy Machine: </span>
              {renderStatusBadge(form.noor_khoy_machine === 'Installed', 'Installed', 'Not Installed')}
            </div>
            <div>
              <span style={{ color: '#64748B', fontWeight: 'bold' }}>Staff House: </span>
              {renderStatusBadge(form.staff_house === 'Available', 'Available', 'Not Available')}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: FUEL PUMPS & PRODUCT TANKS SPECIFICATIONS */}
      <div style={{ marginBottom: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>2. FUEL PUMPS & PRODUCT TANKS SPECIFICATIONS</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 02 of 06</span>
        </div>

        <div style={{ padding: '8px 12px' }}>
          {/* Executive Overview Summary Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '8px',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '6px',
              padding: '6px 10px',
              marginBottom: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '7px', color: '#0369A1', fontWeight: 'bold' }}>Brand of Fuel Pump</div>
              <div style={{ fontSize: '9px', fontWeight: '900', color: '#0C4A6E' }}>{form.brand_of_fuel_pump || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', color: '#0369A1', fontWeight: 'bold' }}>No. of Fuel Pumps</div>
              <div style={{ fontSize: '9px', fontWeight: '900', color: '#0C4A6E' }}>{form.no_of_fuel_pump || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', color: '#0369A1', fontWeight: 'bold' }}>Total Nozzles Count</div>
              <div style={{ fontSize: '9px', fontWeight: '900', color: '#0C4A6E' }}>{totalNozzles} Nozzles</div>
            </div>
            <div>
              <div style={{ fontSize: '7px', color: '#0369A1', fontWeight: 'bold' }}>Automation Enabled</div>
              <div>{renderStatusBadge(form.automation_enabled, 'Yes (Automated)', 'No (Manual)')}</div>
            </div>
          </div>

          {/* Tanks & Fuel Specification Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', marginBottom: '8px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1E293B', color: '#FFFFFF', textAlign: 'left' }}>
                <th style={{ padding: '5px 8px', borderRadius: '4px 0 0 0' }}>Fuel Product Type</th>
                <th style={{ padding: '5px 8px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '5px 8px', textAlign: 'center' }}>Tank Capacity (Liters)</th>
                <th style={{ padding: '5px 8px', textAlign: 'center', borderRadius: '0 4px 0 0' }}>No. of Tanks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'PETROL_91', name: 'Petrol 91 (Octane 91)', color: '#047857' },
                { key: 'PETROL_95', name: 'Petrol 95 (Octane 95)', color: '#B91C1C' },
                { key: 'DIESEL', name: 'Diesel Fuel', color: '#B45309' },
                { key: 'KEROSENE', name: 'Kerosene Fuel', color: '#475569' },
              ].map((fuel, idx) => {
                const tank = getTank(fuel.key);
                const isAvail = Boolean(tank?.is_available);
                return (
                  <tr key={fuel.key} style={{ backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '4px 8px', fontWeight: '800', color: fuel.color }}>{fuel.name}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                      {renderStatusBadge(isAvail, 'Available', 'Not Available')}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: '800', fontFamily: 'monospace' }}>
                      {tank?.tank_capacity ? `${tank.tank_capacity.toLocaleString()} L` : '0 L'}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: '800' }}>
                      {tank?.no_of_tanks || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Nozzle Details Breakdown Sub-Table */}
          <div style={{ fontSize: '8px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            NOZZLE DISTRIBUTION & PUMP ASSIGNMENTS:
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#E2E8F0', color: '#0F172A', fontWeight: '800' }}>
                <th style={{ padding: '4px 8px', textAlign: 'left' }}>Fuel Line Breakdown</th>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>Total Nozzles</th>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>No. of Dedicated Pumps</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'PETROL_91', name: 'Petrol 91', color: '#047857' },
                { key: 'PETROL_95', name: 'Petrol 95', color: '#B91C1C' },
                { key: 'DIESEL', name: 'Diesel', color: '#B45309' },
                { key: 'COMBINED', name: 'Combined Petrol & Diesel', color: '#0F172A' },
                { key: 'KEROSENE', name: 'Kerosene', color: '#475569' },
              ].map((nItem) => {
                const noz = getNozzle(nItem.key);
                return (
                  <tr key={nItem.key} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '3px 8px', fontWeight: '700', color: nItem.color }}>{nItem.name}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: '800', fontFamily: 'monospace' }}>
                      {noz?.quantity || 0}
                    </td>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: '800' }}>
                      {noz?.no_of_pumps || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECTION 3: SAFETY EQUIPMENT & INSPECTION */}
      <div style={{ marginBottom: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>3. SAFETY EQUIPMENT & TANK SAFETY INSPECTION</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 03 of 06</span>
        </div>

        <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
          {/* Left: Primary Safety & Tank Checklist */}
          <div>
            <div style={{ fontSize: '8px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              PRIMARY FIRE SUPPRESSION & PIPING SYSTEMS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Fire Pump</span>
                {renderPassFailBadge(form.safety_equipment?.fire_pump)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Water Tanks</span>
                {renderPassFailBadge(form.safety_equipment?.water_tanks)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', backgroundColor: '#F8FAFC', borderRadius: '4px', gridColumn: 'span 2' }}>
                <span style={{ fontWeight: 'bold' }}>Fire Pump Backup Battery</span>
                {renderPassFailBadge(form.safety_equipment?.battery_for_fire_pump)}
              </div>
            </div>

            <div style={{ fontSize: '8px', fontWeight: '800', color: '#0F172A', marginTop: '8px', marginBottom: '4px' }}>
              TANK ACCESSORIES & PIPING SAFETY:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Earthing Cable:</span>
                {renderPassFailBadge(form.safety_equipment?.earthing_cable)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hose & Couplings:</span>
                {renderPassFailBadge(form.safety_equipment?.hose_couplings)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Vent Air Pipes:</span>
                {renderPassFailBadge(form.safety_equipment?.vent_air_pipes)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Color Coding (G-R-B-K):</span>
                {renderPassFailBadge(form.safety_equipment?.color_coding)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gridColumn: 'span 2' }}>
                <span>Tank with Sand Backfill:</span>
                {renderPassFailBadge(form.safety_equipment?.sand_backfill)}
              </div>
            </div>
          </div>

          {/* Right: Fire Hose Cabinet Locations */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '8px', fontWeight: '800', color: '#0F172A', marginBottom: '4px', textAlign: 'center' }}>
              FIRE HOSE CABINET LOCATIONS (1 - 12)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: '7.5px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFFFFF', padding: '2px 4px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontWeight: '900', color: '#0369A1', width: '16px' }}>{i + 1}.</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>
                    {form.safety_equipment?.fire_hose_cabinet_locations?.[i] || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION 4: FIRE EXTINGUISHERS & SAFETY ITEMS */}
      <div style={{ marginBottom: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>4. FIRE EXTINGUISHERS & SAFETY ITEMS</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 04 of 06</span>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1E293B', color: '#FFFFFF', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px' }}>Equipment / Item Description</th>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>Weight / Volume</th>
                <th style={{ padding: '4px 8px', textAlign: 'center' }}>Status / Quantity</th>
              </tr>
            </thead>
            <tbody>
              {extinguishersList.map((ext, idx) => {
                const isYesNoItem = ['6', '7', '8', '9'].includes(ext.id) || ['Sand Bucket', 'Traffic Cone', 'Waste Bin', 'CCTV 24/7 Monitoring'].some(n => ext.name.includes(n));
                const isAvailable = (ext.quantity > 0) || Boolean(ext.is_available);

                return (
                  <tr key={ext.id} style={{ backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '3.5px 8px', fontWeight: '800', color: '#0F172A' }}>{ext.name}</td>
                    <td style={{ padding: '3.5px 8px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                      {ext.weight_volume || 'Standard'}
                    </td>
                    <td style={{ padding: '3.5px 8px', textAlign: 'center' }}>
                      {isYesNoItem ? (
                        renderStatusBadge(isAvailable, 'Available', 'Not Available')
                      ) : (
                        <span style={{ fontWeight: '900', fontFamily: 'monospace', color: '#0F172A' }}>
                          {ext.quantity} Units
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. SECTION 5: OPERATIONAL AMENITIES CHECKLIST */}
      <div style={{ marginBottom: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>5. OPERATIONAL AMENITIES CHECKLIST (22 ITEMS)</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 05 of 06</span>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px 10px', fontSize: '7.5px' }}>
            {[
              { label: 'Noor Cladding', val: form.amenities?.noor_cladding },
              { label: 'Price Board & LED', val: form.amenities?.price_board_led },
              { label: 'Washrooms (Men/Women)', val: form.amenities?.washrooms },
              { label: 'PWD Ramp & Parking', val: form.amenities?.pwd_ramp_parking },
              { label: 'Entrance & Exit Signage', val: form.amenities?.entrance_exit_signage },
              { label: 'Station Office', val: form.amenities?.station_office },
              { label: 'Emergency Switch', val: form.amenities?.emergency_switch },
              { label: 'Assembly Point', val: form.amenities?.assembly_point },
              { label: 'Back Up Generator', val: form.amenities?.backup_generator },
              { label: 'Diesel Area (Trucks)', val: form.amenities?.diesel_truck_area },
              { label: 'Diesel Canopy (Cars)', val: form.amenities?.diesel_canopy_small_car },
              { label: 'Supermarket', val: form.amenities?.supermarket },
              { label: 'Restaurant', val: form.amenities?.restaurant },
              { label: 'Buffia', val: form.amenities?.buffia },
              { label: 'Mosque (Men/Women)', val: form.amenities?.mosque },
              { label: 'Bank Machine (ATM)', val: form.amenities?.bank_machine },
              { label: 'Car Wash', val: form.amenities?.car_wash },
              { label: 'Automatic Car Wash', val: form.amenities?.auto_car_wash },
              { label: 'Buncher Shop', val: form.amenities?.buncher_shop },
              { label: 'Oil Change Shop', val: form.amenities?.oil_change_shop },
              { label: 'Electric Vehicle Charger', val: form.amenities?.ev_charger },
            ].map((amenity, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <span style={{ fontWeight: '700', color: '#0F172A' }}>{amenity.label}</span>
                {renderStatusBadge(amenity.val, 'Available', 'N/A')}
              </div>
            ))}
          </div>

          {form.amenities?.others_text && (
            <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #E2E8F0', fontSize: '7.5px' }}>
              <strong>Other Amenities Notes: </strong>
              <span style={{ color: '#475569' }}>{form.amenities.others_text}</span>
            </div>
          )}
        </div>
      </div>

      {/* 7. SECTION 6: MANAGEMENT APPROVAL MATRIX & SIGNATURES */}
      <div style={{ borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '5px 10px',
            fontSize: '8.5px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>6. MANAGEMENT APPROVAL MATRIX & OFFICIAL SIGN-OFF</span>
          <span style={{ fontSize: '7.5px', color: '#38BDF8', fontWeight: 'bold' }}>Section 06 of 06</span>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {/* Box 1: Station Supervisor */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Station Supervisor</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {form.station_supervisor_name || 'N/A'}
              </div>
              <div style={{ fontSize: '6.5px', color: '#047857', fontWeight: 'bold', marginTop: '1px' }}>
                ✓ On-Site Physical Inspection
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.station_supervisor_signature_url ? (
                  <img src={form.station_supervisor_signature_url} alt="Supervisor Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>Signed on Paper</span>
                )}
              </div>
            </div>

            {/* Box 2: Head of Operation */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Head of Operation</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {form.head_of_operation_name || form.created_by_name || 'N/A'}
              </div>
              <div style={{ fontSize: '6.5px', color: '#047857', fontWeight: 'bold', marginTop: '1px' }}>
                ✓ Form Creator & Submitter
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.head_of_operation_signature_url ? (
                  <img src={form.head_of_operation_signature_url} alt="Head of Op Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>Signed on Submission</span>
                )}
              </div>
            </div>

            {/* Box 3: Safety & Quality Control */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Safety & Quality Control</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {safetyQualityApp?.approver_name || 'Pending Approver'}
              </div>
              <div style={{ fontSize: '6.5px', color: safetyQualityApp?.status === 'approved' ? '#047857' : '#D97706', fontWeight: 'bold', marginTop: '1px' }}>
                {safetyQualityApp?.status === 'approved' ? '✓ Stage Approved' : '⏳ Pending Stage'}
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {safetyQualityApp?.signature_url ? (
                  <img src={safetyQualityApp.signature_url} alt="Safety Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>
                    {safetyQualityApp?.status === 'approved' ? 'Approved' : 'Pending Signature'}
                  </span>
                )}
              </div>
            </div>

            {/* Box 4: Document Controller */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Document Controller</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {docControllerApp?.approver_name || 'Pending Approver'}
              </div>
              <div style={{ fontSize: '6.5px', color: docControllerApp?.status === 'approved' ? '#047857' : '#D97706', fontWeight: 'bold', marginTop: '1px' }}>
                {docControllerApp?.status === 'approved' ? '✓ Stage Approved' : '⏳ Pending Stage'}
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {docControllerApp?.signature_url ? (
                  <img src={docControllerApp.signature_url} alt="Doc Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>
                    {docControllerApp?.status === 'approved' ? 'Approved' : 'Pending Signature'}
                  </span>
                )}
              </div>
            </div>

            {/* Box 5: Engineering Department */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Engineering Department</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {engineeringApp?.approver_name || 'Pending Approver'}
              </div>
              <div style={{ fontSize: '6.5px', color: engineeringApp?.status === 'approved' ? '#047857' : '#D97706', fontWeight: 'bold', marginTop: '1px' }}>
                {engineeringApp?.status === 'approved' ? '✓ Stage Approved' : '⏳ Pending Stage'}
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {engineeringApp?.signature_url ? (
                  <img src={engineeringApp.signature_url} alt="Engineering Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>
                    {engineeringApp?.status === 'approved' ? 'Approved' : 'Pending Signature'}
                  </span>
                )}
              </div>
            </div>

            {/* Box 6: Al Noor United Management */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px', backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Al Noor United Management</div>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {managementApp?.approver_name || 'Pending Approver'}
              </div>
              <div style={{ fontSize: '6.5px', color: managementApp?.status === 'approved' ? '#047857' : '#D97706', fontWeight: 'bold', marginTop: '1px' }}>
                {managementApp?.status === 'approved' ? '✓ Final Approval Granted' : '⏳ Pending Final Approval'}
              </div>
              <div style={{ marginTop: '6px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {managementApp?.signature_url ? (
                  <img src={managementApp.signature_url} alt="Management Sig" style={{ maxHeight: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '7px', color: '#94A3B8', fontStyle: 'italic' }}>
                    {managementApp?.status === 'approved' ? 'Approved' : 'Pending Signature'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Official Document Footer Notice */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '6px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '7px',
              color: '#64748B',
            }}
          >
            <div>
              © 2026 Al Noor United Fuel Est. (مؤسسة النور المتحدة للوقود) — Official Executive Report
            </div>
            <div>
              Generated on: <span style={{ fontWeight: 'bold', color: '#0F172A' }}>{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
