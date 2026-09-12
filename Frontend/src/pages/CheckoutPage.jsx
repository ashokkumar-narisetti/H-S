/**
 * @BACKEND_TEAM - CHECKOUT & PAYMENTS INTEGRATION:
 * 
 * 1. Payment Gateway:
 *    - Replace the hardcoded credit card inputs with Stripe Elements (or Razorpay/PayPal equivalent).
 *    - Do NOT pass raw credit card data to our backend. Use Stripe.js to tokenize it first.
 * 2. Order Creation (`handleSubmit`):
 *    - Wire up the form to send `POST /api/orders/checkout`.
 *    - Payload should include: `{ shippingAddress, paymentToken, cartItems }`.
 *    - The backend should verify stock, calculate totals on the server to prevent client-side tampering, charge the token, and return the `orderId`.
 * 3. Empty Cart:
 *    - Only clear the local cart (`clearCart()`) AFTER the backend successfully confirms the order creation.
 */
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Info, CheckCircle, Tag, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGstInfo, setShowGstInfo] = useState(false);
  const gstInfoRef = useRef(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    function handleClickOutside(event) {
      if (gstInfoRef.current && !gstInfoRef.current.contains(event.target)) {
        setShowGstInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    firstName: '', lastName: '', street: '', apt: '', city: '', zipCode: ''
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axiosInstance.get('/addresses');
        setAddresses(res.data);
        const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else {
          setIsChangingAddress(true); // Force them to enter/choose address
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  // Tax Settings State
  const [taxSettings, setTaxSettings] = useState({
    enableGst: true,
    indianThreshold: 2500,
    indianLowRate: 5,
    indianHighRate: 18
  });

  useEffect(() => {
    const fetchTaxSettings = async () => {
      try {
        const res = await axiosInstance.get('/settings/public');
        if (res.data?.data?.taxSettings) {
          setTaxSettings(res.data.data.taxSettings);
        }
      } catch (error) {
        console.error('Error fetching tax settings:', error);
      }
    };
    fetchTaxSettings();
  }, []);

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await axiosInstance.post('/coupons/validate', {
        code: couponInput.trim(),
        amount: subtotal
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setAppliedCoupon(data);
        setCouponSuccess(`Coupon '${data.code}' applied! Saved ₹${data.discountAmount}`);
        setCouponError('');
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'Percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));
  
  const gst = cartItems.reduce((sum, item) => {
    if (!taxSettings.enableGst) return sum;
    const rate = item.price > taxSettings.indianThreshold 
      ? (taxSettings.indianHighRate / 100) 
      : (taxSettings.indianLowRate / 100);
    return sum + (item.price * item.quantity * rate);
  }, 0);
  
  const shipping = subtotal > 150 ? 0 : 10;
  const total = Math.max(0, subtotal - discountAmount + gst + shipping);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const finalAddress = selectedAddress ? {
        name: 'User',
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country
      } : {
        name: `${newAddress.firstName} ${newAddress.lastName}`,
        street: `${newAddress.street} ${newAddress.apt}`,
        city: newAddress.city,
        zipCode: newAddress.zipCode,
        country: 'India'
      };

      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          color: item.color
        })),
        shippingAddress: finalAddress,
        paymentMethod: 'COD', // Bypass mode
        couponCode: appliedCoupon?.code || null
      };

      const res = await axiosInstance.post('/orders/checkout', orderData);
      
      clearCart();
      setIsProcessing(false);
      
      // Show success animation instead of immediate redirect
      setCreatedOrderId(res.data.id);
      setShowSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate(`/track/${res.data.id}`);
      }, 3000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Error placing order');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <h1 className="font-heading text-4xl uppercase font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-8">Your cart is empty.</p>
        <Link to="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">Secure Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Order Summary */}
        <div className="w-full lg:w-1/2">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mb-6">Order Summary</h2>
          
          <div className="space-y-6 mb-8 lg:max-h-[820px] max-h-none sm:max-h-[60vh] overflow-y-auto pr-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 border-b border-border pb-6">
                <Link to={`/product/${item.id}`} className="w-24 h-32 bg-muted relative flex-shrink-0 hover:opacity-80 transition-opacity">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/product/${item.id}`} className="font-bold uppercase tracking-widest text-sm hover:underline underline-offset-4 line-clamp-1">{item.name}</Link>
                      <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-muted-foreground uppercase text-xs tracking-widest mb-2">Size: {item.size}</p>
                    <p className="text-muted-foreground text-xs">₹{item.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Form & Payment */}
        <div className="w-full lg:w-1/2 bg-muted/20 p-8 border border-border rounded-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Delivery Address Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-bold uppercase tracking-widest">Delivery Address</h2>
                {addresses.length > 0 && !isChangingAddress && (
                  <button 
                    type="button" 
                    onClick={() => setIsChangingAddress(true)}
                    className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors"
                  >
                    Change Delivery Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="border border-border p-6 bg-white text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Loading addresses...
                </div>
              ) : selectedAddress && !isChangingAddress ? (
                <div className="border border-border p-6 bg-white relative">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-sm mb-2">{selectedAddress.street}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed uppercase tracking-widest">
                        {selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ''} {selectedAddress.zipCode}<br />
                        {selectedAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 border border-border">
                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-4 border-b border-border pb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest">Select Saved Address</h3>
                      {addresses.map(addr => (
                        <label key={addr.id} className="flex items-start gap-4 p-4 border border-border cursor-pointer hover:bg-muted/30">
                          <input 
                            type="radio" 
                            name="address" 
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => { setSelectedAddress(addr); setIsChangingAddress(false); }}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-bold uppercase tracking-widest text-xs mb-1">{addr.street}</p>
                            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
                              {addr.city}, {addr.zipCode}
                            </p>
                          </div>
                        </label>
                      ))}
                      <p className="text-center font-bold uppercase tracking-widest text-xs py-2">- OR ADD NEW -</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required={!selectedAddress} type="text" placeholder="First Name" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Last Name" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                    <input type="text" placeholder="Apartment (optional)" value={newAddress.apt} onChange={e => setNewAddress({...newAddress, apt: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                    <input required={!selectedAddress} type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    <input required={!selectedAddress} type="text" placeholder="Postal Code" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                    
                    {addresses.length > 0 && isChangingAddress && (
                      <div className="col-span-2 flex gap-4 mt-2">
                        <button type="button" onClick={() => setIsChangingAddress(false)} className="text-xs font-bold uppercase tracking-widest border border-border px-4 py-2 hover:bg-muted w-full">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Bill Details */}
            <section className="bg-white border border-border p-6 mt-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Bill Details</h2>
              
              {/* Promo / Coupon Box */}
              <div className="mb-6 pb-6 border-b border-border">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Have a Coupon Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 text-green-800 rounded-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-green-600 font-normal">
                        ({appliedCoupon.discountType === 'Percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest underline underline-offset-2 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="ENTER COUPON CODE"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          className="w-full p-3 uppercase tracking-widest text-xs border border-border focus:outline-none focus:border-foreground bg-background pr-8"
                        />
                        <Tag className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest mt-2">{couponError}</p>
                    )}
                  </div>
                )}
                {couponSuccess && (
                  <p className="text-green-600 text-[11px] font-bold uppercase tracking-widest mt-2">{couponSuccess}</p>
                )}
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span className="uppercase tracking-widest flex items-center gap-1">
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between relative items-center">
                  <div className="flex items-center gap-2" ref={gstInfoRef}>
                    <span className="text-muted-foreground uppercase tracking-widest">GST</span>
                    <button 
                      type="button"
                      onClick={() => setShowGstInfo(!showGstInfo)}
                      className="text-muted-foreground hover:text-black transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {showGstInfo && (
                      <div className="absolute top-6 left-0 bg-white border border-black p-3 text-[10px] uppercase font-bold tracking-widest z-10 shadow-lg w-48 text-black">
                        <p className="mb-2 border-b border-border pb-1">GST Rates</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Item {'>'} ₹{taxSettings.indianThreshold}: {taxSettings.indianHighRate}%<br/>
                          Item {'<='} ₹{taxSettings.indianThreshold}: {taxSettings.indianLowRate}%
                        </p>
                      </div>
                    )}
                  </div>
                  <span className="font-bold">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-black pt-4">
                <span className="font-bold uppercase tracking-widest text-lg">Total</span>
                <span className="font-bold text-2xl">₹{total.toFixed(2)}</span>
              </div>
            </section>

            {/* Payment Section */}
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Payment</h2>
              <div className="border border-border p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <span className="font-bold uppercase text-sm tracking-widest">Credit Card</span>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-muted"></div>
                    <div className="w-8 h-5 bg-muted"></div>
                  </div>
                </div>
                <input required type="text" placeholder="Card Number" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" placeholder="MM/YY" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                  <input required type="text" placeholder="CVC" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                </div>
                <input required type="text" placeholder="Name on Card" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isProcessing ? 'Processing...' : `Place Order • ₹${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
      
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
                className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4">Order Confirmed!</h2>
              <p className="text-muted-foreground uppercase tracking-widest text-sm mb-8">Thank you for your purchase.</p>
              
              <div className="w-12 h-1 bg-foreground/10 overflow-hidden relative rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-foreground"
                />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4 font-bold">Redirecting to tracking...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
