/**
 * @BACKEND_TEAM - ORDER TRACKING & HISTORY INTEGRATION:
 * 
 * 1. Tracking Form Submission (Track Order Tab):
 *    - Wire up the form to `GET /api/orders/track?orderId={id}&email={email}`.
 *    - Render the order status (e.g., "Processing", "Shipped", "Out for Delivery") dynamically on success.
 * 2. Order History (Order History Tab):
 *    - Query `GET /api/orders/me` to populate the `mockOrders` array.
 *    - IMPORTANT: The API should return the primary `productId` in the order object so users can click the row and be redirected to the exact product page (`/product/${order.productId}`).
 *    - Handle pagination if the user has many orders.
 */
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrackOrderPage() {
  const [activeTab, setActiveTab] = useState('track'); // 'track' or 'history'

  const mockOrders = [
    { id: 'ORD-001', date: '2023-10-25', total: 170.00, status: 'Delivered', items: 2, productId: 'hd-1' },
    { id: 'ORD-002', date: '2023-09-12', total: 85.00, status: 'Delivered', items: 1, productId: 'ts-2' }
  ];

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-8 text-center">Orders & Tracking</h1>
      
      {/* Tabs */}
      <div className="flex justify-center gap-8 border-b border-border mb-12">
        <button 
          onClick={() => setActiveTab('track')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors relative ${activeTab === 'track' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Track Order
          {activeTab === 'track' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors relative ${activeTab === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Order History
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground"></span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        
        {/* Track Order Tab */}
        {activeTab === 'track' && (
          <div className="max-w-md mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-8">Enter your order number and email to see the status.</p>
            <form className="space-y-6 text-left" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Order Number</label>
                <input required type="text" placeholder="e.g. ORD-001" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" placeholder="Email used for purchase" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
              </div>
              
              <button type="submit" className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Track Order
              </button>
            </form>
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border border-border">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-2 sm:col-span-1">Order ID</div>
                <div className="hidden sm:block">Date</div>
                <div className="hidden sm:block text-center">Items</div>
                <div>Status</div>
                <div className="text-right">Total</div>
              </div>
              
              {mockOrders.length > 0 ? mockOrders.map(order => (
                <Link to={`/product/${order.productId}`} key={order.id} className="grid grid-cols-5 gap-4 p-4 border-b border-border last:border-0 text-sm font-medium items-center hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="font-bold col-span-2 sm:col-span-1 flex items-center gap-2 group-hover:underline">
                    <Package className="w-4 h-4 text-muted-foreground" /> {order.id}
                  </div>
                  <div className="hidden sm:block text-muted-foreground">{order.date}</div>
                  <div className="hidden sm:block text-center text-muted-foreground">{order.items}</div>
                  <div>
                    <span className="px-2 py-1 bg-black text-white text-[10px] uppercase tracking-widest">{order.status}</span>
                  </div>
                  <div className="text-right font-bold group-hover:text-black/70">${order.total.toFixed(2)}</div>
                </Link>
              )) : (
                <div className="p-12 text-center text-muted-foreground text-sm uppercase tracking-widest">
                  No previous orders found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
