
"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function ProductGallery({ images = [], productName = "Product" }) {
  const validImages = images
    .filter((image) => image?.imageUrl)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = validImages[activeIndex];

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-100">
        <ImageIcon size={64} className="text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
        <img
          src={activeImage.imageUrl}
          alt={activeImage.altText || productName}
          className="h-full w-full object-contain"
        />

        {validImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {validImages.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={image.id || image.imageUrl}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 transition ${
                activeIndex === index
                  ? "border-green-600"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={activeIndex === index}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
