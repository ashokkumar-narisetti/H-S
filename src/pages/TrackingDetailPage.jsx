/**
 * @BACKEND_TEAM - ORDER TRACKING INTEGRATION:
 * 
 * 1. Fetch Tracking Data:
 *    - Query `GET /api/orders/track?orderId={id}` using the ID from the URL params.
 *    - The API should return full details: { orderId, date, status, estimatedDelivery, shipperName, trackingId, trackingLink, address, items, history }
 */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Package, MapPin, ExternalLink, Clock } from 'lucide-react';

export default function TrackingDetailPage() {
  const { orderId } = useParams();

  // Enriched Mock Data for a premium ecommerce feel
  const orderDetails = {
    id: orderId || 'ORD-0948',
    date: 'October 25, 2023',
    status: 'In Transit', // Active status
    estimatedDelivery: 'Tomorrow by 8:00 PM',
    shipper: 'Blue Dart',
    trackingId: 'BD-982374982374',
    trackingLink: 'https://bluedart.com',
    address: {
      name: 'Rahul Sharma',
      street: '456 Fashion Street, Andheri West',
      city: 'Mumbai, MH 400053',
      country: 'India'
    },
    items: [
      { id: 'hd-1', name: 'Oversized Heavyweight Hoodie', size: 'L', qty: 1, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' }
    ],
    history: [
      { date: 'Oct 26, 8:45 AM', location: 'Mumbai, MH', status: 'Out for delivery', completed: false, active: true },
      { date: 'Oct 26, 6:30 AM', location: 'Mumbai, MH', status: 'Arrived at local sorting facility', completed: true, active: false },
      { date: 'Oct 25, 11:20 PM', location: 'Pune, MH', status: 'Departed regional hub', completed: true, active: false },
      { date: 'Oct 25, 4:00 PM', location: 'Warehouse', status: 'Package picked up by carrier', completed: true, active: false },
      { date: 'Oct 25, 2:15 PM', location: 'Warehouse', status: 'Label created, awaiting carrier pickup', completed: true, active: false },
      { date: 'Oct 25, 10:05 AM', location: 'Online', status: 'Order confirmed', completed: true, active: false }
    ]
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8">
        <Link to="/track-orders" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-muted-foreground transition-colors w-fit border-b border-black pb-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl uppercase font-bold tracking-tight">Order Tracking</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Order #{orderDetails.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tracking Hero & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking Hero Card */}
          <div className="bg-white border border-border shadow-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10">
              <div>
                <h2 className="font-heading text-4xl uppercase font-black tracking-tight mb-2">{orderDetails.status}</h2>
                <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Estimated Delivery: <span className="text-black font-bold uppercase tracking-widest">{orderDetails.estimatedDelivery}</span>
                </p>
              </div>
              <div className="bg-muted/30 p-4 border border-border text-center sm:text-right">
                <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold mb-1">Carrier: {orderDetails.shipper}</p>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <p className="font-bold uppercase tracking-widest text-lg">{orderDetails.trackingId}</p>
                  <a href={orderDetails.trackingLink} target="_blank" rel="noopener noreferrer" className="text-black hover:text-muted-foreground transition-colors" title="Track on carrier site">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Horizontal Timeline */}
            <div className="relative mb-12 px-2 sm:px-8">
              {/* Background dotted line */}
              <div className="absolute top-4 left-10 right-10 h-0.5 border-t-2 border-dashed border-border z-0"></div>
              {/* Active solid line */}
              <div className="absolute top-4 left-10 h-1 bg-black transition-all duration-1000 z-0" style={{ width: '66%', marginTop: '-1px' }}></div>
              <div className="flex justify-between relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-black bg-black text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center">Confirmed</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-black bg-black text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center">Shipped</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-black bg-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center">Out for<br/>Delivery</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-border bg-white flex items-center justify-center">
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-center text-muted-foreground">Delivered</p>
                </div>
              </div>
            </div>

            {/* Detailed History Log */}
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Tracking History</h3>
              <div className="space-y-6">
                {orderDetails.history.map((event, idx) => (
                  <div key={idx} className="flex gap-4 sm:gap-6 relative">
                    <div className="w-24 sm:w-32 flex-shrink-0 text-right pt-0.5">
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${event.active ? 'text-black' : 'text-muted-foreground'}`}>{event.date}</p>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${event.active ? 'border-black bg-black' : event.completed ? 'border-black bg-white' : 'border-border bg-white'} z-10`}></div>
                      {idx !== orderDetails.history.length - 1 && (
                        <div className="w-px h-full bg-border absolute top-3"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-bold uppercase tracking-widest ${event.active ? 'text-black' : 'text-muted-foreground'}`}>{event.status}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{event.location}</p>
                    </div>
                  </div>
                ))}
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
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted relative flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <Link to={`/product/${item.id}`} className="font-bold uppercase tracking-widest text-xs hover:underline underline-offset-4 line-clamp-2">{item.name}</Link>
                    <p className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2 font-bold">Size: {item.size} • Qty: {item.qty}</p>
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
              <p className="text-black font-bold mb-2">{orderDetails.address.name}</p>
              <p>{orderDetails.address.street}</p>
              <p>{orderDetails.address.city}</p>
              <p>{orderDetails.address.country}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
