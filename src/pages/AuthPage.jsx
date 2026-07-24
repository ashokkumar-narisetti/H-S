/**
 * @BACKEND_TEAM - AUTHENTICATION INTEGRATION:
 * 
 * 1. Login Submission: 
 *    - Wire up the form to send `POST /api/auth/login` with `{ email, password }`.
 *    - On success, store the JWT (e.g., in an httpOnly cookie or Zustand store) and fetch the user profile.
 * 2. Signup Submission:
 *    - Wire up the form to send `POST /api/auth/register` with `{ firstName, lastName, email, password }`.
 * 3. Form Validation:
 *    - Add client-side validation for passwords and backend error handling (e.g., "Email already exists", "Invalid credentials").
 *    - Use a global Auth store (e.g., `useAuthStore`) to track `isAuthenticated` state across the app.
 */
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock Auth
    alert(`${isLogin ? 'Logged in' : 'Signed up'} successfully!`);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="First Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
            <input required type="text" placeholder="Last Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
          </div>
        )}
        
        <input required type="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
        <input required type="password" placeholder="Password" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />

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
