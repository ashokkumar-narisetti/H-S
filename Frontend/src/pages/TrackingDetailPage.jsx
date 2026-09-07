/**
 * @BACKEND_TEAM - ORDER TRACKING INTEGRATION:
 * 
 * 1. Fetch Tracking Data:
 *    - Query `GET /api/orders/track?orderId={id}` using the ID from the URL params.
 *    - The API should return full details: { orderId, date, status, estimatedDelivery, shipperName, trackingId, trackingLink, address, items, history }
 */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Package, MapPin, ExternalLink, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

export default function TrackingDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(res.data.data || res.data.order || res.data);
      } catch (error) {
        console.error('Error fetching order tracking:', error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="pt-32 text-center text-muted-foreground uppercase tracking-widest font-bold text-sm">Loading Tracking Data...</div>;
  }

  if (!order || !order.id) {
    return <div className="pt-32 text-center text-red-500 uppercase tracking-widest font-bold text-sm">Order Not Found</div>;
  }

  let address = order.shippingAddress;
  if (typeof order.shippingAddress === 'string') {
    try {
      address = JSON.parse(order.shippingAddress);
    } catch (e) {
      console.warn("Failed to parse shippingAddress JSON, falling back to string:", e);
      address = { street: order.shippingAddress };
    }
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8">
        <Link to="/" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-muted-foreground transition-colors w-fit border-b border-black pb-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl uppercase font-bold tracking-tight">Order Tracking</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Order #{order.id?.slice(-6)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tracking Hero & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking Card */}
          <div className="bg-white border border-border shadow-sm p-8 sm:p-10">

            {/* Horizontal Timeline */}
            <div className="relative mb-16 px-2 sm:px-8">
              {/* Background dotted line */}
              <div className="absolute top-4 left-10 right-10 h-0.5 border-t-2 border-dashed border-border z-0"></div>
              {/* Active solid line */}
              <div className="absolute top-4 left-10 h-1 bg-black transition-all duration-1000 z-0" style={{ width: order.status === 'DELIVERED' ? '100%' : (order.status === 'SHIPPING' ? '50%' : '0%'), marginTop: '-1px' }}></div>
              <div className="flex justify-between relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-black bg-black text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center">In Progress</p>
                  <p className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold text-center">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-4 ${(order.status === 'SHIPPING' || order.status === 'DELIVERED') ? 'border-black bg-black' : 'border-border bg-white'} flex items-center justify-center ${(order.status === 'SHIPPING' || order.status === 'DELIVERED') ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)]' : ''}`}>
                    {order.status === 'SHIPPING' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    {order.status === 'DELIVERED' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`mt-4 text-[10px] uppercase tracking-widest font-bold text-center ${order.status === 'IN_PROGRESS' && 'text-muted-foreground'}`}>Shipping</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-4 ${order.status === 'DELIVERED' ? 'border-black bg-black' : 'border-border bg-white'} flex items-center justify-center ${order.status === 'DELIVERED' ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)]' : ''}`}>
                    {order.status === 'DELIVERED' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p className={`mt-4 text-[10px] uppercase tracking-widest font-bold text-center ${order.status !== 'DELIVERED' && 'text-muted-foreground'}`}>Delivery</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Shipment Details */}
        <div className="space-y-8">
          
          {/* Items Card */}
          <div className="bg-white border border-border shadow-sm p-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Items in Shipment
            </h3>
            <div className="space-y-4">
              {(order.orderItems || order.items || []).map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted relative flex-shrink-0">
                    <img src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <Link to={`/product/${item.productId}`} className="font-bold uppercase tracking-widest text-xs hover:underline underline-offset-4 line-clamp-2">{item.name}</Link>
                    <p className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2 font-bold">Size: {item.size} {item.color && <><span className="mx-2 text-border">•</span> Color: {item.color}</>} <span className="mx-2 text-border">•</span> Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white border border-border shadow-sm p-6">
             <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Address
            </h3>
            <div className="text-sm font-medium uppercase tracking-widest leading-relaxed text-muted-foreground">
              <p className="text-black font-bold mb-2">{address?.name}</p>
              <p>{address?.street}</p>
              <p>{address?.city}</p>
              <p>{address?.country}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
