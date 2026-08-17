import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
