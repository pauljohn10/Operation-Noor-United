import React from 'react';
import type { PumpReadingItem, FuelType } from '../../types/audit';
import { calculateFuelSectionTotals, formatCurrency, formatNumber, formatMeterReading, DEFAULT_FUEL_PRICES } from '../../lib/calculations';

interface Props {
  audit: any;
  items: PumpReadingItem[];
  prices?: Record<FuelType, number>;
}

export const StationAuditPdfLayout: React.FC<Props> = ({ audit, items, prices }) => {
  const effectivePrices: Record<FuelType, number> = {
    PETROL_91:
      prices?.PETROL_91 ||
      audit.p91_price ||
      items.find((i) => i.fuel_type === 'PETROL_91' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.PETROL_91,
    PETROL_95:
      prices?.PETROL_95 ||
      audit.p95_price ||
      items.find((i) => i.fuel_type === 'PETROL_95' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.PETROL_95,
    DIESEL:
      prices?.DIESEL ||
      audit.diesel_price ||
      items.find((i) => i.fuel_type === 'DIESEL' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.DIESEL,
  };

  const getFuelItems = (type: FuelType): PumpReadingItem[] => {
    const list = items.filter((i) => i.fuel_type === type);
    const existingPumpsMap = new Map<number, PumpReadingItem>();
    list.forEach((item) => existingPumpsMap.set(item.pump_no, item));

    const completeList: PumpReadingItem[] = [];
    for (let p = 1; p <= 14; p++) {
      if (existingPumpsMap.has(p)) {
        completeList.push(existingPumpsMap.get(p)!);
      } else {
        completeList.push({
          id: `virtual-${type}-${p}`,
          audit_id: audit.id || '',
          fuel_type: type,
          pump_no: p,
          start_reading: null,
          end_reading: null,
          quantity_sold: null,
          price: effectivePrices[type],
          amount: null,
        } as PumpReadingItem);
      }
    }
    return completeList;
  };

  const p91Totals = calculateFuelSectionTotals(items, 'PETROL_91', effectivePrices.PETROL_91);
  const p95Totals = calculateFuelSectionTotals(items, 'PETROL_95', effectivePrices.PETROL_95);
  const dieselTotals = calculateFuelSectionTotals(items, 'DIESEL', effectivePrices.DIESEL);

  const grandTotalSales = p91Totals.total_sales + p95Totals.total_sales + dieselTotals.total_sales;

  function renderFuelTable(
    title: string,
    headerBg: string,
    fuelItems: PumpReadingItem[],
    sectionTotals: any
  ) {
    return (
      <div style={{ marginBottom: '4px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '8.5px',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={7}
                style={{
                  backgroundColor: headerBg,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  padding: '2px 4px',
                  textAlign: 'center',
                  border: '1px solid #000000',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </th>
            </tr>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ width: '8%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Pump No.
              </th>
              <th style={{ width: '17%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Start Reading
              </th>
              <th style={{ width: '17%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                End Reading
              </th>
              <th style={{ width: '16%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Quantity Sold
              </th>
              <th style={{ width: '16%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Amount
              </th>
              <th style={{ width: '13%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Price
              </th>
              <th style={{ width: '13%', border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                Total Sales
              </th>
            </tr>
          </thead>
          <tbody>
            {fuelItems.map((item, index) => {
              const pumpNo = item.pump_no;
              const isFirstRow = index === 0;

              return (
                <tr key={pumpNo}>
                  <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontWeight: 900 }}>
                    {pumpNo}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
                    {item.start_reading != null ? formatMeterReading(item.start_reading) : '-'}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
                    {item.end_reading != null ? formatMeterReading(item.end_reading) : '-'}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900 }}>
                    {item.quantity_sold != null ? `${formatNumber(item.quantity_sold)} L` : '-'}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900 }}>
                    {item.amount != null ? formatCurrency(item.amount) : '-'}
                  </td>

                  {isFirstRow && (
                    <td
                      rowSpan={15}
                      style={{
                        border: '1px solid #000000',
                        padding: '4px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ fontSize: '7px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>UNIT PRICE</span>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', margin: '2px 0' }}>
                          {sectionTotals.price.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '6.5px', fontWeight: 700, color: '#64748b' }}>SAR / Liter</span>
                      </div>
                    </td>
                  )}

                  {isFirstRow && (
                    <td
                      rowSpan={15}
                      style={{
                        border: '1px solid #000000',
                        padding: '4px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ fontSize: '7px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>{title} TOTAL</span>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', margin: '2px 0' }}>
                          {formatCurrency(sectionTotals.total_sales)}
                        </span>
                        <span style={{ fontSize: '6.5px', fontWeight: 700, color: '#64748b' }}>SAR</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* TOTAL SUMMARY ROW */}
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 900 }}>
              <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', color: '#1e40af', textTransform: 'uppercase' }}>
                TOTAL
              </td>
              <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace' }}>
                {sectionTotals.total_opening_reading != null ? formatMeterReading(sectionTotals.total_opening_reading) : '-'}
              </td>
              <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace' }}>
                {formatMeterReading(sectionTotals.final_closing_reading)}
              </td>
              <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace' }}>
                {sectionTotals.total_quantity > 0 ? `${formatNumber(sectionTotals.total_quantity)} L` : '-'}
              </td>
              <td style={{ border: '1px solid #000000', padding: '1px 2px', textAlign: 'center', fontFamily: 'monospace' }}>
                {sectionTotals.total_sales > 0 ? formatCurrency(sectionTotals.total_sales) : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '4px 8px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.15,
        WebkitTextSizeAdjust: '100%',
      }}
    >
      {/* 1. HEADER SECTION */}
      <div style={{ marginBottom: '4px', borderBottom: '2px solid #000000', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ width: '120px' }}>
            {audit.company_logo_url ? (
              <img
                src={audit.company_logo_url}
                alt="Logo"
                style={{ height: '55px', maxHeight: '55px', width: 'auto', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a' }}>Al Noor United</div>
            )}
          </div>

          {/* Titles */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#000000' }}>مؤسسة النور المتحدة للوقود</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#000000', letterSpacing: '0.5px' }}>AL NOOR UNITED FUEL EST.</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#000000', marginTop: '1px' }}>تقرير السيطرة على خسائر الوقود والتحقيق فيها</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#000000' }}>Fuel Losses Control & Investigation Report</div>
          </div>

          <div style={{ width: '120px' }}></div>
        </div>
      </div>

      {/* 2. METADATA GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '4px',
          borderBottom: '1px solid #000000',
          paddingBottom: '3px',
          fontSize: '9px',
          fontWeight: 700,
        }}
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontWeight: 900 }}>Date :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '4px' }}>{audit.audit_date || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontWeight: 900 }}>Station No. :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '4px' }}>{audit.station_number || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontWeight: 900 }}>Station Name :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '4px' }}>{audit.station_name || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontWeight: 900 }}>City / Location :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '4px' }}>{audit.city || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontWeight: 900 }}>Audit Number :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '4px', fontWeight: 900 }}>{audit.audit_number || 'N/A'}</span>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>Total Sales :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace', fontWeight: 900 }}>
              {formatCurrency(grandTotalSales)} SAR
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>Noor Khoy :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace', fontWeight: 900 }}>
              {audit.noor_khoy_amount != null ? `${formatCurrency(audit.noor_khoy_amount)} SAR` : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>ATM :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace', fontWeight: 900 }}>
              {audit.atm_amount != null ? `${formatCurrency(audit.atm_amount)} SAR` : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>Cash :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace', fontWeight: 900 }}>
              {audit.cash_amount != null ? `${formatCurrency(audit.cash_amount)} SAR` : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>Cash Received :</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000000', textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace', fontWeight: 900 }}>
              {audit.cash_received_amount != null ? `${formatCurrency(audit.cash_received_amount)} SAR` : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '110px', fontWeight: 900 }}>Discrepancy :</span>
            <span
              style={{
                flex: 1,
                borderBottom: '1px solid #000000',
                textAlign: 'right',
                paddingRight: '4px',
                fontFamily: 'monospace',
                fontWeight: 900,
                color: (audit.discrepancy_amount || 0) < 0 ? '#dc2626' : (audit.discrepancy_amount || 0) > 0 ? '#16a34a' : '#000000',
              }}
            >
              {audit.discrepancy_amount != null ? `${formatCurrency(audit.discrepancy_amount)} SAR` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FUEL SECTIONS & PUMP TABLES */}
      {renderFuelTable('PETROL 91', '#00a651', getFuelItems('PETROL_91'), p91Totals)}
      {renderFuelTable('PETROL 95', '#ed1c24', getFuelItems('PETROL_95'), p95Totals)}
      {renderFuelTable('DIESEL', '#d99b00', getFuelItems('DIESEL'), dieselTotals)}

      {/* 4. NOTES & SHORTAGE RESPONSIBILITY SECTION */}
      <div style={{ marginBottom: '4px', padding: '4px 6px', border: '1px solid #000000', fontSize: '9px', fontWeight: 700, backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '3px', borderBottom: '1px solid #94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <span style={{ fontWeight: 900, textTransform: 'uppercase', marginRight: '6px' }}>PERSON RESPONSIBLE :</span>
            <span style={{ borderBottom: '1px solid #000000', padding: '0 4px', flex: 1 }}>{audit.person_responsible_for_shortage || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', width: '220px', marginLeft: '12px' }}>
            <span style={{ fontWeight: 900, textTransform: 'uppercase', marginRight: '6px' }}>SHORTAGE AMOUNT :</span>
            <span style={{ borderBottom: '1px solid #000000', padding: '0 4px', fontFamily: 'monospace', fontWeight: 900, flex: 1 }}>
              {audit.shortage_amount != null ? `${formatCurrency(audit.shortage_amount)} SAR` : '0.00 SAR'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '3px' }}>
          <span style={{ fontWeight: 900, textTransform: 'uppercase', marginRight: '6px' }}>NOTES / REMARKS :</span>
          <span style={{ borderBottom: '1px solid #000000', padding: '0 4px', flex: 1 }}>{audit.notes || 'N/A'}</span>
        </div>
      </div>

      {/* 5. AUTHORIZATION & INSPECTION SIGNATURES */}
      <div style={{ marginTop: '4px' }}>
        <div style={{ textAlign: 'center', fontSize: '8.5px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>
          AUTHORIZATION & INSPECTION SIGNATURES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {/* Station Supervisor */}
          <div style={{ border: '1px solid #000000', padding: '3px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px' }}>
              Station Supervisor
            </div>
            {audit.station_supervisor_signature_url ? (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src={audit.station_supervisor_signature_url} alt="Signature" style={{ maxHeight: '20px', objectFit: 'contain' }} />
                <div style={{ fontSize: '7.5px', fontWeight: 700 }}>{audit.station_supervisor_name || 'Station Supervisor'}</div>
                <div style={{ fontSize: '6.5px', color: '#64748b' }}>On-Site Signatory</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>

          {/* Operation Supervisor */}
          <div style={{ border: '1px solid #000000', padding: '3px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px' }}>
              Operation Supervisor
            </div>
            {audit.operation_supervisor_signature_url ? (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src={audit.operation_supervisor_signature_url} alt="Signature" style={{ maxHeight: '20px', objectFit: 'contain' }} />
                <div style={{ fontSize: '7.5px', fontWeight: 700 }}>{audit.created_by_name || 'Operation Supervisor'}</div>
                <div style={{ fontSize: '6.5px', color: '#64748b' }}>Operations Supervisor</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>

          {/* Accountant */}
          <div style={{ border: '1px solid #000000', padding: '3px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px' }}>
              Accountant
            </div>
            {audit.accountant_signature_url ? (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src={audit.accountant_signature_url} alt="Signature" style={{ maxHeight: '20px', objectFit: 'contain' }} />
                <div style={{ fontSize: '7.5px', fontWeight: 700 }}>{audit.accountant_name || 'Accountant'}</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>

          {/* Account Manager */}
          <div style={{ border: '1px solid #000000', padding: '3px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px' }}>
              Account Manager
            </div>
            {audit.account_manager_signature_url ? (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src={audit.account_manager_signature_url} alt="Signature" style={{ maxHeight: '20px', objectFit: 'contain' }} />
                <div style={{ fontSize: '7.5px', fontWeight: 700 }}>{audit.account_manager_name || 'Account Manager'}</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>

          {/* Executive Management */}
          <div style={{ border: '1px solid #000000', padding: '3px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px' }}>
              Executive Management
            </div>
            {audit.executive_management_signature_url ? (
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src={audit.executive_management_signature_url} alt="Signature" style={{ maxHeight: '20px', objectFit: 'contain' }} />
                <div style={{ fontSize: '7.5px', fontWeight: 700 }}>{audit.executive_management_name || 'Executive Management'}</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
