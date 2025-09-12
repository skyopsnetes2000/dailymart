
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type HeroCarouselProps = {
  images: string[];
};

const variants = {
  enter: {
    y: '-100%',
    opacity: 0,
  },
  center: {
    y: '0%',
    opacity: 1,
  },
  exit: {
    y: '100%',
    opacity: 0,
  },
};


export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length, isClient]);

  if (!isClient) {
    // Render a static image on the server to prevent layout shift and hydration errors
    return (
       <Image
          src={images[0]}
          alt={`Hero image 1`}
          fill
          className="object-cover"
          priority
        />
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`Hero image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
