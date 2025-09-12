
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
import { Badge } from '@/components/ui/badge';

type ProductCardProps = {
  product: Product;
};

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const discountedPrice = calculateDiscountedPrice(product);
  const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
  const { addItem } = useCart();
  const hasOffer = discountedPrice !== null && discountedPrice < product.price;

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {hasOffer && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {product.offer?.type === 'percentage' ? `${product.offer.value}% OFF` : `₹${product.offer?.value} OFF`}
            </Badge>
          )}
        </div>
      <CardContent className="flex-1 p-2 md:p-3 flex flex-col justify-between">
        <div>
            <p className="text-xs text-muted-foreground">{product.weight}</p>
            <h3 className="mb-1 text-sm font-medium leading-tight line-clamp-2">{product.name}</h3>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {hasOffer ? (
              <>
                <p className="text-sm font-bold">₹{discountedPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground line-through">
                  ₹{product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-sm font-bold">₹{product.price.toFixed(2)}</p>
            )}
          </div>
          <Button
            size="icon"
            variant="default"
            className="h-8 w-8 shrink-0 rounded-full shadow-sm"
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
