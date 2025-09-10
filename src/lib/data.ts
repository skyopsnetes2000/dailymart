export type Product = {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: number;
  imageId: string;
  categorySlug: string;
};

export type Category = {
  id: string;
  name:string;
  slug: string;
  imageId: string;
};

export type Order = {
  id: string;
  date: string;
  status: 'Pending' | 'Packed' | 'Out for Delivery' | 'Delivered';
  total: number;
  items: { productName: string, quantity: number }[];
  trackingHistory: { status: string; date: string; }[];
};

export type Address = {
    id: string;
    line1: string;
    landmark?: string;
    city: string;
    state: string;
    zip: string;
    mobile: string;
    isDefault: boolean;
}

export const categories: Category[] = [
  { id: '1', name: 'Fresh Vegetables', slug: 'fresh-vegetables', imageId: 'category-veg' },
  { id: '2', name: 'Fresh Fruits', slug: 'fresh-fruits', imageId: 'category-fruits' },
  { id: '3', name: 'Dairy & Eggs', slug: 'dairy-eggs', imageId: 'category-dairy' },
  { id: '4', name: 'Bakery', slug: 'bakery', imageId: 'category-bakery' },
  { id: '5', name: 'Meat & Fish', slug: 'meat-fish', imageId: 'category-meat' },
  { id: '6', name: 'Beverages', slug: 'beverages', imageId: 'category-beverages' },
];

export const products: Product[] = [
  { id: '1', name: 'Organic Bananas', description: 'A bunch of fresh, organic bananas.', weight: 'Approx 750g', price: 1.99, imageId: 'product-banana', categorySlug: 'fresh-fruits' },
  { id: '2', name: 'Free-Range Eggs', description: 'A dozen large free-range eggs.', weight: '12 pack', price: 3.49, imageId: 'product-eggs', categorySlug: 'dairy-eggs' },
  { id: '3', name: 'Whole Milk', description: 'Fresh whole milk, 1 liter.', weight: '1L', price: 1.25, imageId: 'product-milk', categorySlug: 'dairy-eggs' },
  { id: '4', name: 'Sourdough Bread', description: 'Artisan sourdough loaf.', weight: '500g', price: 4.50, imageId: 'product-bread', categorySlug: 'bakery' },
  { id: '5', name: 'Fresh Tomatoes', description: 'Vine-ripened tomatoes.', weight: '500g', price: 2.20, imageId: 'product-tomatoes', categorySlug: 'fresh-vegetables' },
  { id: '6', name: 'Carrots', description: 'A bunch of organic carrots.', weight: '1kg', price: 1.80, imageId: 'product-carrots', categorySlug: 'fresh-vegetables' },
  { id: '7', name: 'Granny Smith Apples', description: 'Crisp and tart apples.', weight: '1kg', price: 2.99, imageId: 'product-apples', categorySlug: 'fresh-fruits' },
  { id: '8', name: 'Chicken Breast', description: 'Skinless, boneless chicken breasts.', weight: '500g', price: 5.99, imageId: 'product-chicken', categorySlug: 'meat-fish' },
];

export const user = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  addresses: [
    { id: '1', line1: '123 Market St', city: 'Greenfield', state: 'CA', zip: '90210', mobile: '111-222-3333', isDefault: true, landmark: 'Next to the fountain' },
    { id: '2', line1: '456 Farm Rd', city: 'Spring Valley', state: 'CA', zip: '90211', mobile: '444-555-6666', isDefault: false },
  ]
};

export const orders: Order[] = [
    {
        id: 'ORDER-001',
        date: '2024-07-20',
        status: 'Delivered',
        total: 25.75,
        items: [
            { productName: 'Organic Bananas', quantity: 2 },
            { productName: 'Whole Milk', quantity: 1 },
        ],
        trackingHistory: [
            { status: 'Delivered', date: '2024-07-20T14:30:00Z' },
            { status: 'Out for Delivery', date: '2024-07-20T10:00:00Z' },
            { status: 'Packed', date: '2024-07-20T08:15:00Z' },
            { status: 'Pending', date: '2024-07-19T18:05:00Z' },
        ],
    },
    {
        id: 'ORDER-002',
        date: '2024-07-21',
        status: 'Out for Delivery',
        total: 12.50,
        items: [
            { productName: 'Sourdough Bread', quantity: 1 },
            { productName: 'Free-Range Eggs', quantity: 1 },
        ],
        trackingHistory: [
            { status: 'Out for Delivery', date: '2024-07-22T09:00:00Z' },
            { status: 'Packed', date: '2024-07-21T20:00:00Z' },
            { status: 'Pending', date: '2024-07-21T11:45:00Z' },
        ],
    }
];
