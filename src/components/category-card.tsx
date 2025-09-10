import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import type { Category } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardHeader } from '@/components/ui/card';

type CategoryCardProps = {
  category: Category;
};

const CategoryCard: FC<CategoryCardProps> = ({ category }) => {
  const image = PlaceHolderImages.find((img) => img.id === category.imageId);
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
        <CardHeader className="relative h-24 p-0">
          {image && (
            <Image
              src={image.imageUrl}
              alt={category.name}
              fill
              className="object-cover"
              data-ai-hint={image.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <h3 className="text-center font-headline text-lg font-semibold text-white">
              {category.name}
            </h3>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default CategoryCard;
