import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '../services/supabaseClient';
import apiBase from '../utils/env';

const SIMP_PREFERENCE_OPTIONS = [
  { value: 'auto', label: "Let AI decide what's best (recommended)" },
  { value: 'low', label: 'Stay confident & cold (max level 1)' },
  { value: 'neutral', label: 'Balanced & playful (target level 2)' },
  { value: 'high', label: 'Flirty & generous (min level 3)' },
];

export default function UserPreferences({ trigger, onSaved }) {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('auto');
  const [simpPreference, setSimpPreference] = useState('auto');
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
          const res = await fetch(`${apiBase}/api/user/preferences`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const data = await res.json();
          setPreferences(data.preferences || '');
          setPreferredCountry(data.preferredCountry || 'auto');
          setSimpPreference(data.simpPreference || 'auto');
          setLoading(false);
        } catch {
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
      const res = await fetch(`${apiBase}/api/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ preferences, preferredCountry, simpPreference })
      });
      if (res.ok) {
        setSuccess(true);
        onSaved && onSaved({ preferences, preferredCountry, simpPreference });
        setTimeout(() => setOpen(false), 800);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch {
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

          {/* Preferred Country Dropdown */}
          <label htmlFor="preferred-country" className="block text-sm font-medium text-gray-700 mt-4">Preferred Country</label>
          <input
            id="preferred-country"
            type="text"
            value={preferredCountry}
            onChange={e => setPreferredCountry(e.target.value)}
            placeholder="e.g. Argentina, Spain, auto"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50 sm:text-sm"
          />

          {/* Simp Preference Dropdown */}
          <label htmlFor="simp-preference" className="block text-sm font-medium mb-2 mt-4">Preferred Simp Style</label>
          <select
            id="simp-preference"
            value={simpPreference}
            onChange={e => setSimpPreference(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            disabled={loading || saving}
            data-testid="simp-preference-dropdown"
          >
            {SIMP_PREFERENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

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