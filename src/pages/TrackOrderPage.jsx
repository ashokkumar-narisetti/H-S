/**
 * @BACKEND_TEAM - ORDER HISTORY INTEGRATION:
 * 
 * 1. Order History:
 *    - Query `GET /api/orders/me` to populate the `mockOrders` array.
 *    - The API should return full order details including `status`, `total`, `items` (with images/sizes).
 * 2. Track Order Action:
 *    - The "Track Order" button should trigger a modal or redirect to a dedicated tracking page: `/orders/track?orderId={id}`.
 */
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrackOrderPage() {
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
    <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-12 text-center border-b border-border pb-6">Order History</h1>
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mockOrders.length > 0 ? mockOrders.map(order => (
          <div key={order.id} className="border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
            
            {/* Card Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/20 p-5 border-b border-border gap-6">
              
              {/* Left Side: Details & Status */}
              <div className="flex flex-wrap gap-8 text-sm items-center">
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order Placed</p>
                  <p className="font-bold">{order.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Total</p>
                  <p className="font-bold">₹{order.total.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-start">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipping' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                  {(order.status === 'In Progress' || order.status === 'Delivered') && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{order.date}</p>
                  )}
                </div>
              </div>
              
              {/* Right Side: Order ID & Actions */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-border/50 md:border-0 pt-4 md:pt-0">
                <div className="text-sm">
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Order #</p>
                  <p className="font-bold uppercase tracking-widest">{order.id}</p>
                </div>
                <div className="h-10 w-px bg-border hidden md:block"></div>
                <Link to={`/track/${order.id}`} className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                  Track Order
                </Link>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-6">
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
  );
}
