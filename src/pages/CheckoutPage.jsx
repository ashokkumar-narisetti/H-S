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
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock Address State
  const [hasSavedAddress, setHasSavedAddress] = useState(true);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 150 ? 0 : 10;
  const total = subtotal + gst + shipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Mock processing delay
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      alert('Order Placed Successfully! (Mock)');
      navigate('/');
    }, 2000);
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
          
          <div className="space-y-6 mb-8 lg:max-h-[820px] max-h-[60vh] overflow-y-auto pr-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 border-b border-border pb-6">
                <div className="w-24 h-32 bg-muted relative flex-shrink-0">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold uppercase tracking-widest text-sm">{item.name}</p>
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
                {hasSavedAddress && !isChangingAddress && (
                  <button 
                    type="button" 
                    onClick={() => setIsChangingAddress(true)}
                    className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors"
                  >
                    Change Delivery Address
                  </button>
                )}
              </div>

              {hasSavedAddress && !isChangingAddress ? (
                <div className="border border-border p-6 bg-white relative">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-sm mb-2">John Doe</p>
                      <p className="text-muted-foreground text-xs leading-relaxed uppercase tracking-widest">
                        123 Streetwear Ave, Apt 4B<br />
                        New York, NY 10001<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-white p-6 border border-border">
                  <input required type="text" placeholder="First Name" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                  <input required type="text" placeholder="Last Name" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                  <input required type="text" placeholder="Street Address" className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                  <input type="text" placeholder="Apartment (optional)" className="w-full p-3 border border-border focus:outline-none focus:border-foreground col-span-2" />
                  <input required type="text" placeholder="City" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                  <input required type="text" placeholder="Postal Code" className="w-full p-3 border border-border focus:outline-none focus:border-foreground" />
                  {isChangingAddress && (
                    <div className="col-span-2 flex gap-4 mt-2">
                      <button type="button" onClick={() => setIsChangingAddress(false)} className="text-xs font-bold uppercase tracking-widest border border-border px-4 py-2 hover:bg-muted">Cancel</button>
                      <button type="button" onClick={() => { setHasSavedAddress(true); setIsChangingAddress(false); }} className="text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-black/80">Save & Use</button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Bill Details */}
            <section className="bg-white border border-border p-6 mt-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Bill Details</h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">GST (18%)</span>
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
                <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
