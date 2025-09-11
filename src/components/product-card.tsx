
'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { Product } from '@/lib/data';
import useCart from '@/hooks/use-cart';
import { calculateDiscountedPrice } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const discountedPrice = calculateDiscountedPrice(product);
  const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
  const { addItem } = useCart();

  return (
    <Card className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[3/4] w-full">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
           <Button 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg" 
                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} 
                onClick={() => addItem(product)}
                aria-label={`Add ${product.name} to cart`}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
      <CardContent className="flex-1 p-2 md:p-3 flex flex-col justify-between">
        <div>
            <h3 className="mb-1 text-sm font-medium leading-tight line-clamp-2">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.weight}</p>
        </div>
        <div className="mt-2">
            {discountedPrice !== null && discountedPrice < product.price ? (
                <div className="flex items-baseline gap-1.5">
                    <p className="text-base font-bold text-foreground">₹{discountedPrice.toFixed(2)}</p>
                    <p className="text-xs font-medium text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                </div>
            ) : (
                 <p className="text-base font-bold text-foreground">₹{product.price.toFixed(2)}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
