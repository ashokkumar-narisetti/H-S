/**
 * @BACKEND_TEAM - AUTHENTICATION INTEGRATION:
 * 
 * 1. Login Submission: 
 *    - Wire up the form to send `POST /api/auth/login` with `{ email, password }`.
 *    - On success, store the JWT (e.g., in an httpOnly cookie or Zustand store) and fetch the user profile.
 * 2. Signup Submission:
 *    - Wire up the form to send `POST /api/auth/register` with `{ fullName, username, email, countryCode, mobile, gender, dob, password }`.
 * 3. Form Validation:
 *    - Add client-side validation for passwords and backend error handling (e.g., "Email already exists", "Invalid credentials").
 *    - Use a global Auth store (e.g., `useAuthStore`) to track `isAuthenticated` state across the app.
 */
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { COUNTRIES } from '../data/countries';

function CountrySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  return (
    <div className="relative w-32 flex-shrink-0" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-3 py-4 border border-border bg-background flex items-center justify-between focus:outline-none focus:border-foreground"
      >
        <div className="flex items-center gap-2">
          <img src={selected.flag} alt={selected.iso} className="w-5 h-auto shadow-sm" />
          <span className="text-sm font-medium">{selected.code}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.code); setIsOpen(false); }}
              className="w-full px-3 py-3 flex items-center gap-2 hover:bg-muted transition-colors text-sm"
            >
              <img src={c.flag} alt={c.iso} className="w-5 h-auto shadow-sm" />
              <span className="font-medium">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [countryCode, setCountryCode] = useState('+91');
  
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location]);

  const login = useAuthStore(state => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    // @BACKEND_TEAM: Once API returns success and JWT, pass the user object here.
    login({ name: isLogin ? 'Returning User' : 'New User' });
    navigate('/');
  };

  return (
    <div className="pt-32 pb-20 max-w-md mx-auto px-4 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-muted-foreground uppercase text-xs tracking-widest">
          {isLogin 
            ? 'Sign in to access your wishlist, orders, and exclusive drops.' 
            : 'Join the collective for early access and faster checkout.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {isLogin ? (
          <>
            <input required type="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="password" placeholder="Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
          </>
        ) : (
          <>
            <input required type="text" placeholder="Full Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="text" placeholder="Username" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="email" placeholder="Email Address (Gmail preferred)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            
            <div className="flex gap-4">
              <CountrySelect value={countryCode} onChange={setCountryCode} />
              <input required type="tel" placeholder="Mobile Number" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" required defaultValue="">
                <option value="" disabled>Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <input required type="date" title="Date of Birth" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground uppercase text-xs tracking-widest text-muted-foreground" />
            </div>

            <input required type="password" placeholder="Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="password" placeholder="Confirm Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input required type="checkbox" className="w-5 h-5 accent-foreground mt-0.5" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground leading-relaxed">
                I accept the Terms & Conditions and confirm I am over 18 years old.
              </span>
            </label>
          </>
        )}

        <button type="submit" className="w-full py-4 mt-6 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-8 text-center">
        {isLogin ? (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              <button className="hover:text-foreground transition-colors underline underline-offset-4">Forgot your password?</button>
            </p>
            <p className="text-sm uppercase tracking-wide">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold border-b border-black pb-1 hover:text-muted-foreground transition-colors">Create one</Link>
            </p>
          </>
        ) : (
          <p className="text-sm uppercase tracking-wide">
            Already have an account?{' '}
            <Link to="/login" className="font-bold border-b border-black pb-1 hover:text-muted-foreground transition-colors">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
