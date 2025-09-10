import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscountedPrice(product: Product): number | null {
    if (!product.offer || product.offer.value <= 0) {
        return null;
    }
    if (product.offer.type === 'percentage') {
        return product.price * (1 - product.offer.value / 100);
    }
    if (product.offer.type === 'fixed') {
        const newPrice = product.price - product.offer.value;
        return newPrice > 0 ? newPrice : 0;
    }
    return null;
}
