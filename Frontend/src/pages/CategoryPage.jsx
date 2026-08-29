import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCatalogStore } from '../store/useCatalogStore';

export default function CategoryPage() {
  const { categoryName } = useParams();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFits, setSelectedFits] = useState([]);

  const { products, isLoading, fetchProducts } = useCatalogStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Available filter options based on mock data
  const sizes = ['S', 'M', 'L', 'XL', 'OS'];
  const fits = ['Oversized', 'Regular', 'Slim', 'One Size'];

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (categoryName && categoryName !== 'new-arrivals' && categoryName !== 'best-sellers') {
      result = result.filter(p => p.category === categoryName);
    } else if (categoryName === 'new-arrivals') {
      result = result.filter(p => p.isNew);
    } else if (categoryName === 'best-sellers') {
      result = result.filter(p => p.isBestSeller);
    }

    // Filter by Sizes
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(size => selectedSizes.includes(size)));
    }

    // Filter by Fit
    if (selectedFits.length > 0) {
      result = result.filter(p => selectedFits.includes(p.fit));
    }

    // Sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [categoryName, sortOption, selectedSizes, selectedFits]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleFit = (fit) => {
    setSelectedFits(prev => 
      prev.includes(fit) ? prev.filter(f => f !== fit) : [...prev, fit]
    );
  };

  const categoryTitle = categoryName 
    ? categoryName.replace('-', ' ') 
    : 'All Products';

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-border pb-6">
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4 md:mb-0">
          {categoryTitle}
        </h1>
        
        <div className="flex items-center gap-6 text-sm">
          <button 
            className="flex items-center gap-2 font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" />
            Filters {selectedSizes.length + selectedFits.length > 0 && `(${selectedSizes.length + selectedFits.length})`}
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
              Sort By <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button onClick={() => setSortOption('newest')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted ${sortOption === 'newest' ? 'font-bold' : ''}`}>Newest</button>
              <button onClick={() => setSortOption('price-low')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-low' ? 'font-bold' : ''}`}>Price: Low to High</button>
              <button onClick={() => setSortOption('price-high')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-high' ? 'font-bold' : ''}`}>Price: High to Low</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        {isFilterOpen && (
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="space-y-8">
              {/* Size Filter */}
              <div>
                <h3 className="font-heading font-bold uppercase mb-4 text-sm tracking-wider">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 border flex items-center justify-center text-xs font-bold uppercase transition-colors ${
                        selectedSizes.includes(size) 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-background text-foreground border-border hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Filter */}
              <div>
                <h3 className="font-heading font-bold uppercase mb-4 text-sm tracking-wider">Fit</h3>
                <div className="space-y-2">
                  {fits.map(fit => (
                    <label key={fit} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                        selectedFits.includes(fit) ? 'bg-foreground border-foreground' : 'border-muted-foreground group-hover:border-foreground'
                      }`}>
                        {selectedFits.includes(fit) && <div className="w-2 h-2 bg-background" />}
                      </div>
                      <span className="text-sm uppercase tracking-wide">{fit}</span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedFits.includes(fit)}
                        onChange={() => toggleFit(fit)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => { setSelectedSizes([]); setSelectedFits([]); }}
                className="w-full py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors mt-4"
              >
                Clear Filters
              </button>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-20">
              <h2 className="font-heading text-2xl font-bold uppercase mb-4 text-muted-foreground">Loading Products...</h2>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="font-heading text-2xl font-bold uppercase mb-4">No Products Found</h2>
              <p className="text-muted-foreground uppercase text-sm tracking-widest">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
