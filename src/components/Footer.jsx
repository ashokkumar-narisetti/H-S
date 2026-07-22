import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl font-bold mb-4 tracking-tighter">H&S</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              UNISEX STREETWEAR COLLECTIVE  PREMIERE INDIAN STREET FASHION STUDIO.<br />
              Designed for the fearless.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/your-page" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-background transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/category/new-arrivals" className="text-sm text-muted-foreground hover:text-background transition-colors">New Arrivals</Link></li>
              <li><Link to="/category/best-sellers" className="text-sm text-muted-foreground hover:text-background transition-colors">Best Sellers</Link></li>
              <li><Link to="/category/hoodies" className="text-sm text-muted-foreground hover:text-background transition-colors">Hoodies & Sweats</Link></li>
              <li><Link to="/category/tshirts" className="text-sm text-muted-foreground hover:text-background transition-colors">T-Shirts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Customer Care</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="/shipping" className="text-sm text-muted-foreground hover:text-background transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-sm text-muted-foreground hover:text-background transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="text-sm text-muted-foreground hover:text-background transition-colors">Size Guide</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-background transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 uppercase tracking-wider text-sm">Join The Collective</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for exclusive drops and know what's Trending
            </p>
            <form className="flex border border-muted-foreground/30 focus-within:border-background transition-colors">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent w-full p-3 text-sm focus:outline-none text-background placeholder:text-muted-foreground"
                required
              />
              <button 
                type="submit" 
                className="p-3 bg-foreground text-background border-l border-muted-foreground/30 hover:bg-white hover:text-black transition-colors"
                aria-label="Subscribe"
              >
                <Mail className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className=" pt-8 flex justify-center items-center text-xs text-muted-foreground text-center">
          <p>&copy; 2026 H&S COLLECTIVE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
