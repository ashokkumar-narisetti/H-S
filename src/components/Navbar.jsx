import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleCart = useCartStore(state => state.toggleCart);
  const cartItems = useCartStore(state => state.cartItems);
  const location = useLocation();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'T-Shirts', path: '/category/tshirts' },
    { name: 'Hoodies', path: '/category/hoodies' },
    { name: 'Sweatshirts', path: '/category/sweatshirts' },
    { name: 'Shorts', path: '/category/shorts' },
    { name: 'Sweatpants', path: '/category/sweatpants' },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 border-border' : 'bg-white py-5 border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo & Tagline */}
          <div className="flex-shrink-0 flex items-baseline gap-2">
            <Link to="/" className="font-heading text-3xl font-bold tracking-tighter">
              H&S
            </Link>
            {/* <span className="hidden sm:block text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Hi & Shi
            </span> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-sm font-medium uppercase tracking-wide hover:text-muted-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <button className="hidden sm:block hover:text-muted-foreground transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/login" className="hover:text-muted-foreground transition-colors" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/wishlist" className="hover:text-muted-foreground transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <button 
              onClick={toggleCart} 
              className="relative hover:text-muted-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden hover:text-muted-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border absolute w-full left-0 mt-3 sm:mt-5 p-4 shadow-xl">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-base font-medium uppercase tracking-wide py-2 border-b border-border/50 hover:bg-muted px-2"
              >
                {link.name}
              </Link>
            ))}
            <div className="relative mt-4">
              <input 
                type="text" 
                placeholder="SEARCH..." 
                className="w-full border border-border p-3 text-sm focus:outline-none focus:border-foreground"
              />
              <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
