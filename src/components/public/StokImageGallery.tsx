"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface StokImageGalleryProps {
  images: string[];
  name: string;
  status: string;
}

export default function StokImageGallery({ images, name, status }: StokImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fallback if images array is empty
  const displayImages = images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop"];

  return (
    <>
      <div className="space-y-4">
        {/* MAIN IMAGE */}
        <div 
          className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-[var(--border)] cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img 
            src={displayImages[activeIndex]} 
            alt={name}
            className="object-contain w-full h-full bg-black/5"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
              status === 'Tersedia' ? 'bg-green-100 text-green-700' :
              status === 'Baru Masuk' ? 'bg-[var(--accent)] text-[var(--foreground)]' :
              status === 'Sedang Dipesan' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* THUMBNAILS */}
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayImages.map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setActiveIndex(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${i === activeIndex ? 'border-[var(--primary)] shadow-md scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={imgUrl} alt={`thumbnail ${i}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          <img 
            src={displayImages[activeIndex]} 
            alt={name} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}
