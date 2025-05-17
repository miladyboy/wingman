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
        .then(({ error }) => {
          if (error) setFormError(error.message);
          navigate('/app');
        })
        .catch(err => setFormError(err.message))
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
            className="w-full mt-2"
            data-testid="google-login-button"
          >
            Continue with Google
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