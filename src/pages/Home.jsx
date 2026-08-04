import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

export default function Home() {
  const bestSellers = products.filter(p => p.isBestSeller);

  /**
   * @BACKEND_TEAM - LATEST DROPS INTEGRATION:
   * 1. Fetch the 3 most recent active product drops.
   * 2. Map the data so each drop has a title and an array of products.
   * Expected payload structure:
   * [
   *   { dropId: 1, title: 'Drop 01', products: [ { id: 1, name: '...', ... }, ... ] },
   *   ...
   * ]
   */
  const latestDrops = [
    { id: 1, title: 'Drop 01 / Summer Essentials', products: products.slice(0, 4) },
    { id: 2, title: 'Drop 02 / Monochrome Edition', products: products.slice(4, 8) },
    { id: 3, title: 'Drop 03 / The Heavyweights', products: products.slice(8, 12) }
  ];

  const categories = [
    { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', path: '/category/tshirts' },
    { name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop', path: '/category/hoodies' },
    { name: 'Bottoms', image: 'https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop', path: '/category/sweatpants' }
  ];

  const instagramFeed = [
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop', // Lifestyle black/white tones
    'https://images.unsplash.com/photo-1523398002811-999aa8e9f5b9?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604928141064-207cea6f5722?q=80&w=600&auto=format&fit=crop'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />

      

      {/* Latest Drops Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 w-full ">
          <div className="flex justify-between items-end mb-10 ">
            <h2 className="font-heading text-4xl font-black uppercase tracking-tighter">Latest Drops</h2>
            <Link to="/category/new-arrivals" className="text-sm font-bold uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-16">
            {latestDrops.map((drop) => (
              <div key={drop.id}>
                <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border/40 pb-2 text-muted-foreground">{drop.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {drop.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="py-24 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center mb-16">
          <h2 className="font-heading text-4xl font-black uppercase tracking-tighter mb-4">Trending in H&S</h2>
          <div className="w-16 h-1 bg-black"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

     
    </div>
  );
}
