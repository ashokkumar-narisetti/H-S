import { Search } from 'lucide-react';

export default function TrackOrderPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 min-h-screen text-center">
      <h1 className="font-heading text-4xl uppercase font-bold mb-4">Track Your Order</h1>
      <p className="text-muted-foreground text-sm uppercase tracking-widest mb-12">Enter your order number and email to see the status.</p>
      
      <form className="space-y-6 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
        <input required type="text" placeholder="Order Number (e.g. ORD-001)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
        <input required type="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
        
        <button type="submit" className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Track Order
        </button>
      </form>
    </div>
  );
}
