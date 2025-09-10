import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import type { Category } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';

type CategoryCardProps = {
  category: Category;
};

const CategoryCard: FC<CategoryCardProps> = ({ category }) => {
  const image = PlaceHolderImages.find((img) => img.id === category.imageId);
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
        <div className="relative aspect-square">
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
          <div className="absolute bottom-0 left-0 p-1.5">
            <h3 className="font-headline text-xs font-semibold text-white sm:text-sm">
              {category.name}
            </h3>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;
