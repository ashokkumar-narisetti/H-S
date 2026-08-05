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
    { 
      id: 'ORD-0948', 
      date: 'October 25, 2023', 
      total: 170.00, 
      status: 'Delivered',
      items: [
        { id: 'hd-1', name: 'Oversized Heavyweight Hoodie', size: 'L', qty: 1, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
        { id: 'ts-1', name: 'Premium Basic T-Shirt', size: 'M', qty: 1, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop' }
      ]
    },
    { 
      id: 'ORD-0982', 
      date: 'November 12, 2023', 
      total: 85.00, 
      status: 'Shipping',
      items: [
        { id: 'sp-1', name: 'Vintage Wash Sweatpants', size: 'M', qty: 1, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop' }
      ]
    },
    { 
      id: 'ORD-1004', 
      date: 'December 05, 2023', 
      total: 120.00, 
      status: 'In Progress',
      items: [
        { id: 'hd-2', name: 'Heavyweight Zip Hoodie', size: 'XL', qty: 1, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' }
      ]
    },
    { 
      id: 'ORD-1021', 
      date: 'January 10, 2024', 
      total: 45.00, 
      status: 'Canceled',
      items: [
        { id: 'ts-2', name: 'Classic Graphic Tee', size: 'S', qty: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' }
      ]
    }
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="space-y-8">
              {mockOrders.length > 0 ? mockOrders.map(order => (
                <div key={order.id} className="border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 p-5 border-b border-border gap-4">
                    <div className="flex gap-8 text-sm">
                      <div>
                        <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order Placed</p>
                        <p className="font-bold">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Total</p>
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-sm w-full sm:w-auto flex justify-between sm:block">
                      <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1 sm:text-right">Order #</p>
                      <p className="font-bold uppercase tracking-widest">{order.id}</p>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6">
                    <div className="mb-6">
                      <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipping' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-6 border-b border-border/40 pb-6 last:border-0 last:pb-0">
                          <div className="w-20 h-24 bg-muted relative flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <Link to={`/product/${item.id}`} className="font-bold uppercase tracking-widest text-sm hover:underline underline-offset-4 w-fit line-clamp-1">{item.name}</Link>
                            <p className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2 font-bold">Size: {item.size} <span className="mx-2 text-border">•</span> Qty: {item.qty}</p>
                          </div>
                          <div className="flex items-center hidden sm:flex">
                            <Link to={`/product/${item.id}`} className="text-[10px] font-bold uppercase tracking-widest border border-border px-4 py-2 hover:bg-muted transition-colors whitespace-nowrap">
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center border border-border border-dashed text-muted-foreground text-sm uppercase tracking-widest">
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
