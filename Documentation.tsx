import type { RetailRow } from './generator';

// ─── Core KPIs ────────────────────────────────────────────────────────────────

export interface KPIs {
  totalSales: number;
  totalProfit: number;
  totalCost: number;
  totalOrders: number;
  totalCustomers: number;
  totalQuantity: number;
  profitMargin: number;
  avgOrderValue: number;
  avgDiscount: number;
  repeatCustomerRate: number;
  clv: number;
  returnOnSales: number;
}

export function computeKPIs(data: RetailRow[]): KPIs {
  if (data.length === 0) {
    return { totalSales: 0, totalProfit: 0, totalCost: 0, totalOrders: 0, totalCustomers: 0, totalQuantity: 0, profitMargin: 0, avgOrderValue: 0, avgDiscount: 0, repeatCustomerRate: 0, clv: 0, returnOnSales: 0 };
  }
  const totalSales = data.reduce((s, r) => s + r.sales, 0);
  const totalProfit = data.reduce((s, r) => s + r.profit, 0);
  const totalCost = data.reduce((s, r) => s + r.cost, 0);
  const totalOrders = data.length;
  const totalQuantity = data.reduce((s, r) => s + r.quantity, 0);
  const avgDiscount = data.reduce((s, r) => s + r.discount, 0) / data.length;

  const customerOrders: Record<string, number> = {};
  for (const r of data) {
    customerOrders[r.customerId] = (customerOrders[r.customerId] || 0) + 1;
  }
  const totalCustomers = Object.keys(customerOrders).length;
  const repeatCustomers = Object.values(customerOrders).filter(c => c > 1).length;
  const repeatCustomerRate = totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;

  const profitMargin = totalSales > 0 ? totalProfit / totalSales : 0;
  const avgOrderValue = totalSales / totalOrders;
  const clv = totalCustomers > 0 ? totalSales / totalCustomers : 0;
  const returnOnSales = totalSales > 0 ? totalProfit / totalSales : 0;

  return { totalSales, totalProfit, totalCost, totalOrders, totalCustomers, totalQuantity, profitMargin, avgOrderValue, avgDiscount, repeatCustomerRate, clv, returnOnSales };
}

// ─── Monthly Trend ────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  month: string;
  year: number;
  label: string;
  sales: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
}

export function getMonthlyTrend(data: RetailRow[]): MonthlyPoint[] {
  const map: Record<string, MonthlyPoint> = {};
  for (const r of data) {
    const d = new Date(r.orderDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!map[key]) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      map[key] = { month: key, year, label: `${months[month - 1]} ${year}`, sales: 0, profit: 0, orders: 0, avgOrderValue: 0 };
    }
    map[key].sales += r.sales;
    map[key].profit += r.profit;
    map[key].orders += 1;
  }
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(p => ({ ...p, sales: Math.round(p.sales), profit: Math.round(p.profit), avgOrderValue: p.orders > 0 ? Math.round(p.sales / p.orders) : 0 }));
}

// ─── Year-over-Year ───────────────────────────────────────────────────────────

export interface YoYPoint {
  month: string;
  sales2022: number;
  sales2023: number;
  sales2024: number;
}

export function getYoYComparison(data: RetailRow[]): YoYPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map: Record<string, YoYPoint> = {};
  for (let i = 0; i < 12; i++) {
    map[months[i]] = { month: months[i], sales2022: 0, sales2023: 0, sales2024: 0 };
  }
  for (const r of data) {
    const d = new Date(r.orderDate);
    const m = months[d.getMonth()];
    const y = d.getFullYear();
    if (y === 2022) map[m].sales2022 += r.sales;
    else if (y === 2023) map[m].sales2023 += r.sales;
    else if (y === 2024) map[m].sales2024 += r.sales;
  }
  return months.map(m => ({
    ...map[m],
    sales2022: Math.round(map[m].sales2022),
    sales2023: Math.round(map[m].sales2023),
    sales2024: Math.round(map[m].sales2024),
  }));
}

// ─── Running Total ────────────────────────────────────────────────────────────

export function getRunningTotal(data: RetailRow[]): { label: string; running: number }[] {
  const monthly = getMonthlyTrend(data);
  let running = 0;
  return monthly.map(p => {
    running += p.sales;
    return { label: p.label, running: Math.round(running) };
  });
}

// ─── Monthly Growth % ─────────────────────────────────────────────────────────

export function getMonthlyGrowth(data: RetailRow[]): { label: string; growth: number }[] {
  const monthly = getMonthlyTrend(data);
  return monthly.map((p, i) => {
    if (i === 0) return { label: p.label, growth: 0 };
    const prev = monthly[i - 1].sales;
    const growth = prev > 0 ? ((p.sales - prev) / prev) * 100 : 0;
    return { label: p.label, growth: Math.round(growth * 10) / 10 };
  });
}

// ─── Category Performance ─────────────────────────────────────────────────────

export interface CategoryPerf {
  category: string;
  sales: number;
  profit: number;
  margin: number;
  orders: number;
  quantity: number;
  avgPrice: number;
}

export function getCategoryPerformance(data: RetailRow[]): CategoryPerf[] {
  const map: Record<string, CategoryPerf> = {};
  for (const r of data) {
    if (!map[r.productCategory]) {
      map[r.productCategory] = { category: r.productCategory, sales: 0, profit: 0, margin: 0, orders: 0, quantity: 0, avgPrice: 0 };
    }
    map[r.productCategory].sales += r.sales;
    map[r.productCategory].profit += r.profit;
    map[r.productCategory].orders += 1;
    map[r.productCategory].quantity += r.quantity;
  }
  return Object.values(map)
    .map(c => ({
      ...c,
      sales: Math.round(c.sales),
      profit: Math.round(c.profit),
      margin: c.sales > 0 ? Math.round((c.profit / c.sales) * 1000) / 10 : 0,
      avgPrice: c.orders > 0 ? Math.round(c.sales / c.orders) : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

// ─── Subcategory Performance ──────────────────────────────────────────────────

export function getSubcategoryPerformance(data: RetailRow[]): { subcategory: string; category: string; sales: number; profit: number; margin: number; orders: number }[] {
  const map: Record<string, { subcategory: string; category: string; sales: number; profit: number; orders: number }> = {};
  for (const r of data) {
    const key = r.productSubcategory;
    if (!map[key]) map[key] = { subcategory: key, category: r.productCategory, sales: 0, profit: 0, orders: 0 };
    map[key].sales += r.sales;
    map[key].profit += r.profit;
    map[key].orders += 1;
  }
  return Object.values(map)
    .map(s => ({ ...s, sales: Math.round(s.sales), profit: Math.round(s.profit), margin: s.sales > 0 ? Math.round((s.profit / s.sales) * 1000) / 10 : 0 }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 20);
}

// ─── Regional Performance ─────────────────────────────────────────────────────

export interface RegionPerf {
  region: string;
  sales: number;
  profit: number;
  margin: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  growth: number;
}

export function getRegionalPerformance(data: RetailRow[]): RegionPerf[] {
  const map: Record<string, { sales: number; profit: number; orders: number; customers: Set<string>; sales2023: number; sales2024: number }> = {};
  for (const r of data) {
    if (!map[r.region]) map[r.region] = { sales: 0, profit: 0, orders: 0, customers: new Set(), sales2023: 0, sales2024: 0 };
    map[r.region].sales += r.sales;
    map[r.region].profit += r.profit;
    map[r.region].orders += 1;
    map[r.region].customers.add(r.customerId);
    const year = new Date(r.orderDate).getFullYear();
    if (year === 2023) map[r.region].sales2023 += r.sales;
    if (year === 2024) map[r.region].sales2024 += r.sales;
  }
  return Object.entries(map)
    .map(([region, d]) => ({
      region,
      sales: Math.round(d.sales),
      profit: Math.round(d.profit),
      margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0,
      orders: d.orders,
      customers: d.customers.size,
      avgOrderValue: d.orders > 0 ? Math.round(d.sales / d.orders) : 0,
      growth: d.sales2023 > 0 ? Math.round(((d.sales2024 - d.sales2023) / d.sales2023) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

// ─── Country Performance ──────────────────────────────────────────────────────

export function getCountryPerformance(data: RetailRow[]): { country: string; region: string; sales: number; profit: number; orders: number; margin: number }[] {
  const map: Record<string, { country: string; region: string; sales: number; profit: number; orders: number }> = {};
  for (const r of data) {
    if (!map[r.country]) map[r.country] = { country: r.country, region: r.region, sales: 0, profit: 0, orders: 0 };
    map[r.country].sales += r.sales;
    map[r.country].profit += r.profit;
    map[r.country].orders += 1;
  }
  return Object.values(map)
    .map(c => ({ ...c, sales: Math.round(c.sales), profit: Math.round(c.profit), margin: c.sales > 0 ? Math.round((c.profit / c.sales) * 1000) / 10 : 0 }))
    .sort((a, b) => b.sales - a.sales);
}

// ─── Top Customers ────────────────────────────────────────────────────────────

export interface TopCustomer {
  customerId: string;
  customerName: string;
  segment: string;
  region: string;
  totalSales: number;
  totalOrders: number;
  totalProfit: number;
  margin: number;
  clv: number;
  avgOrderValue: number;
}

export function getTopCustomers(data: RetailRow[], limit = 10): TopCustomer[] {
  const map: Record<string, TopCustomer> = {};
  for (const r of data) {
    if (!map[r.customerId]) {
      map[r.customerId] = { customerId: r.customerId, customerName: r.customerName, segment: r.customerSegment, region: r.region, totalSales: 0, totalOrders: 0, totalProfit: 0, margin: 0, clv: 0, avgOrderValue: 0 };
    }
    map[r.customerId].totalSales += r.sales;
    map[r.customerId].totalOrders += 1;
    map[r.customerId].totalProfit += r.profit;
  }
  return Object.values(map)
    .map(c => ({
      ...c,
      totalSales: Math.round(c.totalSales),
      totalProfit: Math.round(c.totalProfit),
      margin: c.totalSales > 0 ? Math.round((c.totalProfit / c.totalSales) * 1000) / 10 : 0,
      clv: Math.round(c.totalSales),
      avgOrderValue: c.totalOrders > 0 ? Math.round(c.totalSales / c.totalOrders) : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
}

// ─── Top Products ─────────────────────────────────────────────────────────────

export interface TopProduct {
  productName: string;
  category: string;
  subcategory: string;
  sales: number;
  profit: number;
  margin: number;
  orders: number;
  quantity: number;
  avgPrice: number;
}

export function getTopProducts(data: RetailRow[], limit = 15): TopProduct[] {
  const map: Record<string, TopProduct> = {};
  for (const r of data) {
    if (!map[r.productName]) {
      map[r.productName] = { productName: r.productName, category: r.productCategory, subcategory: r.productSubcategory, sales: 0, profit: 0, margin: 0, orders: 0, quantity: 0, avgPrice: 0 };
    }
    map[r.productName].sales += r.sales;
    map[r.productName].profit += r.profit;
    map[r.productName].orders += 1;
    map[r.productName].quantity += r.quantity;
  }
  return Object.values(map)
    .map(p => ({
      ...p,
      sales: Math.round(p.sales),
      profit: Math.round(p.profit),
      margin: p.sales > 0 ? Math.round((p.profit / p.sales) * 1000) / 10 : 0,
      avgPrice: p.orders > 0 ? Math.round(p.sales / p.orders) : 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

// ─── Sales by Rep ─────────────────────────────────────────────────────────────

export interface SalesRepPerf {
  salesRep: string;
  region: string;
  sales: number;
  profit: number;
  margin: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  quota: number;
  quotaAttainment: number;
}

const repQuotas: Record<string, number> = {
  'Alex Morgan': 850000, 'Chris Bennett': 780000, 'Jordan Hayes': 920000, 'Taylor Reed': 710000, 'Casey Quinn': 670000,
  'Sophie Laurent': 760000, 'Marco Rossi': 690000, 'Anna Müller': 820000, 'James Clarke': 750000, 'Elena Petrova': 680000,
  'Yuki Tanaka': 710000, 'Wei Chen': 790000, 'Priya Sharma': 730000, 'Liam O\'Sullivan': 650000, 'Mei Lin': 680000,
  'Carlos Mendez': 540000, 'Isabella Ferreira': 510000, 'Diego Reyes': 490000, 'Valentina Cruz': 520000, 'Rafael Gomes': 500000,
};

export function getSalesRepPerformance(data: RetailRow[]): SalesRepPerf[] {
  const map: Record<string, { region: string; sales: number; profit: number; orders: number; customers: Set<string> }> = {};
  for (const r of data) {
    if (!map[r.salesRep]) map[r.salesRep] = { region: r.region, sales: 0, profit: 0, orders: 0, customers: new Set() };
    map[r.salesRep].sales += r.sales;
    map[r.salesRep].profit += r.profit;
    map[r.salesRep].orders += 1;
    map[r.salesRep].customers.add(r.customerId);
  }
  return Object.entries(map)
    .map(([rep, d]) => {
      const quota = repQuotas[rep] || 600000;
      const sales = Math.round(d.sales);
      return {
        salesRep: rep, region: d.region, sales, profit: Math.round(d.profit),
        margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0,
        orders: d.orders, customers: d.customers.size,
        avgOrderValue: d.orders > 0 ? Math.round(d.sales / d.orders) : 0,
        quota, quotaAttainment: Math.round((sales / quota) * 1000) / 10,
      };
    })
    .sort((a, b) => b.sales - a.sales);
}

// ─── Customer Segments ────────────────────────────────────────────────────────

export function getSegmentBreakdown(data: RetailRow[]): { segment: string; sales: number; profit: number; margin: number; orders: number; customers: number; avgOrderValue: number }[] {
  const map: Record<string, { sales: number; profit: number; orders: number; customers: Set<string> }> = {};
  for (const r of data) {
    if (!map[r.customerSegment]) map[r.customerSegment] = { sales: 0, profit: 0, orders: 0, customers: new Set() };
    map[r.customerSegment].sales += r.sales;
    map[r.customerSegment].profit += r.profit;
    map[r.customerSegment].orders += 1;
    map[r.customerSegment].customers.add(r.customerId);
  }
  return Object.entries(map)
    .map(([segment, d]) => ({
      segment, sales: Math.round(d.sales), profit: Math.round(d.profit),
      margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0,
      orders: d.orders, customers: d.customers.size,
      avgOrderValue: d.orders > 0 ? Math.round(d.sales / d.orders) : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export function getPaymentBreakdown(data: RetailRow[]): { method: string; orders: number; sales: number; pct: number }[] {
  const map: Record<string, { orders: number; sales: number }> = {};
  const total = data.length;
  for (const r of data) {
    if (!map[r.paymentMethod]) map[r.paymentMethod] = { orders: 0, sales: 0 };
    map[r.paymentMethod].orders += 1;
    map[r.paymentMethod].sales += r.sales;
  }
  return Object.entries(map)
    .map(([method, d]) => ({ method, orders: d.orders, sales: Math.round(d.sales), pct: total > 0 ? Math.round((d.orders / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.orders - a.orders);
}

// ─── Shipping Mode ────────────────────────────────────────────────────────────

export function getShippingBreakdown(data: RetailRow[]): { mode: string; orders: number; sales: number; pct: number; avgDays: number }[] {
  const shippingDaysMap: Record<string, number> = {
    'Standard Shipping': 7, 'Express Shipping': 3, 'Priority Mail': 2, 'Same Day Delivery': 1
  };
  const map: Record<string, { orders: number; sales: number }> = {};
  const total = data.length;
  for (const r of data) {
    if (!map[r.shippingMode]) map[r.shippingMode] = { orders: 0, sales: 0 };
    map[r.shippingMode].orders += 1;
    map[r.shippingMode].sales += r.sales;
  }
  return Object.entries(map)
    .map(([mode, d]) => ({ mode, orders: d.orders, sales: Math.round(d.sales), pct: total > 0 ? Math.round((d.orders / total) * 1000) / 10 : 0, avgDays: shippingDaysMap[mode] || 5 }))
    .sort((a, b) => b.orders - a.orders);
}

// ─── Discount Analysis ────────────────────────────────────────────────────────

export function getDiscountAnalysis(data: RetailRow[]): { discountBand: string; orders: number; sales: number; avgSales: number; profit: number; margin: number }[] {
  const bands: Record<string, { orders: number; sales: number; profit: number }> = {
    'No Discount (0%)': { orders: 0, sales: 0, profit: 0 },
    'Low (1–10%)': { orders: 0, sales: 0, profit: 0 },
    'Medium (11–20%)': { orders: 0, sales: 0, profit: 0 },
    'High (21%+)': { orders: 0, sales: 0, profit: 0 },
  };
  for (const r of data) {
    const d = r.discount;
    const band = d === 0 ? 'No Discount (0%)' : d <= 0.10 ? 'Low (1–10%)' : d <= 0.20 ? 'Medium (11–20%)' : 'High (21%+)';
    bands[band].orders += 1;
    bands[band].sales += r.sales;
    bands[band].profit += r.profit;
  }
  return Object.entries(bands)
    .map(([discountBand, d]) => ({
      discountBand, orders: d.orders, sales: Math.round(d.sales),
      avgSales: d.orders > 0 ? Math.round(d.sales / d.orders) : 0,
      profit: Math.round(d.profit), margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0,
    }));
}

// ─── Age Group Analysis ───────────────────────────────────────────────────────

export function getAgeGroupAnalysis(data: RetailRow[]): { ageGroup: string; orders: number; sales: number; avgOrderValue: number; margin: number }[] {
  const bands: Record<string, { orders: number; sales: number; profit: number }> = {
    '18–24': { orders: 0, sales: 0, profit: 0 }, '25–34': { orders: 0, sales: 0, profit: 0 },
    '35–44': { orders: 0, sales: 0, profit: 0 }, '45–54': { orders: 0, sales: 0, profit: 0 },
    '55–64': { orders: 0, sales: 0, profit: 0 }, '65+': { orders: 0, sales: 0, profit: 0 },
  };
  for (const r of data) {
    const a = r.age;
    const g = a < 25 ? '18–24' : a < 35 ? '25–34' : a < 45 ? '35–44' : a < 55 ? '45–54' : a < 65 ? '55–64' : '65+';
    bands[g].orders += 1;
    bands[g].sales += r.sales;
    bands[g].profit += r.profit;
  }
  return Object.entries(bands).map(([ageGroup, d]) => ({
    ageGroup, orders: d.orders, sales: Math.round(d.sales),
    avgOrderValue: d.orders > 0 ? Math.round(d.sales / d.orders) : 0,
    margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0,
  }));
}

// ─── Gender Analysis ──────────────────────────────────────────────────────────

export function getGenderAnalysis(data: RetailRow[]): { gender: string; orders: number; sales: number; avgOrderValue: number }[] {
  const map: Record<string, { orders: number; sales: number }> = {};
  for (const r of data) {
    if (!map[r.gender]) map[r.gender] = { orders: 0, sales: 0 };
    map[r.gender].orders += 1;
    map[r.gender].sales += r.sales;
  }
  return Object.entries(map)
    .map(([gender, d]) => ({ gender, orders: d.orders, sales: Math.round(d.sales), avgOrderValue: d.orders > 0 ? Math.round(d.sales / d.orders) : 0 }))
    .sort((a, b) => b.sales - a.sales);
}

// ─── Customer Retention ───────────────────────────────────────────────────────

export function getRetentionData(data: RetailRow[]): { bucket: string; customers: number; pct: number }[] {
  const map: Record<string, number> = {};
  for (const r of data) {
    map[r.customerId] = (map[r.customerId] || 0) + 1;
  }
  const buckets: Record<string, number> = { '1 Order': 0, '2–3 Orders': 0, '4–6 Orders': 0, '7–10 Orders': 0, '11+ Orders': 0 };
  for (const count of Object.values(map)) {
    const b = count === 1 ? '1 Order' : count <= 3 ? '2–3 Orders' : count <= 6 ? '4–6 Orders' : count <= 10 ? '7–10 Orders' : '11+ Orders';
    buckets[b]++;
  }
  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  return Object.entries(buckets).map(([bucket, customers]) => ({ bucket, customers, pct: total > 0 ? Math.round((customers / total) * 1000) / 10 : 0 }));
}

// ─── Quarterly Performance ────────────────────────────────────────────────────

export function getQuarterlyPerformance(data: RetailRow[]): { quarter: string; sales: number; profit: number; margin: number; orders: number }[] {
  const map: Record<string, { sales: number; profit: number; orders: number }> = {};
  for (const r of data) {
    const d = new Date(r.orderDate);
    const year = d.getFullYear();
    const q = Math.ceil((d.getMonth() + 1) / 3);
    const key = `${year} Q${q}`;
    if (!map[key]) map[key] = { sales: 0, profit: 0, orders: 0 };
    map[key].sales += r.sales;
    map[key].profit += r.profit;
    map[key].orders += 1;
  }
  return Object.entries(map)
    .map(([quarter, d]) => ({ quarter, sales: Math.round(d.sales), profit: Math.round(d.profit), margin: d.sales > 0 ? Math.round((d.profit / d.sales) * 1000) / 10 : 0, orders: d.orders }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
