
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import type { Category } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

type CategoryCardProps = {
  category: Category;
};

const CategoryCard: FC<CategoryCardProps> = ({ category }) => {

  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1 h-full">
        <div className="relative aspect-square">
          {category.imageId && (
            <Image
              src={category.imageId}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <CardContent className="p-2 text-center">
            <h3 className="font-headline text-xs font-semibold text-foreground sm:text-sm truncate">
              {category.name}
            </h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
