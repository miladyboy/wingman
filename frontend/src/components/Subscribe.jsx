import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { UserCircle } from 'lucide-react';
import ScreenshotCTA from './assets/ScreenshotCTA.png';

// Reutilizamos el beneficio visual de la landing
function PricingBenefit({ text }) {
  return (
    <li className="flex items-center gap-4 text-base md:text-lg mb-3 md:mb-5">
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="none" />
        <path d="M8 15l4 4 8-8" stroke="#6C47D6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{text}</span>
    </li>
  );
}

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState('0');

  // FAQ data
  const faqs = [
    {
      question: "What if I already know how to flirt?",
      answer: "That's great — Harem doesn't replace your style, it sharpens it. Think of it as a co-pilot, not a replacement.",
    },
    {
      question: 'Can I cancel at any time?',
      answer: 'Yes! You can cancel your subscription anytime from your account settings. No questions asked.',
    },
    {
      question: 'Do I have to upload screenshots every time?',
      answer: 'No. You can paste text or just describe the situation. Harem works with what you give it.',
    },
    {
      question: "What if I'm only talking to one person?",
      answer: 'No problem. Harem helps you build better connection, timing, and tone, even in one-on-one chats.',
    },
    {
      question: 'Will it sound like a bot?',
      answer: 'No. Harem adapts to how you text — casual, serious, dry, or funny. The more you use it, the better it gets at matching your style.',
    },
  ];

  // Maneja el logout del usuario
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
    window.location.href = '/';
  };

  // Lógica para mostrar/ocultar el menú de perfil
  const handleProfileMenuToggle = () => setIsProfileMenuOpen((open) => !open);

  // Maneja el flujo de suscripción con Stripe
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white relative px-2 md:px-0">
      {/* Botón de perfil arriba a la derecha */}
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

      {/* Contenido principal */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-8 md:py-20">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4 text-gray-900"> Your unfair advantage in dating starts here</h1>
        <p className="text-center text-gray-700 text-lg md:text-xl mb-2">Get smarter, smoother, and more confident in every conversation, for less than the price of a beer a week.</p>
        <div className="text-center text-gray-900 font-bold text-lg md:text-2xl mb-4">Less awkward texts, more real dates — all for $4 a week.

</div>
        <Button
          size="lg"
          className="bg-[#6C47D6] text-white font-bold text-lg md:text-2xl px-8 py-4 rounded-md shadow-xl hover:bg-[#7d5ae2] transition mb-2"
          onClick={handleSubscribe}
          disabled={loading}
          data-testid="proceed-to-checkout-button"
        >
          {loading ? 'Redirecting...' : 'Start Now for $4/week'}
        </Button>
        <div className="text-xs text-gray-500 mb-6">Powered by Stripe. 100% secure. Cancel anytime</div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {/* Beneficios */}
        <ul className="w-full max-w-md mx-auto mb-6">
          <PricingBenefit text="Instant advice tailored to your chat screenshots" />
          <PricingBenefit text="Flirt like a pro, with memory for each conversation" />
          <PricingBenefit text="Avoid ghosting, dead ends, and awkward silences" />
          <PricingBenefit text="Know exactly what to text next" />
        </ul>
        {/* Imagen de chat CTA y testimonio juntos en desktop, en columna en mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full mb-6">
          <img 
            src={ScreenshotCTA} 
            alt="Chat example" 
            className="rounded-2xl shadow-lg w-full max-w-xs border border-gray-200 object-cover" 
            style={{ aspectRatio: '2.2/3' }}
          />
          <div className="italic text-gray-600 text-center md:text-left max-w-md md:max-w-xs mx-auto md:mx-0 flex-1 flex items-center justify-center min-h-[180px]">
            <span>"I like meeting girls, I just hate the small talk and guessing games. Harem makes it effortless, I just plug in the convo and it tells me what works."<br /><span className="not-italic font-semibold">— Beta User, M27</span></span>
          </div>
        </div>
        {/* FAQ */}
        <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq} className="w-full max-w-md mx-auto mb-8">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={String(idx)} className="mb-2 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow">
              <AccordionTrigger className={`text-base md:text-lg px-4 py-3 text-left font-bold transition-colors duration-200 ${openFaq === String(idx) ? 'text-[#6C47D6]' : 'text-gray-900'} focus:outline-none`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-700 text-sm md:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
} 