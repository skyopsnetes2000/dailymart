
import React from 'react';
import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Product, Category, AppearanceSettings, Recipe } from '@/lib/data';
import { getCategories, getProducts, getSpecialOfferProducts, getAppearanceSettings, getRecipes } from '@/lib/firestore';
import AdCarousel from '@/components/ad-carousel';
import SearchBar from '@/components/shared/search-bar';
import { Button } from '@/components/ui/button';
import HeroCarousel from '@/components/hero-carousel';
import { Card, CardContent } from '@/components/ui/card';
import HomePageClient from './home-page-client';
import Image from 'next/image';


function RecipeCard({ recipe }: { recipe: Recipe }) {
    return (
        <Link href={`/recipes/${recipe.id}`} className="group block">
            <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="relative aspect-video">
                    <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary">{recipe.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
                </CardContent>
            </Card>
        </Link>
    )
}

export default async function Home() {
  const [
    products,
    categories,
    specialOffers,
    appearance,
    recipes,
  ] = await Promise.all([
    getProducts(),
    getCategories(),
    getSpecialOfferProducts(),
    getAppearanceSettings(),
    getRecipes(),
  ]);

  const topCategories = categories.slice(0, 4);

  const heroTitle = appearance?.heroTitle || "Freshness at Your Fingertips";
  const heroSubtitle = appearance?.heroSubtitle || "The best groceries, delivered fresh to your door daily.";
  const heroImageUrls = appearance?.heroImageUrls?.length ? appearance.heroImageUrls : ["https://picsum.photos/seed/101/1200/800"];

  return (
    <HomePageClient
        products={products}
        categories={categories}
        specialOffers={specialOffers}
        appearance={appearance}
        recipes={recipes}
        topCategories={topCategories}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        heroImageUrls={heroImageUrls}
    />
  );
}
