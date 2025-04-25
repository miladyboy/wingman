import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); 
  const [username, setUsername] = useState(''); 
  const [inviteCode, setInviteCode] = useState(''); 
  const [inviteError, setInviteError] = useState(''); 
  const [formError, setFormError] = useState('');

  const apiBase = import.meta.env.VITE_BACKEND_URL || '';

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setInviteError('');
    setFormError('');

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
      setFormError(error.error_description || error.message);
    } else {
      // Login/Signup successful, App.jsx will detect session change
      console.log(isRegistering ? 'Signup successful!' : 'Login successful!', data);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{isRegistering ? 'Register' : 'Sign In'}</CardTitle>
          <CardDescription className="text-center">
            {isRegistering ? 'Create a new account' : 'Sign in to your account'} via email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {isRegistering && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username (min 3 chars)"
                    value={username}
                    required
                    minLength={3}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    required
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  {inviteError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{inviteError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password (min 6 chars)"
                value={password}
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Loading...' : isRegistering ? 'Register' : 'Sign In'}
            </Button>
          </form>
          <Button
            variant="link"
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setFormError("");
              setInviteError("");
            }}
            className="w-full mt-4"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 