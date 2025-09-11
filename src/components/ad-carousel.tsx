
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { type AdBanner } from '@/lib/data';

type AdCarouselProps = {
    ads: AdBanner[];
}

export default function AdCarousel({ ads }: AdCarouselProps) {
    const autoplayPlugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    );

    const validAds = (ads || []).filter(ad => ad.imageUrl);

    if (validAds.length === 0) {
        return null;
    }

    return (
        <section className="w-full overflow-hidden">
            <Carousel
                opts={{ align: 'start', loop: true }}
                plugins={[autoplayPlugin.current]}
                onMouseEnter={autoplayPlugin.current.stop}
                onMouseLeave={autoplayPlugin.current.play}
            >
                <CarouselContent className="-ml-2">
                    {validAds.map((ad, index) => (
                        ad.imageUrl && (
                            <CarouselItem key={`${ad.id}-${index}`} className="basis-auto pl-2">
                                <Card className="overflow-hidden relative aspect-video w-[300px] sm:w-[400px]">
                                    <Image
                                        src={ad.imageUrl}
                                        alt={ad.description || 'Advertisement'}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-2 md:p-3">
                                        {ad.description && <h3 className="font-bold text-sm md:text-base text-white">{ad.description}</h3>}
                                        <Button asChild size="sm" variant="secondary" className="mt-1 h-7 text-sm md:h-8">
                                            <Link href={ad.categorySlug ? `/categories/${ad.categorySlug}` : '/products'}>Order Now</Link>
                                        </Button>
                                    </div>
                                </Card>
                            </CarouselItem>
                        )
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
