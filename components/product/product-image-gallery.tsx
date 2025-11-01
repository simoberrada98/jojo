'use client';

import ProductImage from '@/components/product-image';
import type { DisplayProduct } from '@/types/product';

interface ProductImageGalleryProps {
  product: DisplayProduct;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
}

export function ProductImageGallery({
  product,
  selectedImage,
  setSelectedImage,
}: ProductImageGalleryProps) {
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative border border-border rounded-xl h-96 lg:h-[600px] overflow-hidden">
        <ProductImage
          category={product.category}
          image={product.images?.[selectedImage] || product.image}
        />

        {/* Category Badge */}
        <div className="top-4 left-4 z-10 absolute bg-accent/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-accent-foreground">
          {product.category}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {product.images && product.images.length > 1 && (
        <div className="flex gap-3 pb-2 overflow-x-auto">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === idx
                  ? 'border-accent scale-105'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <ProductImage category={product.category} image={img} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
