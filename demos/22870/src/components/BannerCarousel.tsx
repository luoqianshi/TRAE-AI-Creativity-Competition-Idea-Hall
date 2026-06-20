import { useState, useEffect } from 'react';
import { Banner } from '@/types';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);
  
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <div className="relative h-40">
              <img 
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-medium text-lg">
                  {banner.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 指示器 */}
      <div className="absolute bottom-2 right-4 flex gap-1.5">
        {banners.map((_, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex 
                ? 'bg-white w-4' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}