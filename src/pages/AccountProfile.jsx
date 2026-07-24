/**
 * @BACKEND_TEAM - ACCOUNT PROFILE INTEGRATION:
 * 
 * 1. User Data Fetching:
 *    - On mount, query `GET /api/user/profile` to populate first name, last name, email, mobile, address, etc.
 *    - Handle unauthorized responses by redirecting to `/login`.
 * 2. Edit Profile:
 *    - Clicking "Edit" should open a form. On submit, `PUT /api/user/profile` with updated fields.
 * 3. Sign Out:
 *    - Call `POST /api/auth/logout` to destroy session/clear httpOnly cookies.
 *    - Clear local client states (Zustand auth store, cart, etc.) and redirect to `/`.
 */
import { Link } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';

export default function AccountProfile() {
  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">My Account</h1>
      
      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest">Profile Details</h2>
            <button className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors">Edit Profile</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">First Name</p>
                <p className="font-bold border border-border p-3 bg-muted/20">John</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Last Name</p>
                <p className="font-bold border border-border p-3 bg-muted/20">Doe</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <p className="font-bold border border-border p-3 bg-muted/20">john.doe@example.com</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mobile Number</p>
                <p className="font-bold border border-border p-3 bg-muted/20">+1 (555) 123-4567</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Default Shipping Address</p>
                <p className="font-bold border border-border p-3 bg-muted/20">
                  123 Streetwear Ave, Apt 4B<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
