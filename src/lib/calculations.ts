import type { PumpReadingItem, FuelType, FuelSectionTotals } from '../types/audit';

export const DEFAULT_FUEL_PRICES: Record<FuelType, number> = {
  PETROL_91: 2.18,
  PETROL_95: 2.33,
  DIESEL: 1.15,
};

export function calculateFuelSectionTotals(
  items: PumpReadingItem[],
  fuelType: FuelType,
  priceFallback: number
): FuelSectionTotals {
  const fuelItems = items.filter((i) => i.fuel_type === fuelType);

  let totalQty = 0;
  let totalSales = 0;
  const currentPrice = fuelItems[0]?.price || priceFallback;

  fuelItems.forEach((item) => {
    let qty = 0;
    let amt = 0;

    // Pump 15 ONLY uses automatic calculation when both readings are provided
    if (item.pump_no === 15) {
      if (item.start_reading != null && item.end_reading != null) {
        const start = Number(item.start_reading);
        const end = Number(item.end_reading);
        if (!isNaN(start) && !isNaN(end)) {
          qty = Math.max(0, end - start);
          amt = Number((qty * (item.price || currentPrice)).toFixed(2));
        }
      }
    } else {
      if (item.quantity_sold != null) {
        const q = Number(item.quantity_sold);
        if (!isNaN(q)) qty = q;
      }
      if (item.amount != null) {
        const a = Number(item.amount);
        if (!isNaN(a)) amt = a;
      }
    }

    totalQty += qty;
    totalSales += amt;
  });

  return {
    fuel_type: fuelType,
    total_quantity: Number(totalQty.toFixed(2)),
    price: currentPrice,
    total_sales: Number(totalSales.toFixed(2)),
  };
}

export function calculateAuditTotals(
  items: PumpReadingItem[],
  prices: Record<FuelType, number>,
  noorKhoy?: number | null,
  atm?: number | null,
  cashReceived?: number | null
) {
  const p91 = calculateFuelSectionTotals(items, 'PETROL_91', prices.PETROL_91);
  const p95 = calculateFuelSectionTotals(items, 'PETROL_95', prices.PETROL_95);
  const diesel = calculateFuelSectionTotals(items, 'DIESEL', prices.DIESEL);

  const grandTotalSales = Number(
    (p91.total_sales + p95.total_sales + diesel.total_sales).toFixed(2)
  );

  const grandTotalQuantity = Number(
    (p91.total_quantity + p95.total_quantity + diesel.total_quantity).toFixed(2)
  );

  const nk = noorKhoy != null ? Number(noorKhoy) : 0;
  const at = atm != null ? Number(atm) : 0;
  const cr = cashReceived != null ? Number(cashReceived) : 0;

  const expectedCash = Number(
    Math.max(0, grandTotalSales - (nk + at)).toFixed(2)
  );

  const discrepancy = cashReceived != null ? Number((cr - expectedCash).toFixed(2)) : 0;

  return {
    p91,
    p95,
    diesel,
    grandTotalSales,
    grandTotalQuantity,
    expectedCash,
    discrepancy,
  };
}

export function formatCurrency(amount?: number | null): string {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num?: number | null): string {
  if (num == null || isNaN(num)) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
