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
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

export default function AccountProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    username: 'johndoe99',
    email: 'john.doe@gmail.com',
    mobile: '+91 9876543210',
    gender: 'Male',
    dob: '1999-12-31',
    country: '+91'
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // @BACKEND_TEAM: PUT /api/user/profile with `profile` payload
    setIsEditing(false);
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">My Account</h1>
      
      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest">Profile Details</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors">Edit Profile</button>
            ) : (
              <button onClick={handleSave} className="text-xs font-bold uppercase tracking-widest text-white bg-black px-4 py-2 hover:bg-black/80 transition-colors">Save Changes</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Full Name</p>
              {isEditing ? (
                <input name="fullName" value={profile.fullName} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.fullName}</p>
              )}
            </div>
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Username</p>
              {isEditing ? (
                <input name="username" value={profile.username} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">@{profile.username}</p>
              )}
            </div>
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
              {isEditing ? (
                <input name="email" type="email" value={profile.email} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.email}</p>
              )}
            </div>
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mobile Number</p>
              {isEditing ? (
                <input name="mobile" value={profile.mobile} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.mobile}</p>
              )}
            </div>
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Gender</p>
              {isEditing ? (
                <select name="gender" value={profile.gender} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.gender}</p>
              )}
            </div>
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Date of Birth</p>
              {isEditing ? (
                <input name="dob" type="date" value={profile.dob} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground uppercase text-xs tracking-widest" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20 uppercase text-xs tracking-widest">{profile.dob}</p>
              )}
            </div>
            
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Country / Region</p>
              {isEditing ? (
                <select name="country" value={profile.country} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground uppercase text-xs tracking-widest">
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-3 border border-border p-3 bg-muted/20">
                  <img src={COUNTRIES.find(c => c.code === profile.country)?.flag || COUNTRIES[0].flag} alt="Flag" className="w-5 h-auto shadow-sm" />
                  <span className="font-bold uppercase text-xs tracking-widest">{COUNTRIES.find(c => c.code === profile.country)?.name || COUNTRIES[0].name}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
