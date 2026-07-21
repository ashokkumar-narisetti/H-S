import { Link } from 'react-router-dom';
import { Camera, MessageCircle, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl font-bold mb-4 tracking-tighter">H&S</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              UNISEX STREETWEAR COLLECTIVE // GEN-Z FASHION STUDIO. 
              Designed for the fearless.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                <Globe className="w-5 h-5" />
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
              Subscribe for exclusive drops, early access, and 10% off your first order.
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

        <div className="border-t border-muted-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} H&S COLLECTIVE. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
