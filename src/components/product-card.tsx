

import Image from 'next/image';
import type { FC } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Product } from '@/lib/data';

type ProductCardProps = {
  product: Product;
};

function calculateDiscountedPrice(product: Product) {
    if (!product.offer || product.offer.value <= 0) {
        return null;
    }
    if (product.offer.type === 'percentage') {
        return product.price * (1 - product.offer.value / 100);
    }
    if (product.offer.type === 'fixed') {
        return product.price - product.offer.value;
    }
    return null;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const discountedPrice = calculateDiscountedPrice(product);
  const imageUrl = product.imageId;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 md:p-3">
        <CardTitle className="mb-1 text-sm font-medium">{product.name}</CardTitle>
        <CardDescription className="text-xs">{product.weight}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-2 pt-0 md:p-3">
        <div className="flex flex-col">
            {discountedPrice !== null && discountedPrice < product.price ? (
                <>
                    <p className="text-base font-bold text-foreground">${discountedPrice.toFixed(2)}</p>
                    <p className="text-xs font-medium text-muted-foreground line-through">${product.price.toFixed(2)}</p>
                </>
            ) : (
                 <p className="text-base font-bold text-foreground">${product.price.toFixed(2)}</p>
            )}
        </div>
        <Button size="icon" className="h-8 w-8" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
