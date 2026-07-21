import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addToCart = useCartStore(state => state.addToCart);
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.some(item => item?.id === product?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedImage(0);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <h1 className="font-heading text-4xl uppercase font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Breadcrumbs */}
      <nav className="flex text-xs uppercase tracking-widest text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/category/${product.category}`} className="hover:text-foreground transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground font-bold">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Images */}
        <div className="w-full md:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 flex-shrink-0 no-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[3/4] w-20 lg:w-full flex-shrink-0 border-2 transition-colors ${selectedImage === idx ? 'border-foreground' : 'border-transparent hover:border-border'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          {/* Main Image */}
          <div className="flex-1 bg-muted relative aspect-[3/4]">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors z-10"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black' : ''}`} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          {product.isNew && <span className="text-xs font-bold uppercase tracking-widest mb-4">New Arrival</span>}
          <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-4">
            {product.name}
          </h1>
          <p className="text-2xl mb-8">${product.price.toFixed(2)}</p>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">Select Size</h3>
              <button className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                <Ruler className="w-3 h-3" /> Size Guide
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 border text-sm font-bold uppercase transition-colors ${
                    selectedSize === size 
                      ? 'bg-foreground text-background border-foreground' 
                      : 'bg-background text-foreground border-border hover:border-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-10">
            <div className="w-24 border border-border flex items-center justify-between px-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg">-</button>
              <span className="font-bold text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-lg">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className={`flex-1 py-4 font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                isAdded 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-foreground text-background border-foreground hover:bg-white hover:text-black hover:border-black border-2'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {isAdded ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none mb-10 border-t border-border pt-8">
            <h4 className="font-heading font-bold uppercase tracking-widest mb-4">Description</h4>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            
            <ul className="mt-6 space-y-2 text-muted-foreground list-disc list-inside">
              <li>Fit: {product.fit}</li>
              <li>Material: Premium composition</li>
              <li>Care: Machine wash cold, dry flat</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-32 border-t border-border pt-16">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-10 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <div key={p.id}>
                {/* For simplicity we'll just link to the product, a full ProductCard would be ideal */}
                <Link to={`/product/${p.id}`} className="group block">
                  <div className="aspect-[3/4] bg-muted overflow-hidden mb-4 relative">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-tight group-hover:underline">{p.name}</h3>
                  <p className="text-muted-foreground text-sm">${p.price.toFixed(2)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
