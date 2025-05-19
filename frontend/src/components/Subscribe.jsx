import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/button'; // Assuming Button is in ./ui/button relative to components directory
import { UserCircle } from 'lucide-react';

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.status !== 403) {
        console.error('Supabase signOut error:', error);
      }
    } catch (e) {
      console.error('Logout exception:', e);
    }
    // Selectively clear localStorage except 'cookie_consent'
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'cookie_consent') {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleProfileMenuToggle = () => setIsProfileMenuOpen((open) => !open);
  const handleProfileMenuClose = () => setIsProfileMenuOpen(false);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in.');
        setLoading(false);
        navigate('/');
        return;
      }
      const apiBase = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${apiBase}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create checkout session');
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (e) {
      setError(e.message || 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      {/* Profile button (top-right) */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileMenuToggle}
            data-testid="profile-menu-button"
            aria-label="Open profile menu"
          >
            <UserCircle className="h-7 w-7" />
          </Button>
          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg z-50"
              data-testid="profile-menu-dropdown"
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-accent text-destructive border-t border-border"
                onClick={handleLogout}
                data-testid="profile-menu-logout"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Subscribe to Harem</h2>
      <p className="mb-6">To access the app, please subscribe.</p>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Button size="lg" className="bg-royal text-ivory font-bold shadow-md hover:bg-royal/90" onClick={handleSubscribe} disabled={loading} data-testid="proceed-to-checkout-button">
        {loading ? 'Redirecting...' : 'Subscribe'}
      </Button>
    </div>
  );
} 