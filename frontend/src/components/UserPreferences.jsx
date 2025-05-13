import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '../services/supabaseClient';

export default function UserPreferences({ trigger, onSaved }) {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token;
          if (!accessToken) throw new Error('No access token');
          const res = await fetch('/api/user/preferences', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const data = await res.json();
          setPreferences(data.preferences || '');
          setLoading(false);
        } catch (err) {
          setError('Failed to load preferences');
          setLoading(false);
        }
      })();
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('No access token');
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ preferences })
      });
      if (res.ok) {
        setSuccess(true);
        onSaved && onSaved(preferences);
        setTimeout(() => setOpen(false), 800);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError('Failed to save preferences');
    }
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Edit Preferences</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <label htmlFor="preferences" className="block text-sm font-medium mb-2">What are you looking for? What do you like?</label>
          <Textarea
            id="preferences"
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
            placeholder="Describe what you're looking for, your interests, etc."
            maxLength={1000}
            rows={6}
            disabled={loading || saving}
            className="mb-2"
            data-testid="preferences-textarea"
          />
          <div className="text-xs text-muted-foreground mb-2">Max 1000 characters</div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">Preferences saved!</div>}
        </div>
        <SheetFooter>
          <Button onClick={handleSave} disabled={saving || loading} data-testid="save-preferences">{saving ? 'Saving...' : 'Save'}</Button>
          <SheetClose asChild>
            <Button variant="ghost" disabled={saving || loading}>Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 