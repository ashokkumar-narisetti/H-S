import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AccountProfile from './pages/AccountProfile';
import WalletPage from './pages/WalletPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import AddressPage from './pages/AddressPage';
import TrackingDetailPage from './pages/TrackingDetailPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        <CartDrawer />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/account" element={<AccountProfile />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/track-orders" element={<TrackOrderPage />} />
            <Route path="/track/:orderId" element={<TrackingDetailPage />} />
          </Routes>

        </main>
        
        {!hideFooter && <Footer />}
      </div>
  );
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ className: 'uppercase text-xs font-bold tracking-widest rounded-none border border-border shadow-none' }} />
      <AppContent />
    </Router>
  );
}

export default App;
