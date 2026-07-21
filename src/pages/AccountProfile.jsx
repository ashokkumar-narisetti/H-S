import { Link } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';

export default function AccountProfile() {
  const mockOrders = [
    { id: 'ORD-001', date: '2023-10-25', total: 170.00, status: 'Delivered', items: 2 },
    { id: 'ORD-002', date: '2023-09-12', total: 85.00, status: 'Delivered', items: 1 }
  ];

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col space-y-2 border border-border p-4">
            <Link to="/account" className="flex items-center gap-3 p-3 bg-muted font-bold uppercase tracking-widest text-sm">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link to="/account" className="flex items-center gap-3 p-3 hover:bg-muted font-bold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Package className="w-4 h-4" /> Orders
            </Link>
            <button className="flex items-center gap-3 p-3 hover:bg-muted font-bold uppercase tracking-widest text-sm text-red-500 hover:text-red-600 transition-colors text-left">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mb-6">Profile Details</h2>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">First Name</p>
                <p className="font-bold border border-border p-3">John</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Last Name</p>
                <p className="font-bold border border-border p-3">Doe</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <p className="font-bold border border-border p-3">john.doe@example.com</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mb-6">Order History</h2>
            <div className="border border-border">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div>Order</div>
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Total</div>
              </div>
              {mockOrders.map(order => (
                <div key={order.id} className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 text-sm font-medium items-center">
                  <div className="font-bold">{order.id}</div>
                  <div>{order.date}</div>
                  <div>
                    <span className="px-2 py-1 bg-black text-white text-[10px] uppercase tracking-widest">{order.status}</span>
                  </div>
                  <div className="text-right">${order.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
