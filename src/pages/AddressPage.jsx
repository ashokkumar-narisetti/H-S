import { useState } from 'react';
import { Plus, MapPin, Check, Trash2 } from 'lucide-react';

export default function AddressPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'John Doe',
      street: '123 Streetwear Ave, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      isDefault: true
    }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', street: '', city: '', state: '', zip: '', country: ''
  });

  const handleAdd = (e) => {
    e.preventDefault();
    setAddresses([
      ...addresses, 
      { 
        ...newAddress, 
        id: Date.now(), 
        isDefault: addresses.length === 0 
      }
    ]);
    setIsAdding(false);
    setNewAddress({ name: '', street: '', city: '', state: '', zip: '', country: '' });
  };

  const setDefault = (id) => {
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
  };

  const removeAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-end mb-12 border-b border-border pb-6">
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight">My Addresses</h1>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-3 hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto">
        {isAdding && (
          <form onSubmit={handleAdd} className="border border-border p-6 mb-12 bg-muted/10">
            <h2 className="font-heading text-lg font-bold uppercase tracking-widest mb-6">Add New Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="col-span-2 p-3 border border-border focus:outline-none focus:border-foreground" />
              <input required type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="col-span-2 p-3 border border-border focus:outline-none focus:border-foreground" />
              <input required type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="p-3 border border-border focus:outline-none focus:border-foreground" />
              <input required type="text" placeholder="State/Province" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="p-3 border border-border focus:outline-none focus:border-foreground" />
              <input required type="text" placeholder="ZIP/Postal Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="p-3 border border-border focus:outline-none focus:border-foreground" />
              <input required type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="p-3 border border-border focus:outline-none focus:border-foreground" />
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="text-xs font-bold uppercase tracking-widest text-white bg-black px-6 py-3 hover:bg-black/80 transition-colors">Save Address</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold uppercase tracking-widest border border-border px-6 py-3 hover:bg-muted transition-colors">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className={`border p-6 relative ${addr.isDefault ? 'border-foreground border-2' : 'border-border'}`}>
              {addr.isDefault && (
                <span className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Default
                </span>
              )}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-bold uppercase tracking-widest text-sm mb-2">{addr.name}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {addr.street}<br />
                    {addr.city}, {addr.state} {addr.zip}<br />
                    {addr.country}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t border-border/50">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="text-xs font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
                    Set as Default
                  </button>
                )}
                <button onClick={() => removeAddress(addr.id)} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors ml-auto flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && !isAdding && (
            <div className="col-span-2 text-center py-12 border border-border border-dashed">
              <p className="text-muted-foreground uppercase tracking-widest text-xs">No addresses saved yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
