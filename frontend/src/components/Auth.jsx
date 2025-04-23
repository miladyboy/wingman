import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); 
  const [username, setUsername] = useState(''); 
  const [inviteCode, setInviteCode] = useState(''); 
  const [inviteError, setInviteError] = useState(''); 

  const apiBase = import.meta.env.VITE_BACKEND_URL || '';

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setInviteError('');

    if (isRegistering) {

      // Validate invite code first
      try {
        const response = await fetch(`${apiBase}/api/validate-invite-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inviteCode })
        });
        const result = await response.json();
        if (!result.valid) {
          setInviteError(result.error || 'Invalid invite code.');
          setLoading(false);
          return;
        }
      } catch (e) {
        setInviteError('Error validating invite code.');
        setLoading(false);
        return;
      }
    }
    const { data, error } = isRegistering
      ? await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              username: username,
              invite_code: inviteCode,
            },
          },
        })
      : await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      // Login/Signup successful, App.jsx will detect session change
      console.log(isRegistering ? 'Signup successful!' : 'Login successful!', data);
    }
    setLoading(false);
  };

  return (
    <div className="row flex-center flex" style={{ padding: '20px', maxWidth: '400px', margin: '40px auto', border: '1px solid #ccc', borderRadius: '8px' }}> {/* Basic Styling */}
      <div className="col-6 form-widget" aria-live="polite">
        <h1 className="header" style={{ textAlign: 'center', marginBottom: '20px' }}>{isRegistering ? 'Register' : 'Sign In'}</h1>
        <p className="description" style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>
          {isRegistering ? 'Create a new account' : 'Sign in to your account'} via email and password
        </p>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}> {/* Styling */}
           {isRegistering && (
             <>
             <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                <input
                    id="username"
                    className="inputField"
                    type="text"
                    placeholder="Your username (min 3 chars)"
                    value={username}
                    required={true}
                    minLength="3" // Add minLength based on DB constraint
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} // Styling
                />
             </div>
             <div>
                <label htmlFor="inviteCode" style={{ display: 'block', marginBottom: '5px' }}>Invite Code</label>
                <input
                  id="inviteCode"
                  className="inputField"
                  type="text"
                  placeholder="Enter your invite code"
                  value={inviteCode}
                  required={true}
                  onChange={(e) => setInviteCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {inviteError && <div style={{ color: 'red', marginTop: '5px' }}>{inviteError}</div>}
             </div>
             </>
           )}
           <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              id="email"
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} // Styling
            />
          </div>
           <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              id="password"
              className="inputField"
              type="password"
              placeholder="Your password (min 6 chars)"
              value={password}
              required={true}
              minLength="6" // Default Supabase minimum
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} // Styling
            />
          </div>
          <div>
            <button type="submit" className="button block" disabled={loading} style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '4px', background: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}> {/* Styling */}
              {loading ? <span>Loading...</span> : <span>{isRegistering ? 'Register' : 'Sign In'}</span>}
            </button>
          </div>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="button-link"
          style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer', marginTop: '20px', display: 'block', textAlign: 'center' }} // Styling
        >
          {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
} 