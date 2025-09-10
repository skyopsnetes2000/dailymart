export type Product = {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: number;
  imageId: string;
  categorySlug: string;
  isSpecialOffer?: boolean;
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

export const categories: Category[] = [];

export const products: Product[] = [];

export const user = {
  name: '',
  email: '',
  addresses: []
};

export const orders: Order[] = [];
