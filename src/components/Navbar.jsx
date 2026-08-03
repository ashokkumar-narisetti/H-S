import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown, Home } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const productsRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProductsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (productsRef.current && !productsRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { name: 'T-Shirts', path: '/category/tshirts' },
    { name: 'Hoodies', path: '/category/hoodies' },
    { name: 'Sweatshirts', path: '/category/sweatshirts' },
    { name: 'Shorts', path: '/category/shorts' },
    { name: 'Sweatpants', path: '/category/sweatpants' }
  ];

  const profileLinks = [
    { name: 'Profile', path: '/account' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Bag', path: '/checkout' }, // Using checkout as cart/bag view since Cart Drawer icon is removed
    { name: 'Order History & Track', path: '/track-orders' },
    // { name: 'Wallet', path: '/wallet' },
    { name: 'Help', path: '/help' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Logout', path: '/' } // Redirects to home for mock logout
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md py-3 border-border' : 'bg-white py-5 border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-full">
          
          {/* Left: Products Dropdown */}
          <div className="flex-1 flex justify-start" ref={productsRef}>
            <div 
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button 
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors py-2"
                onClick={() => setIsProductsOpen(!isProductsOpen)}
              >
                Products <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white border border-border shadow-xl py-4 flex flex-col gap-1 z-50"
                  >
                    {categories.map((cat) => (
                      <Link 
                        key={cat.name} 
                        to={cat.path}
                        className="px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-muted hover:text-black transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex-shrink-0 flex flex-col items-center">
            <Link to="/" className="font-heading text-4xl font-black tracking-tighter uppercase leading-none">
              H&S
            </Link>
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold mt-1">
              Hi & Shi
            </span>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="flex-1 flex justify-end items-center gap-2" ref={profileRef}>
            <Link 
              to="/" 
              className="p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center" 
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </Link>
            
            <div className="relative">
              <button 
                className="p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Profile Menu"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-white border border-border shadow-2xl py-4 flex flex-col z-50"
                  >
                    <div className="px-6 py-3 border-b border-border/50 mb-2">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">My Account</p>
                    </div>
                    {profileLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        to={link.path}
                        onClick={() => link.name === 'Logout' && alert('Logged out successfully!')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-muted hover:text-black transition-colors ${link.name === 'Logout' ? 'text-red-500 hover:text-red-600 border-t border-border/50 mt-2 pt-4' : ''}`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
