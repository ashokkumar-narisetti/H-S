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
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { COUNTRIES } from '../data/countries';
import wallpaper from '../assets/H-S-Wallpaper.png';

function TermsAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border mt-4">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-4 flex justify-between items-center bg-muted/30 text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors"
      >
        Read Terms & Conditions
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 text-xs text-muted-foreground leading-relaxed h-32 overflow-y-auto bg-background border-t border-border">
          <p>By creating an account, you agree to our terms of service and privacy policy. You confirm that all information provided is accurate and you are at least 18 years of age.</p>
          <p className="mt-2">1. Your data will be stored securely.</p>
          <p className="mt-2">2. We will not share your data with third parties.</p>
          <p className="mt-2">3. You can request account deletion at any time.</p>
        </div>
      )}
    </div>
  );
}

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

  const selected = COUNTRIES.find(c => c.name === value) || COUNTRIES.find(c => c.name === 'India') || COUNTRIES[0];

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 py-4 border border-border bg-background flex items-center justify-between focus:outline-none focus:border-foreground"
      >
        <div className="flex items-center gap-3">
          <img src={selected.flag} alt={selected.iso} className="w-5 h-auto shadow-sm" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{selected.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
          {COUNTRIES.map(c => (
            <button
              key={c.iso}
              type="button"
              onClick={() => { onChange(c.name); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
            >
              <img src={c.flag} alt={c.iso} className="w-5 h-auto shadow-sm" />
              <span className="font-medium uppercase tracking-widest text-muted-foreground text-xs">{c.name}</span>
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
  const [country, setCountry] = useState('India');
  const [dob, setDob] = useState('');
  
  const selectedCountryObj = COUNTRIES.find(c => c.name === country) || COUNTRIES.find(c => c.name === 'India');
  const countryCode = selectedCountryObj?.code || '+91';

  const calculatedAge = dob ? Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970) : '';

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location]);

  const login = useAuthStore(state => state.login);
  const signup = useAuthStore(state => state.signup);
  const isLoggingIn = useAuthStore(state => state.isLoggingIn);
  const isSigningUp = useAuthStore(state => state.isSigningUp);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password });
        navigate('/');
      } else {
        if (data.password !== data.confirmPassword) {
          return toast.error('Passwords do not match');
        }
        await signup({
          fullName: data.fullName,
          email: data.email,
          country,
          countryCode,
          mobile: data.mobile,
          gender: data.gender,
          dob: data.dob,
          password: data.password
        });
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background pt-16 lg:pt-0">
      {/* Left side: Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="/auth-side.png" alt="H&S Wallpaper" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-20 lg:py-32">
        <div className="max-w-md w-full">
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
            <input required type="email" name="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="password" name="password" placeholder="Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
          </>
        ) : (
          <>
            <input required type="text" name="fullName" placeholder="Full Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="email" name="email" placeholder="Email Address (Gmail preferred)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            
            <CountrySelect value={country} onChange={setCountry} />
            
            <div className="flex gap-4">
              <input type="text" value={countryCode} readOnly className="w-24 p-4 border border-border bg-muted/50 text-muted-foreground focus:outline-none cursor-not-allowed text-center font-medium" />
              <input required type="tel" name="mobile" placeholder="Mobile Number" className="flex-1 p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Gender</label>
                <select name="gender" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" required defaultValue="">
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Date of Birth</label>
                <input 
                  required 
                  type="date" 
                  name="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground uppercase text-xs tracking-widest text-muted-foreground" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Age</label>
                <input 
                  type="text" 
                  value={calculatedAge ? `${calculatedAge} YRS` : ''} 
                  readOnly 
                  placeholder="AUTO"
                  className="w-full p-4 border border-border bg-muted/50 text-muted-foreground focus:outline-none cursor-not-allowed uppercase text-xs tracking-widest font-medium" 
                />
              </div>
            </div>

            <input required type="password" name="password" placeholder="Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            
            <TermsAccordion />
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input required type="checkbox" className="w-5 h-5 accent-foreground mt-0.5" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground leading-relaxed">
                I accept the Terms & Conditions and confirm I am over 18 years old.
              </span>
            </label>
          </>
        )}

        <button disabled={isLoggingIn || isSigningUp} type="submit" className="w-full py-4 mt-6 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50">
          {isLoggingIn || isSigningUp ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
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
      </div>
    </div>
  );
}
