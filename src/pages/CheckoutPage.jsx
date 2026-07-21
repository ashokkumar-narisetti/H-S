import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 150 ? 0 : 10;
  const total = subtotal + shipping;

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
        {/* Form */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Contact Info */}
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Contact Information</h2>
              <div className="space-y-4">
                <input required type="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-border text-foreground accent-foreground" />
                  Email me with news and offers
                </label>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="First Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                <input required type="text" placeholder="Last Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                <input required type="text" placeholder="Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground col-span-2" />
                <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground col-span-2" />
                <input required type="text" placeholder="City" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground col-span-2 sm:col-span-1" />
                <input required type="text" placeholder="Postal Code" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground col-span-2 sm:col-span-1" />
              </div>
            </section>

            {/* Payment (Mock) */}
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6">Payment</h2>
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">All transactions are secure and encrypted.</p>
              
              <div className="border border-border p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="font-bold uppercase text-sm tracking-widest">Credit Card</span>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-muted"></div>
                    <div className="w-8 h-5 bg-muted"></div>
                  </div>
                </div>
                <input required type="text" placeholder="Card Number" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Expiration date (MM/YY)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                  <input required type="text" placeholder="Security code" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                </div>
                <input required type="text" placeholder="Name on card" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-muted/30 p-8 border border-border sticky top-32">
            <h2 className="font-heading text-xl font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted relative">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold uppercase truncate">{item.name}</p>
                    <p className="text-muted-foreground uppercase">{item.size}</p>
                  </div>
                  <div className="font-bold text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-widest">Shipping</span>
                <span className="font-bold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-black pt-4">
              <span className="font-bold uppercase tracking-widest">Total</span>
              <span className="font-bold text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
