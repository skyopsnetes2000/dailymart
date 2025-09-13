

export type DietaryType = 'veg' | 'non-veg' | 'egg';

export type Offer = {
  type: 'percentage' | 'fixed';
  value: number;
};

export type Product = {
  id: string;
  name: string;
  brand?: string;
  description: string;
  weight: string;
  price: number;
  imageUrls: string[];
  categorySlug: string;
  subCategory?: string;
  offer?: Offer | null;
  dietaryType?: DietaryType;
};

export type CartItem = {
    product: Product;
    quantity: number;
}

export type Recipe = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    instructions: string;
    videoUrl?: string;
    productIds: string[];
}

export type Category = {
  id: string;
  name:string;
  slug: string;
  imageId: string;
  parentId?: string | null;
};

export type OrderStatus = 'Pending' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Return Initiated' | 'Return Successful' | 'Refund Completed' | 'Cancelled' | 'Return Requested';

export type ReturnRequestItem = {
  productName: string;
  quantity: number;
}

export type ShopRequest = {
    id: string;
    userId: string;
    shopName: string;
    contactNumber: string;
    contactEmail: string;
    gstinNumber?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    documents: {
        aadharFrontUrl: string;
        aadharBackUrl: string;
        electricityBillUrl: string;
        passportPhotoUrl: string;
        businessPanUrl: string;
    }
}

export type Order = {
  id: string;
  userId: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: { productName: string, quantity: number }[];
  trackingHistory: { status: string; date: string; }[];
  customerName: string;
  shippingAddress?: Address;
  returnRequest?: {
    items: ReturnRequestItem[];
    reason: string;
    date: string;
  }
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

export type AdBanner = {
    id: string;
    imageUrl?: string;
    description?: string;
    categorySlug?: string;
}

export type AppearanceSettings = {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrls?: string[];
    ads: AdBanner[];
}

export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
    team?: string;
    avatarUrl?: string;
};

export type Team = {
    id: string;
    name: string;
    memberIds: string[];
}

export type LeaveRequest = {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export type Holiday = {
    date: Date;
    name: string;
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
    { id: '1', name: 'Organic Bananas', brand: 'Organic', description: 'A bunch of fresh, organic bananas.', weight: 'Approx. 500g', price: 1.99, imageUrls: ['product-banana'], categorySlug: 'fruits', offer: { type: 'percentage', value: 10}, dietaryType: 'veg' },
    { id: '2', name: 'Farm Fresh Eggs', brand: 'Happy Hen', description: 'A dozen large, brown eggs.', weight: '12-pack', price: 3.49, imageUrls: ['product-eggs'], categorySlug: 'dairy', dietaryType: 'egg' },
    { id: '3', name: 'Whole Milk', brand: 'Daily Fresh', description: 'A gallon of whole milk.', weight: '1 gallon', price: 2.99, imageUrls: ['product-milk'], categorySlug: 'dairy', offer: { type: 'fixed', value: 0.50}, dietaryType: 'veg' },
    { id: '4', name: 'Sourdough Bread', brand: 'Artisan Bakes', description: 'A loaf of freshly baked sourdough bread.', weight: '1 loaf', price: 4.99, imageUrls: ['product-bread'], categorySlug: 'bakery', dietaryType: 'veg' },
    { id: '5', name: 'Ripe Tomatoes', brand: 'VineRipe', description: 'Vine-ripened tomatoes, perfect for salads.', weight: '1 lb', price: 2.49, imageUrls: ['product-tomatoes'], categorySlug: 'vegetables', dietaryType: 'veg' },
    { id: '6', name: 'Crunchy Carrots', brand: 'Organic', description: 'A bunch of organic carrots.', weight: '1 lb', price: 1.49, imageUrls: ['product-carrots'], categorySlug: 'vegetables', dietaryType: 'veg' },
    { id: '7', name: 'Granny Smith Apples', brand: 'Orchard Best', description: 'Tart and crisp green apples.', weight: '1 lb', price: 1.99, imageUrls: ['product-apples'], categorySlug: 'fruits', dietaryType: 'veg' },
    { id: '8', name: 'Chicken Breast', brand: 'Free Range Co.', description: 'Boneless, skinless chicken breast.', weight: '1 lb', price: 5.99, imageUrls: ['product-chicken'], categorySlug: 'meat-fish', dietaryType: 'non-veg' },
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
        userId: 'static-user',
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
        ],
        customerName: 'John Doe',
        shippingAddress: user.addresses[0],
    },
    {
        id: 'ORD-67890',
        userId: 'static-user',
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
        ],
        customerName: 'John Doe',
        shippingAddress: user.addresses[1],
    },
];
