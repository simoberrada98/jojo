import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Cpu, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import ProductImage from '@/components/product-image';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useCart } from '@/lib/contexts/cart-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { AuthDialog } from '@/components/auth-dialog';
import { wishlistService } from '@/lib/services/wishlist.service'; // Import wishlistService
import type { DisplayProduct } from '@/types/product';
import { useAnimationConfig } from '@/lib/animation';
import { H3, P } from './ui/typography';

interface ProductCardProps {
  product: DisplayProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const anim = useAnimationConfig();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { currency, formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { user } = useAuth();

  // Get hover image (second image if available)
  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  // Check initial wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product.id) {
        const { success, data } = await wishlistService.isProductWished(
          user.id,
          product.id
        );
        if (success && data !== undefined) {
          setIsWished(data);
        }
      }
    };
    checkWishlistStatus();
  }, [user, product.id]);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = useCallback(async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (isWished) {
      const { success } = await wishlistService.removeFromWishlist(
        user.id,
        product.id
      );
      if (success) {
        setIsWished(false);
        toast.info(`${product.name} removed from wishlist.`);
      } else {
        toast.error(`Failed to remove ${product.name} from wishlist.`);
      }
    } else {
      const { success } = await wishlistService.addToWishlist(
        user.id,
        product.id
      );
      if (success) {
        setIsWished(true);
        toast.success(`${product.name} added to wishlist!`);
      } else {
        toast.error(`Failed to add ${product.name} to wishlist.`);
      }
    }
  }, [user, isWished, product.id, product.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: anim.enter, ease: anim.easeStandard }}
      whileHover={{
        y: -8,
        transition: {
          type: 'tween',
          ease: anim.easeStandard,
          duration: anim.hover,
        },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative hover:shadow-2xl hover:shadow-accent/20 border border-border hover:border-accent rounded-lg overflow-hidden transition-all duration-300 will-change-transform"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-card/25 group-hover:bg-card/35 backdrop-blur-xl transition-all duration-500 pointer-events-none"
      />

      <Link
        href={`/products/${product.handle}`}
        className="block z-10 relative"
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          {/* Primary Image */}
          <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
            <ProductImage category={product.category} image={product.image} />
          </div>

          {/* Secondary Image (shown on hover) */}
          {hoverImage && (
            <div
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              <ProductImage category={product.category} image={hoverImage} />
            </div>
          )}

          {/* Category Badge */}
          <div className="top-3 left-3 z-10 absolute bg-accent/90 group-hover:bg-accent backdrop-blur-sm px-3 py-1 rounded-full font-semibold text-xs transition-all duration-300 text-accent-foreground">
            {product.category}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="top-3 right-3 z-20 absolute text-primary-foreground/80 hover:text-primary backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              handleToggleWishlist();
            }}
          >
            <Heart className={isWished ? 'fill-primary' : ''} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-2">
            <H3 className="flex-1 font-bold text-foreground text-xl line-clamp-2 whitespace-normal">
              {product.name}
            </H3>
            {product.rating && (
              <div className="flex items-center gap-1 ml-2">
                <Star className="fill-accent w-4 h-4 text-accent" />
                <span className="font-semibold text-accent text-sm">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          {/* Reviews Count */}
          {product.reviewCount && (
            <P className="mb-4 text-foreground/60 text-xs">
              ({product.reviewCount} reviews)
            </P>
          )}

          {/* Specs */}
          <div className="flex gap-4 mb-4 text-foreground/70 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-mono">{product.hashrate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="font-mono">{product.power}</span>
            </div>
          </div>

          {/* Features List */}
          <ul className="space-y-2 mb-6">
            {Array.isArray(product.specs) &&
              product.specs.slice(0, 2).map((spec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-foreground/60 text-sm"
                >
                  <span className="mt-1 text-accent">•</span>
                  {spec}
                </li>
              ))}
          </ul>
        </div>
      </Link>

      {/* Price and Action */}
      <div className="z-10 relative p-6 pt-0">
        {/* Price */}
        <div className="mb-6 pb-6 border-border border-b">
          <div className="mb-1 font-mono font-bold text-accent text-3xl">
            {formatPrice(product.priceUSD)} {currency}
          </div>
          <div className="font-mono text-foreground/60 text-sm">
            ${product.priceUSD.toLocaleString()} USD
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'tween', duration: anim.tap }}
        >
          <Button
            onClick={handleAddToCart}
            className="gap-2 bg-primary hover:bg-primary/90 w-full font-semibold text-primary-foreground transition-all duration-300 glow-accent-hover"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdded ? 'Added to Cart!' : 'Add to Cart'}
          </Button>
        </motion.div>
      </div>
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={() => setShowAuthDialog(false)}
      />
    </motion.div>
  );
}
