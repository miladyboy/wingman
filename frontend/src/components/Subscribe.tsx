import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import ScreenshotCTA from "./assets/ScreenshotCTA.png";
import UserProfileMenu from "./ui/UserProfileMenu";

/**
 * Props interface for PricingBenefit component.
 */
interface PricingBenefitProps {
  text: string;
}

// Reutilizamos el beneficio visual de la landing
function PricingBenefit({ text }: PricingBenefitProps) {
  return (
    <li className="flex items-center gap-4 text-base md:text-lg mb-3 md:mb-5">
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="none" />
        <path
          d="M8 15l4 4 8-8"
          stroke="#6C47D6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
    </li>
  );
}

// Hook para detectar si es mobile (simple, usando window.innerWidth)
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState("0");

  // FAQ data
  const faqs = [
    {
      question: "What if I already know how to flirt?",
      answer:
        "That's great — Harem doesn't replace your style, it sharpens it. Think of it as a co-pilot, not a replacement.",
    },
    {
      question: "Can I cancel at any time?",
      answer:
        "Yes! You can cancel your subscription anytime from your account settings. No questions asked.",
    },
    {
      question: "Do I have to upload screenshots every time?",
      answer:
        "No. You can paste text or just describe the situation. Harem works with what you give it.",
    },
    {
      question: "What if I'm only talking to one person?",
      answer:
        "No problem. Harem helps you build better connection, timing, and tone, even in one-on-one chats.",
    },
    {
      question: "Will it sound like a bot?",
      answer:
        "No. Harem adapts to how you text — casual, serious, dry, or funny. The more you use it, the better it gets at matching your style.",
    },
  ];

  // Maneja el logout del usuario
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.status !== 403) {
        console.error("Supabase signOut error:", error);
      }
    } catch (e) {
      console.error("Logout exception:", e);
    }
    // Selectively clear localStorage except 'cookie_consent'
    Object.keys(localStorage).forEach((key) => {
      if (key !== "cookie_consent") {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    window.location.href = "/";
  };

  // Maneja el flujo de suscripción con Stripe
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in.");
        setLoading(false);
        navigate("/");
        return;
      }
      const apiBase = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(
        `${apiBase}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create checkout session");
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (e) {
      setError((e as Error).message || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white relative px-2 md:px-0">
      {/* Botón de perfil arriba a la derecha */}
      <div className="absolute top-4 right-4 z-50">
        <UserProfileMenu
          onLogout={handleLogout}
          onAccount={() => {}}
          showAccountOption={false}
          icon={null}
          userName=""
          avatarUrl={null}
          buttonTestId="profile-menu-button"
          menuTestId="profile-menu-dropdown"
        />
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-8 md:py-20">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">
          {" "}
          Your unfair advantage in dating starts here
        </h1>
        <p className="text-center text-gray-700 text-lg md:text-xl mb-2">
          Get smarter, smoother, and more confident in every conversation, for
          less than the price of a beer a week.
        </p>
        <div className="text-center text-gray-900 font-bold text-lg md:text-2xl mb-4">
          Less awkward texts, more real dates — all for $4 a week.
        </div>
        <Button
          size="lg"
          className="bg-[#6C47D6] text-white font-bold text-lg md:text-2xl px-8 py-4 rounded-md shadow-xl hover:bg-[#7d5ae2] transition mb-2"
          onClick={handleSubscribe}
          disabled={loading}
          data-testid="proceed-to-checkout-button"
        >
          {loading ? "Redirecting..." : "Start Now for $4/week"}
        </Button>
        <div className="text-xs text-gray-500 mb-6">
          Powered by Stripe. 100% secure. Cancel anytime
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {/* Beneficios */}
        <ul className="w-full max-w-md mx-auto mb-6">
          <PricingBenefit text="Instant advice tailored to your chat screenshots" />
          <PricingBenefit text="Flirt like a pro, with memory for each conversation" />
          <PricingBenefit text="Avoid ghosting, dead ends, and awkward silences" />
          <PricingBenefit text="Know exactly what to text next" />
        </ul>
        {/* Imagen de chat CTA con tilt y glow, y testimonio al lado en desktop */}
        <TiltedScreenshotWithGlow />
        {/* FAQ */}
        <Accordion
          type="single"
          collapsible
          value={openFaq}
          onValueChange={setOpenFaq}
          className="w-full max-w-md mx-auto mb-8"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={String(idx)}
              className="mb-2 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow"
            >
              <AccordionTrigger
                className={`text-base md:text-lg px-4 py-3 text-left font-bold transition-colors duration-200 ${
                  openFaq === String(idx) ? "text-[#6C47D6]" : "text-gray-900"
                } focus:outline-none`}
              >
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

// Componente separado para el tilt y glow
function TiltedScreenshotWithGlow() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Reset tilt on mobile or mouse leave
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Limitar el tilt máximo a 12 grados
    const maxTilt = 12;
    const tiltX = ((y - centerY) / centerY) * maxTilt * -1;
    const tiltY = ((x - centerX) / centerX) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full mb-6">
      <div
        ref={ref}
        className="relative w-full max-w-xs mx-auto md:mx-0"
        style={{ perspective: 900 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          resetTilt();
          setHovered(false);
        }}
        onMouseEnter={() => setHovered(true)}
        tabIndex={-1}
      >
        {/* Glow violeta detrás */}
        <div
          className={`absolute inset-0 z-0 rounded-2xl pointer-events-none transition-all duration-300 ${
            hovered ? "opacity-80 scale-105" : "opacity-50 scale-100"
          }`}
          style={{
            background:
              "radial-gradient(circle at 60% 40%, #6C47D6 0%, #fff0 70%)",
            filter: "blur(32px)",
          }}
        />
        {/* Imagen con tilt */}
        <img
          src={ScreenshotCTA}
          alt="Chat example"
          className="relative z-10 rounded-2xl shadow-lg w-full border border-gray-200 object-cover transition-transform duration-300"
          style={{
            aspectRatio: "2.2/3",
            transform: isMobile
              ? "none"
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
                  hovered ? 1.04 : 1
                })`,
          }}
          draggable={false}
        />
      </div>
      <div className="italic text-gray-600 text-center md:text-left max-w-md md:max-w-xs mx-auto md:mx-0 flex-1 flex items-center justify-center min-h-[180px]">
        <span>
          "I like meeting girls, I just hate the small talk and guessing games.
          Harem makes it effortless, I just plug in the convo and it tells me
          what works."
          <br />
          <span className="not-italic font-semibold">— Beta User, M27</span>
        </span>
      </div>
    </div>
  );
}
