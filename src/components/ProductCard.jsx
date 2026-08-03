import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);
  const { wishlistItems, toggleWishlist } = useWishlistStore();

  const isWishlisted = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail
    // Defaulting to the first available size for quick add
    const defaultSize = product.sizes[0];
    addToCart(product, defaultSize, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 rounded-xl ">
        {product.isNew && (
          <span className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-xl">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur hover:bg-white rounded-full transition-colors"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 rounded-xl">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} alternate`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {/* Quick Add Overlay */}
        <div className={`absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button 
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-3 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <h3 className="font-bold text-sm uppercase tracking-tight mb-1 group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
