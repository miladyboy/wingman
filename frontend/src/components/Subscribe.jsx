import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button'; // Assuming Button is in ./ui/button relative to components directory

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Moved useNavigate hook here

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.status !== 403) {
        console.error('Supabase signOut error:', error);
      }
    } catch (e) {
      console.error('Logout exception:', e);
    }
    localStorage.clear();
    sessionStorage.clear();
    // If you use Redux or React context for user, reset it here
    window.location.href = '/';
  };

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
      const res = await fetch('/api/payments/create-checkout-session', {
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Subscribe to Harem</h2>
      <p className="mb-6">To access the app, please subscribe.</p>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Button size="lg" className="bg-royal text-ivory font-bold shadow-md hover:bg-royal/90" onClick={handleSubscribe} disabled={loading} data-testid="proceed-to-checkout-button">
        {loading ? 'Redirecting...' : 'Subscribe'}
      </Button>
      <Button size="sm" variant="outline" className="mt-6" onClick={handleLogout} disabled={loading} data-testid="logout-button">
        Log out
      </Button>
    </div>
  );
} 