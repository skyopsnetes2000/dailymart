
export type Offer = {
  type: 'percentage' | 'fixed';
  value: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: number;
  imageId: string;
  categorySlug: string;
  offer?: Offer | null;
};

export type Category = {
  id: string;
  name:string;
  slug: string;
  imageId: string;
};

export type OrderStatus = 'Pending' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Return Initiated' | 'Return Successful' | 'Refund Completed' | 'Cancelled';


export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
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
  { id: '1', name: 'Vegetables', slug: 'vegetables', imageId: 'category-veg' },
  { id: '2', name: 'Fruits', slug: 'fruits', imageId: 'category-fruits' },
  { id: '3', name: 'Dairy', slug: 'dairy', imageId: 'category-dairy' },
  { id: '4', name: 'Bakery', slug: 'bakery', imageId: 'category-bakery' },
  { id: '5', name: 'Meat & Fish', slug: 'meat-fish', imageId: 'category-meat' },
  { id: '6', name: 'Beverages', slug: 'beverages', imageId: 'category-beverages' },
];

export const products: Product[] = [
    { id: '1', name: 'Organic Bananas', description: 'A bunch of fresh, organic bananas.', weight: 'Approx. 500g', price: 1.99, imageId: 'product-banana', categorySlug: 'fruits', offer: { type: 'percentage', value: 10} },
    { id: '2', name: 'Farm Fresh Eggs', description: 'A dozen large, brown eggs.', weight: '12-pack', price: 3.49, imageId: 'product-eggs', categorySlug: 'dairy' },
    { id: '3', name: 'Whole Milk', description: 'A gallon of whole milk.', weight: '1 gallon', price: 2.99, imageId: 'product-milk', categorySlug: 'dairy', offer: { type: 'fixed', value: 0.50} },
    { id: '4', name: 'Sourdough Bread', description: 'A loaf of freshly baked sourdough bread.', weight: '1 loaf', price: 4.99, imageId: 'product-bread', categorySlug: 'bakery' },
    { id: '5', name: 'Ripe Tomatoes', description: 'Vine-ripened tomatoes, perfect for salads.', weight: '1 lb', price: 2.49, imageId: 'product-tomatoes', categorySlug: 'vegetables' },
    { id: '6', name: 'Crunchy Carrots', description: 'A bunch of organic carrots.', weight: '1 lb', price: 1.49, imageId: 'product-carrots', categorySlug: 'vegetables' },
    { id: '7', name: 'Granny Smith Apples', description: 'Tart and crisp green apples.', weight: '1 lb', price: 1.99, imageId: 'product-apples', categorySlug: 'fruits' },
    { id: '8', name: 'Chicken Breast', description: 'Boneless, skinless chicken breast.', weight: '1 lb', price: 5.99, imageId: 'product-chicken', categorySlug: 'meat-fish' },
];

export const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  addresses: [
    {
      id: '1',
      line1: '123 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      mobile: '123-456-7890',
      isDefault: true,
    },
    {
      id: '2',
      line1: '456 Tech Way',
      city: 'Mountain View',
      state: 'CA',
      zip: '94043',
      mobile: '098-765-4321',
      isDefault: false,
    },
  ]
};

export const orders: Order[] = [
    {
        id: 'ORD-12345',
        date: '2023-10-26T10:00:00Z',
        status: 'Delivered',
        total: 25.99,
        items: [
            { productName: 'Organic Bananas', quantity: 2 },
            { productName: 'Sourdough Bread', quantity: 1 }
        ],
        trackingHistory: [
            { status: 'Pending', date: '2023-10-26T10:00:00Z' },
            { status: 'Packed', date: '2023-10-26T12:00:00Z' },
            { status: 'Out for Delivery', date: '2023-10-26T14:00:00Z' },
            { status: 'Delivered', date: '2023-10-26T16:30:00Z' },
        ]
    },
    {
        id: 'ORD-67890',
        date: '2023-10-27T11:30:00Z',
        status: 'Out for Delivery',
        total: 12.49,
        items: [
            { productName: 'Farm Fresh Eggs', quantity: 1 },
            { productName: 'Ripe Tomatoes', quantity: 2 }
        ],
        trackingHistory: [
            { status: 'Pending', date: '2023-10-27T11:30:00Z' },
            { status: 'Packed', date: '2023-10-27T13:00:00Z' },
            { status: 'Out for Delivery', date: '2023-10-27T15:00:00Z' },
        ]
    },
];
