import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import apiBase from '../utils/env';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error, data }) => {
          if (error) {
            setFormError(error.message);
          } else {
            // Success, session exchanged
          }
          navigate('/app');
        })
        .catch(err => {
          setFormError(err.message)
        })
        .finally(() => {
          window.history.replaceState({}, document.title, '/auth');
        });
    }
  }, [location.search, navigate]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    setFormSuccess('');

    const { data, error } = isRegistering
      ? await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              username: username,
            },
          },
        })
      : await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

    const user = data?.user;
    const session = data?.session;

    if (error) {
      setFormError(error.message || 'An error occurred.');
      setFormSuccess('');
    } else if (isRegistering && user && !session) {
      if (user.identities && user.identities.length === 0) {
        setFormError('User already exists. Please sign in.');
        setFormSuccess('');
      } else {
        setFormSuccess('Registration successful! Please check your email and confirm your account.');
        setFormError('');
      }
    } 
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setFormError('');
    try {
      const res = await fetch(`${apiBase}/api/auth/google`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to start Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md border border-accent shadow-xl bg-card">
        <CardHeader className="bg-primary rounded-t-xl p-6 mb-2 shadow-md">
          <CardTitle className="text-center text-2xl font-sans text-primary-foreground">
            {isRegistering ? 'Register' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center text-primary-foreground mt-1">
            {isRegistering ? 'Create a new account' : 'Sign in to your account'} via email and password
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-6 flex flex-col gap-4">
          {formSuccess && (
            <Alert variant="success" className="mb-2">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}
          {formError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            {isRegistering && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your username (min 3 chars)"
                  value={username}
                  required
                  minLength={3}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input text-foreground border border-border focus:ring-2 focus:ring-primary/60 focus:border-primary/80"
                  data-testid="register-username"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input text-foreground border border-border focus:ring-2 focus:ring-primary/60 focus:border-primary/80"
                data-testid={isRegistering ? "register-email" : "login-email"}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password (min 6 chars)"
                value={password}
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input text-foreground border border-border focus:ring-2 focus:ring-primary/60 focus:border-primary/80"
                data-testid={isRegistering ? "register-password" : "login-password"}
              />
            </div>
          <Button
            type="submit"
            className="w-full mt-2 bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-colors duration-200"
            disabled={loading}
            data-testid={isRegistering ? "register-submit" : "login-submit"}
          >
            {loading ? 'Loading...' : isRegistering ? 'Register' : 'Sign In'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-white border border-gray-300 shadow-sm text-base font-normal text-black hover:bg-gray-100 hover:border-gray-400 hover:text-black transition-colors duration-200"
            data-testid="google-login-button"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#fbc02d" d="M43.6 20.5h-1.6V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-1.4z"/><path fill="#e53935" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3c-7.2 0-13.4 3.1-17.7 8z"/><path fill="#4caf50" d="M24 45c5.4 0 10.4-1.8 14.3-4.9l-6.6-5.4C29.1 36.9 26.7 37.7 24 37.7c-5.6 0-10.3-3.8-12-9H6.3C8.6 39.2 15.7 45 24 45z"/><path fill="#1565c0" d="M43.6 20.5h-1.6V20H24v8h11.3c-1.1 3-3.7 5.2-7.3 5.2-2.1 0-4-.7-5.5-1.9l-6.6 5.4C14.5 43.9 19.5 45 24 45c10.5 0 19.5-7.6 21-18h-1.4z"/></g></svg>
              Continue with Google
            </span>
          </Button>
        </form>
        <Button
          variant="link"
          type="button"
          onClick={() => {
              setIsRegistering(!isRegistering);
              setFormError("");
              setFormSuccess("");
            }}
            className="w-full mt-2 text-primary underline-offset-4 hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 