// Seeded PRNG — Mulberry32 (deterministic, reproducible dataset)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(rand: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomNormal(rand: () => number, mean: number, sd: number): number {
  const u = 1 - rand();
  const v = rand();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.round(mean + sd * z);
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export interface RetailRow {
  orderId: string;
  customerId: string;
  customerName: string;
  gender: 'Male' | 'Female';
  age: number;
  city: string;
  region: string;
  country: string;
  productCategory: string;
  productSubcategory: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  sales: number;
  cost: number;
  profit: number;
  orderDate: string;
  shippingDate: string;
  shippingMode: string;
  salesRep: string;
  customerSegment: string;
  paymentMethod: string;
}

// ─── Geography ────────────────────────────────────────────────────────────────

const geoData: {
  region: string;
  country: string;
  cities: string[];
  weight: number;
}[] = [
  // North America (35%)
  { region: 'North America', country: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Diego', 'Dallas', 'Austin', 'Seattle'], weight: 22 },
  { region: 'North America', country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'], weight: 8 },
  { region: 'North America', country: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Tijuana'], weight: 5 },
  // EMEA (30%)
  { region: 'EMEA', country: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'], weight: 9 },
  { region: 'EMEA', country: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'], weight: 7 },
  { region: 'EMEA', country: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'], weight: 5 },
  { region: 'EMEA', country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], weight: 3 },
  { region: 'EMEA', country: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'], weight: 3 },
  { region: 'EMEA', country: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'], weight: 3 },
  // APAC (25%)
  { region: 'APAC', country: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto'], weight: 6 },
  { region: 'APAC', country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'], weight: 5 },
  { region: 'APAC', country: 'China', cities: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu'], weight: 6 },
  { region: 'APAC', country: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'], weight: 5 },
  { region: 'APAC', country: 'Singapore', cities: ['Singapore City'], weight: 3 },
  // LATAM (10%)
  { region: 'LATAM', country: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], weight: 5 },
  { region: 'LATAM', country: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario'], weight: 2 },
  { region: 'LATAM', country: 'Colombia', cities: ['Bogotá', 'Medellín', 'Cali'], weight: 2 },
  { region: 'LATAM', country: 'Chile', cities: ['Santiago', 'Valparaíso'], weight: 1 },
];

const geoWeights = geoData.map(g => g.weight);

// ─── Products ─────────────────────────────────────────────────────────────────

interface ProductConfig {
  category: string;
  subcategory: string;
  products: string[];
  minPrice: number;
  maxPrice: number;
  marginLow: number;
  marginHigh: number;
  maxQty: number;
  weight: number;
}

const productData: ProductConfig[] = [
  // Electronics — high revenue, thin margins (6-14%)
  { category: 'Electronics', subcategory: 'Computers', products: ['Laptop Pro 15"', 'Ultrabook Air', 'Gaming Laptop', 'Chromebook'], minPrice: 499, maxPrice: 2499, marginLow: 0.06, marginHigh: 0.12, maxQty: 3, weight: 8 },
  { category: 'Electronics', subcategory: 'Mobile', products: ['Smartphone X', 'Smartphone SE', 'Tablet 10"', 'Tablet Pro'], minPrice: 299, maxPrice: 1199, marginLow: 0.07, marginHigh: 0.13, maxQty: 4, weight: 9 },
  { category: 'Electronics', subcategory: 'Audio', products: ['Wireless Headphones', 'Earbuds Pro', 'Soundbar 2.1', 'Smart Speaker'], minPrice: 49, maxPrice: 399, marginLow: 0.10, marginHigh: 0.18, maxQty: 5, weight: 7 },
  { category: 'Electronics', subcategory: 'Wearables', products: ['Smart Watch S', 'Smart Watch Ultra', 'Fitness Tracker', 'Smart Ring'], minPrice: 79, maxPrice: 549, marginLow: 0.10, marginHigh: 0.16, maxQty: 4, weight: 5 },
  { category: 'Electronics', subcategory: 'Gaming', products: ['Gaming Console', 'Gaming Controller', 'Gaming Headset', 'VR Headset'], minPrice: 59, maxPrice: 699, marginLow: 0.06, marginHigh: 0.12, maxQty: 3, weight: 5 },
  // Clothing — medium revenue, medium margins (15-28%)
  { category: 'Clothing', subcategory: 'Tops', products: ['Classic T-Shirt', 'Polo Shirt', 'Button-Down Shirt', 'Graphic Tee'], minPrice: 15, maxPrice: 89, marginLow: 0.20, marginHigh: 0.35, maxQty: 8, weight: 8 },
  { category: 'Clothing', subcategory: 'Bottoms', products: ['Slim Jeans', 'Chino Pants', 'Cargo Shorts', 'Leggings'], minPrice: 25, maxPrice: 129, marginLow: 0.18, marginHigh: 0.30, maxQty: 6, weight: 7 },
  { category: 'Clothing', subcategory: 'Outerwear', products: ['Parka Jacket', 'Denim Jacket', 'Rain Coat', 'Puffer Vest'], minPrice: 59, maxPrice: 299, marginLow: 0.15, marginHigh: 0.28, maxQty: 4, weight: 5 },
  { category: 'Clothing', subcategory: 'Footwear', products: ['Running Shoes', 'Casual Sneakers', 'Leather Boots', 'Sandals'], minPrice: 39, maxPrice: 249, marginLow: 0.20, marginHigh: 0.32, maxQty: 4, weight: 6 },
  // Home & Garden — medium revenue, high margins (25-40%)
  { category: 'Home & Garden', subcategory: 'Kitchen', products: ['Coffee Maker', 'Stand Mixer', 'Air Fryer', 'Blender Pro', 'Instant Pot'], minPrice: 39, maxPrice: 449, marginLow: 0.25, marginHigh: 0.40, maxQty: 5, weight: 7 },
  { category: 'Home & Garden', subcategory: 'Decor', products: ['Wall Art Canvas', 'Floor Lamp', 'Table Lamp', 'Decorative Mirror', 'Plant Pot Set'], minPrice: 19, maxPrice: 299, marginLow: 0.30, marginHigh: 0.45, maxQty: 5, weight: 5 },
  { category: 'Home & Garden', subcategory: 'Outdoor', products: ['Garden Hose', 'Lawn Mower', 'Patio Chair Set', 'BBQ Grill', 'Outdoor Lights'], minPrice: 25, maxPrice: 799, marginLow: 0.22, marginHigh: 0.35, maxQty: 3, weight: 4 },
  // Furniture — high price, lower margins (10-18%)
  { category: 'Furniture', subcategory: 'Seating', products: ['Ergonomic Office Chair', 'Gaming Chair', 'Lounge Sofa', 'Bar Stool Set'], minPrice: 149, maxPrice: 1499, marginLow: 0.10, marginHigh: 0.18, maxQty: 3, weight: 4 },
  { category: 'Furniture', subcategory: 'Storage', products: ['6-Drawer Dresser', 'Bookcase', 'Filing Cabinet', 'Wardrobe'], minPrice: 99, maxPrice: 999, marginLow: 0.12, marginHigh: 0.20, maxQty: 2, weight: 3 },
  { category: 'Furniture', subcategory: 'Tables & Desks', products: ['Standing Desk', 'Dining Table', 'Coffee Table', 'Nightstand'], minPrice: 79, maxPrice: 1199, marginLow: 0.11, marginHigh: 0.19, maxQty: 2, weight: 3 },
  // Sports — medium price, medium-high margins (18-30%)
  { category: 'Sports', subcategory: 'Fitness', products: ['Dumbbell Set', 'Resistance Bands', 'Yoga Mat', 'Pull-Up Bar', 'Foam Roller'], minPrice: 15, maxPrice: 499, marginLow: 0.22, marginHigh: 0.38, maxQty: 6, weight: 5 },
  { category: 'Sports', subcategory: 'Outdoor Sports', products: ['Mountain Bike', 'Kayak Paddle', 'Camping Tent', 'Hiking Boots', 'Sleeping Bag'], minPrice: 29, maxPrice: 899, marginLow: 0.18, marginHigh: 0.30, maxQty: 3, weight: 4 },
  { category: 'Sports', subcategory: 'Team Sports', products: ['Basketball', 'Soccer Ball', 'Tennis Racket', 'Baseball Glove', 'Golf Club Set'], minPrice: 19, maxPrice: 349, marginLow: 0.20, marginHigh: 0.32, maxQty: 5, weight: 4 },
  // Books — low price, very high margins (35-55%)
  { category: 'Books', subcategory: 'Fiction', products: ['Bestseller Novel', 'Mystery Thriller', 'Science Fiction', 'Fantasy Epic'], minPrice: 8, maxPrice: 28, marginLow: 0.40, marginHigh: 0.60, maxQty: 10, weight: 4 },
  { category: 'Books', subcategory: 'Non-Fiction', products: ['Business Strategy', 'Self-Development', 'Biography', 'History & Politics', 'Science & Nature'], minPrice: 10, maxPrice: 35, marginLow: 0.38, marginHigh: 0.58, maxQty: 10, weight: 4 },
];

const productWeights = productData.map(p => p.weight);

// ─── People ───────────────────────────────────────────────────────────────────

const firstNamesMale = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Frank', 'Brandon', 'Raymond', 'Gregory', 'Samuel', 'Patrick', 'Alexander', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron'];
const firstNamesFemale = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Olivia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

// ─── Sales Reps ───────────────────────────────────────────────────────────────

const salesReps: Record<string, string[]> = {
  'North America': ['Alex Morgan', 'Chris Bennett', 'Jordan Hayes', 'Taylor Reed', 'Casey Quinn'],
  'EMEA': ['Sophie Laurent', 'Marco Rossi', 'Anna Müller', 'James Clarke', 'Elena Petrova'],
  'APAC': ['Yuki Tanaka', 'Wei Chen', 'Priya Sharma', 'Liam O\'Sullivan', 'Mei Lin'],
  'LATAM': ['Carlos Mendez', 'Isabella Ferreira', 'Diego Reyes', 'Valentina Cruz', 'Rafael Gomes'],
};

// ─── Other dimension pools ────────────────────────────────────────────────────

const segments = ['Consumer', 'Business', 'Enterprise'];
const segmentWeights = [50, 30, 20];

const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Debit Card', 'Cryptocurrency'];
const paymentWeights = [38, 25, 20, 12, 5];

const shippingModes = ['Standard Shipping', 'Express Shipping', 'Priority Mail', 'Same Day Delivery'];
const shippingWeights = [50, 28, 15, 7];

const shippingDays: Record<string, number> = {
  'Standard Shipping': 7,
  'Express Shipping': 3,
  'Priority Mail': 2,
  'Same Day Delivery': 1,
};

const discountLevels = [0, 0.05, 0.10, 0.15, 0.20, 0.25];
const discountWeights = [40, 20, 15, 12, 8, 5];

// ─── Date helpers ─────────────────────────────────────────────────────────────

const START_DATE = new Date('2022-01-01').getTime();
const END_DATE = new Date('2024-12-31').getTime();
const DATE_RANGE = END_DATE - START_DATE;

function randomDate(rand: () => number): Date {
  // Q4 boost: orders in Oct-Dec are ~40% more likely
  const raw = new Date(START_DATE + rand() * DATE_RANGE);
  const month = raw.getMonth(); // 0-based
  if (month >= 9 && rand() < 0.4) {
    // Another roll for Q4 — biases toward Q4
    return new Date(START_DATE + rand() * DATE_RANGE);
  }
  return raw;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ─── Customer pool ────────────────────────────────────────────────────────────

function buildCustomerPool(rand: () => number, size = 3000): Array<{ id: string; name: string; gender: 'Male' | 'Female'; age: number }> {
  const pool = [];
  for (let i = 0; i < size; i++) {
    const gender: 'Male' | 'Female' = rand() < 0.5 ? 'Male' : 'Female';
    const firstName = gender === 'Male'
      ? firstNamesMale[Math.floor(rand() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(rand() * firstNamesFemale.length)];
    const lastName = lastNames[Math.floor(rand() * lastNames.length)];
    const age = clamp(randomNormal(rand, 38, 13), 18, 75);
    pool.push({
      id: `CUST-${String(i + 1).padStart(5, '0')}`,
      name: `${firstName} ${lastName}`,
      gender,
      age,
    });
  }
  return pool;
}

// ─── Main generator ───────────────────────────────────────────────────────────

let _cache: RetailRow[] | null = null;

export function generateDataset(rows = 15000): RetailRow[] {
  if (_cache) return _cache;

  const rand = mulberry32(42);
  const customers = buildCustomerPool(rand);

  const data: RetailRow[] = [];

  for (let i = 0; i < rows; i++) {
    // Customer
    const customer = customers[Math.floor(rand() * customers.length)];

    // Geography
    const geo = pickWeighted(rand, geoData, geoWeights);
    const city = geo.cities[Math.floor(rand() * geo.cities.length)];

    // Product
    const product = pickWeighted(rand, productData, productWeights);
    const productName = product.products[Math.floor(rand() * product.products.length)];

    // Pricing
    const unitPrice = Math.round((product.minPrice + rand() * (product.maxPrice - product.minPrice)) * 100) / 100;
    const quantity = clamp(Math.ceil(rand() * product.maxQty), 1, product.maxQty);
    const discount = pickWeighted(rand, discountLevels, discountWeights);

    // Segment affects quantity and pricing
    const segment = pickWeighted(rand, segments, segmentWeights);
    const qtyMultiplier = segment === 'Enterprise' ? clamp(Math.round(rand() * 3 + 1), 1, 5)
      : segment === 'Business' ? clamp(Math.round(rand() * 2 + 1), 1, 3)
        : 1;
    const finalQty = quantity * qtyMultiplier;

    // Revenue
    const sales = Math.round(finalQty * unitPrice * (1 - discount) * 100) / 100;
    const marginRate = product.marginLow + rand() * (product.marginHigh - product.marginLow);
    const cost = Math.round(sales * (1 - marginRate) * 100) / 100;
    const profit = Math.round((sales - cost) * 100) / 100;

    // Dates
    const orderDate = randomDate(rand);
    const shipping = pickWeighted(rand, shippingModes, shippingWeights);
    const shippingDate = addDays(orderDate, shippingDays[shipping] + Math.floor(rand() * 2));

    // Sales rep (regional)
    const reps = salesReps[geo.region];
    const rep = reps[Math.floor(rand() * reps.length)];

    // Payment
    const payment = pickWeighted(rand, paymentMethods, paymentWeights);

    // Year-based growth bias (APAC grows faster, Crypto grows faster)
    const year = orderDate.getFullYear();
    if (geo.region === 'APAC' && year === 2024 && rand() < 0.12) {
      // Extra APAC rows in 2024 (fast growth market)
      i--; // re-roll this slot for APAC
    }

    const orderId = `ORD-${year}-${String(i + 1).padStart(5, '0')}`;

    data.push({
      orderId,
      customerId: customer.id,
      customerName: customer.name,
      gender: customer.gender,
      age: customer.age,
      city,
      region: geo.region,
      country: geo.country,
      productCategory: product.category,
      productSubcategory: product.subcategory,
      productName,
      quantity: finalQty,
      unitPrice,
      discount,
      sales,
      cost,
      profit,
      orderDate: formatDate(orderDate),
      shippingDate: formatDate(shippingDate),
      shippingMode: shipping,
      salesRep: rep,
      customerSegment: segment,
      paymentMethod: payment,
    });
  }

  _cache = data;
  return data;
}

export const globalDataset: RetailRow[] = generateDataset();
