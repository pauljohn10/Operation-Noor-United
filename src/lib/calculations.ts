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
  const activePumps = fuelItems.filter((i) => Number(i.pump_no) < 15);
  const totalItem = fuelItems.find((i) => Number(i.pump_no) === 15);

  const currentPrice = fuelItems[0]?.price || priceFallback;

  // Sum Closing Readings of active pumps (Pump 1 through Pump 14)
  let sumEndReadings = 0;
  activePumps.forEach((item) => {
    if (item.end_reading != null) {
      const closing = Number(item.end_reading);
      if (!isNaN(closing)) {
        sumEndReadings += closing;
      }
    }
  });

  const autoClosing = Number(sumEndReadings.toFixed(2));
  let totalQty = 0;
  let totalSales = 0;
  let manualOpening: number | null = null;

  if (totalItem) {
    // Synchronize Total row (Pump 15) closing reading with auto-calculated sum
    totalItem.end_reading = autoClosing;

    if (totalItem.start_reading != null) {
      const s = Number(totalItem.start_reading);
      if (!isNaN(s)) {
        manualOpening = s;
        if (autoClosing != null) {
          totalQty = Math.max(0, Number((autoClosing - s).toFixed(2)));
          totalSales = Number((totalQty * (totalItem.price || currentPrice)).toFixed(2));
          totalItem.quantity_sold = totalQty;
          totalItem.amount = totalSales;
        }
      }
    } else {
      if (totalItem.quantity_sold != null) totalQty = Number(totalItem.quantity_sold);
      if (totalItem.amount != null) totalSales = Number(totalItem.amount);
    }
  }

  return {
    fuel_type: fuelType,
    total_quantity: Number(totalQty.toFixed(2)),
    price: currentPrice,
    total_sales: Number(totalSales.toFixed(2)),
    total_opening_reading: manualOpening,
    final_closing_reading: autoClosing,
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
