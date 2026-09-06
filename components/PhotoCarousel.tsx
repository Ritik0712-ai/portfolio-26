'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const photos = [
  '/profile.jpg',
  '/IMG-20260726-WA0016.jpg',
  '/IMG-20260904-WA0065.jpg',
  '/IMG20260725125429.jpg',
  '/Snapchat-771821034.jpg',
];

interface PhotoCarouselProps {
  interval?: number;
}

export default function PhotoCarousel({ interval = 2000 }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 overflow-hidden rounded">
      {photos.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Photo ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-accent' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
