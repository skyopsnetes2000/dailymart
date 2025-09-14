
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { getRecipe, getProducts } from '@/lib/firestore';
import { type Recipe, type Product } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import ProductCard from '@/components/product-card';

function YouTubeEmbed({ url }: { url: string }) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) {
        return <p className="text-red-500">Invalid YouTube URL</p>;
    }
    return (
        <div className="aspect-video overflow-hidden rounded-lg">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}

export default function RecipePage() {
    const params = useParams();
    const { id } = params;
    const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!id || typeof id !== 'string') {
            setRecipe(null);
            return;
        }

        async function fetchRecipeData() {
            const fetchedRecipe = await getRecipe(id);
            if (!fetchedRecipe) {
                setRecipe(null); // Triggers notFound()
                return;
            }
            setRecipe(fetchedRecipe);

            const allProducts = await getProducts();
            const productsForRecipe = allProducts.filter(p => fetchedRecipe.productIds.includes(p.id));
            setRelatedProducts(productsForRecipe);
        }

        fetchRecipeData();
    }, [id]);

    if (recipe === undefined) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (recipe === null) {
        notFound();
    }
    
    return (
        <div>
            <PageHeader title={recipe.title} />
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
                        </div>
                        <p className="text-muted-foreground">{recipe.description}</p>
                     </div>
                     {recipe.videoUrl && (
                        <div>
                            <YouTubeEmbed url={recipe.videoUrl} />
                        </div>
                     )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                            {recipe.instructions}
                        </div>
                    </CardContent>
                </Card>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Ingredients for this Recipe</h2>
                    {relatedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {relatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No products linked to this recipe yet.</p>
                    )}
                </section>
            </div>
        </div>
    )
}
