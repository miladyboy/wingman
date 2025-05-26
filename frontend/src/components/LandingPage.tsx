import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import Logo from "./assets/LOGO.png";
import CustomCard from "./ui/CustomCard";

/**
 * Props interface for BrandLogo component.
 */
interface BrandLogoProps {
  onClick: () => void;
}

/**
 * Props interface for CTAButton component.
 */
interface CTAButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "lg" | "xl" | "base";
  [key: string]: any;
}

/**
 * Props interface for HowItWorksCard component.
 */
interface HowItWorksCardProps {
  number: number;
  emoji: string;
  title: string;
  description: string;
}

/**
 * Props interface for EdgeFeature component.
 */
interface EdgeFeatureProps {
  emoji: string;
  title: string;
  description: string;
  onHover?: () => void;
  onLeave?: () => void;
  hovered?: boolean;
}

/**
 * Props interface for PricingBenefit component.
 */
interface PricingBenefitProps {
  text: string;
}

/**
 * Props interface for FaqAccordionItem component.
 */
interface FaqAccordionItemProps {
  value: string;
  question: string;
  answer: string;
  open: boolean;
  onClick: () => void;
}

/**
 * Props interface for LandingPage component.
 */
interface LandingPageProps {
  onRequestAccess?: () => void;
}

// BrandLogo: muestra el logo + 'Harem' en naranja (sin 'AI') y permite navegar al inicio
function BrandLogo({ onClick }: BrandLogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 font-bold text-2xl md:text-3xl tracking-tight select-none bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none"
      style={{ background: "none" }}
      aria-label="Go to home"
      tabIndex={0}
    >
      <img src={Logo} alt="Harem logo" className="h-8 w-8 md:h-10 md:w-10" />
      <span className="text-[#FFA726]">Harem</span>
    </button>
  );
}

// CTAButton: botón grande reutilizable para todas las secciones (hero, pricing, closing)
function CTAButton({
  onClick,
  children,
  className = "",
  size = "lg",
  ...rest
}: CTAButtonProps) {
  // Determinar clases según tamaño
  const sizeClasses =
    size === "lg"
      ? "text-lg px-8 py-4"
      : size === "xl"
      ? "text-2xl py-5"
      : "text-base px-5 py-2";
  return (
    <button
      className={`w-full font-bold rounded-2xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses} ${className}
        bg-gradient-to-r from-[#FFA726] to-[#FFB74D]
        hover:from-[#FFB74D] hover:to-[#FFA726]
        hover:scale-105
        hover:shadow-[0_4px_32px_0_rgba(255,167,38,0.25)]
        active:scale-98
        transition-transform transition-shadow transition-colors
      `}
      style={{
        color: "#fff",
      }}
      onClick={onClick}
      data-testid="cta-button"
      {...rest}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// HowItWorksCard: tarjeta numerada con animación y props
function HowItWorksCard({
  number,
  emoji,
  title,
  description,
}: HowItWorksCardProps) {
  return (
    <CustomCard
      className="flex flex-col items-center min-w-[260px] max-w-xs mx-auto"
      borderColor="#FFA726"
      hoverEffect
    >
      <div className="flex flex-col items-center mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFA726] text-white text-xl font-bold mb-2 shadow">
          {number}
        </div>
        <div className="text-3xl mb-2" aria-hidden="true">
          {emoji}
        </div>
      </div>
      <h3 className="text-white text-xl font-bold mb-2 text-center">{title}</h3>
      <p className="text-white/80 text-base text-center">{description}</p>
    </CustomCard>
  );
}

// Hook para tilt y glow (inspirado en Subscribe)
function useTilt(maxTilt = 12) {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [hovered, setHovered] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * maxTilt * -1;
    const tiltY = ((x - centerX) / centerX) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return {
    ref,
    tilt,
    hovered,
    setHovered,
    handleMouseMove,
    resetTilt,
  };
}

// EdgeFeature: bloque de feature con tilt y glow
function EdgeFeature({
  emoji,
  title,
  description,
  onHover,
  onLeave,
  hovered,
}: EdgeFeatureProps) {
  const tiltProps = useTilt(12);
  // Glow violeta detrás
  return (
    <div
      ref={tiltProps.ref}
      className={`relative group cursor-pointer select-none`}
      style={{ perspective: 900 }}
      onMouseMove={(e) => {
        tiltProps.handleMouseMove(e);
        if (onHover) onHover();
        tiltProps.setHovered(true);
      }}
      onMouseLeave={() => {
        tiltProps.resetTilt();
        if (onLeave) onLeave();
        tiltProps.setHovered(false);
      }}
      onMouseEnter={() => {
        if (onHover) onHover();
        tiltProps.setHovered(true);
      }}
      tabIndex={0}
      aria-label={title}
    >
      {/* Glow violeta detrás */}
      <div
        className={`absolute inset-0 z-0 rounded-2xl pointer-events-none transition-all duration-300 ${
          tiltProps.hovered ? "opacity-80 scale-105" : "opacity-50 scale-100"
        }`}
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #6C47D6 0%, #fff0 70%)",
          filter: "blur(32px)",
        }}
      />
      {/* Tarjeta con tilt */}
      <CustomCard
        className={`flex flex-col sm:flex-row items-start gap-4 bg-transparent rounded-xl p-6 group cursor-pointer relative z-10 ${
          hovered ? "ring-2 ring-[#FFA726]" : ""
        }`}
        borderColor="#FFA726"
        glass={false}
        style={{
          transform: `rotateX(${tiltProps.tilt.x}deg) rotateY(${
            tiltProps.tilt.y
          }deg) scale(${tiltProps.hovered ? 1.04 : 1})`,
          transition: "transform 0.3s cubic-bezier(.25,.8,.25,1)",
        }}
      >
        <span className="text-3xl sm:mt-1 select-none" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <h3
            className={`text-2xl font-bold mb-1 transition-colors ${
              hovered ? "text-[#FFA726]" : "text-white"
            }`}
          >
            {title}
          </h3>
          <p className="text-white/80 text-lg leading-snug">{description}</p>
        </div>
      </CustomCard>
    </div>
  );
}

// VideoMockup: mockup de video con ícono de play
function VideoMockup() {
  return (
    <div
      className="relative w-full max-w-3xl aspect-video mx-auto rounded-3xl bg-[#23284A]/80 shadow-2xl flex items-center justify-center group cursor-pointer transition hover:shadow-[0_0_40px_0_rgba(255,167,38,0.2)]"
      style={{ minHeight: 320 }}
      onClick={() => console.log("[VideoMockup] Click en mockup de video")}
      tabIndex={0}
      aria-label="Demo video placeholder"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="40"
            cy="40"
            r="38"
            fill="#181C2A"
            fillOpacity="0.7"
            stroke="#FFA726"
            strokeWidth="4"
          />
          <polygon points="34,28 58,40 34,52" fill="#FFA726" />
        </svg>
      </div>
    </div>
  );
}

// PricingBenefit: ítem de beneficio con check dorado, más grande y alineado
function PricingBenefit({ text }: PricingBenefitProps) {
  return (
    <li className="flex items-center gap-4 text-white text-lg mb-5">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="none" />
        <path
          d="M8 15l4 4 8-8"
          stroke="#FFA726"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
    </li>
  );
}

// FaqAccordionItem: ítem de FAQ con estilos y logs
function FaqAccordionItem({
  value,
  question,
  answer,
  open,
  onClick,
}: FaqAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      className="mb-6 rounded-2xl bg-[#23284A]/80 border border-[#2d325a] overflow-hidden shadow-lg"
    >
      <AccordionTrigger
        className={`text-2xl px-8 py-6 text-left font-bold transition-colors duration-200 ${
          open ? "text-[#FFA726] underline underline-offset-4" : "text-white"
        } focus:outline-none`}
        onClick={onClick}
        data-testid={`faq-question-${value}`}
      >
        {question}
      </AccordionTrigger>
      <AccordionContent className="px-8 pb-6 text-lg text-white/80">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

// Footer: pie de página moderno y responsivo
function Footer() {
  return (
    <footer className="w-full bg-[#181C2A] py-8 px-4 flex flex-col md:flex-row items-center justify-between text-gray-400 text-lg mt-0">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block mr-1"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <text x="7" y="17" fontSize="12" fill="currentColor">
            ©
          </text>
        </svg>
        <span>2025 Harem AI. All rights reserved.</span>
      </div>
      <div className="flex gap-8 text-gray-300 text-lg">
        <a href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
        <a href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </a>
        <a
          href="mailto:team@capystudios.xyz"
          className="hover:text-white transition-colors"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}

export default function LandingPage({
  onRequestAccess,
}: LandingPageProps = {}) {
  const navigate = useNavigate();

  // Log de montaje para debugging
  React.useEffect(() => {
    console.log("[LandingPage] Hero v2 montado");
  }, []);

  // Handlers de navegación
  const handleGetStarted = () => {
    console.log("[LandingPage] Click en Get Started");
    navigate("/auth");
  };
  const handleCTA = () => {
    console.log("[LandingPage] Click en CTA /subscribe");
    navigate("/subscribe");
  };

  // Estado para hover global de la sección The Edge
  const [edgeHovered, setEdgeHovered] = React.useState(false);
  // Estado para hover individual de cada feature
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  // Features de The Edge
  const edgeFeatures = [
    {
      emoji: "🧠",
      title: "Personal Memory Bank",
      description:
        "No more mixing names or stories, Harem locks context per thread.",
    },
    {
      emoji: "🌍",
      title: "Global Tongue",
      description:
        "Switch languages mid-chat, the AI mirrors tone and culture with ease.",
    },
    {
      emoji: "✨",
      title: "Built Around You",
      description:
        "Whether you're playful or direct, into hiking or books, Harem reflects your energy.",
    },
    {
      emoji: "💳",
      title: "Weekly Wins",
      description:
        "$4 weekly, pause or cancel in one tap, only pay when you are active.",
    },
  ];

  // Handler para el CTA de pricing
  const handlePricingCTA = () => {
    console.log("[Pricing] Click en Get Access");
    navigate("/subscribe");
  };

  // Estado para FAQ abierto
  const [openFaq, setOpenFaq] = React.useState("0");
  // Preguntas y respuestas
  const faqs = [
    {
      question: "Does it work with photos or just text?",
      answer:
        "Both. You can drop screenshots or copy-paste chat text from anywhere.",
    },
    {
      question: "Can I set my flirting style or goals?",
      answer:
        "Yes. You can tell Harem how you talk or what you're aiming for, and it tailors advice around that.",
    },
    {
      question: "Does it work outside Tinder?",
      answer:
        "Harem works with any dating app or messaging platform. Tinder, Bumble, Hinge, Instagram DMs, WhatsApp—you name it.",
    },
    {
      question: "Can women use it too?",
      answer:
        "Yes! Harem is designed for anyone who wants to improve their dating communication, regardless of gender or orientation.",
    },
    {
      question: "Is it a chatbot that texts for me?",
      answer:
        "No. Harem is your personal advisor, not an autopilot. It suggests replies that match your style, but you always have the final say on what to send.",
    },
  ];

  // Handler para el CTA final
  const handleFinalCTA = () => {
    console.log("[ClosingCTA] Click en Start Winning");
    navigate("/subscribe");
  };

  // Handler para el logo: si ya está en '/', hace scroll arriba; si no, navega a '/'
  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen font-sans bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E]">
      {/* Sticky Navbar Moderno */}
      <header className="sticky top-0 z-30 w-full bg-[#181C2A]/90 backdrop-blur-md shadow-md flex justify-between items-center px-8 pt-6 pb-4">
        <BrandLogo onClick={handleLogoClick} />
        <Button
          size="sm"
          className="bg-[#FFA726] text-white font-bold px-5 py-2 rounded-md shadow hover:bg-[#ffb74d] transition"
          onClick={handleGetStarted}
          data-testid="hero-get-started"
        >
          Get Started
        </Button>
      </header>
      {/* Hero central con fondo violeta branding */}
      <section className="w-full h-[70vh] min-h-[400px] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E]">
        {/*
          Ajuste: El fondo del hero ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el resto de la landing.
        */}
        <h1
          className="text-white font-extrabold text-4xl md:text-6xl lg:text-7xl mb-6 drop-shadow-lg"
          data-testid="landing-page-headline"
        >
          Turn every DM into a date.
        </h1>
        <p className="text-white/90 text-lg md:text-2xl max-w-2xl mx-auto mb-10">
          Harem follows every convo, adjusts to your tone, and feeds you lines
          that move things forward.
        </p>
        <div className="w-full flex justify-center">
          <div className="max-w-xs w-full">
            <CTAButton onClick={handleCTA} className="mb-4" size="lg">
              Get Access
            </CTAButton>
          </div>
        </div>
        <div className="text-white/60 text-base mt-2">
          Cancel anytime, no questions.
        </div>
      </section>
      {/* How It Works moderna */}
      <section className="w-full py-24 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] border-b border-[#23284A]">
        {/*
          Ajuste: El fondo de 'How It Works' ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-16 drop-shadow-lg">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto">
          <HowItWorksCard
            number={1}
            emoji="💬"
            title="Open a Thread"
            description="Start a private file for each girl, Harem tracks the full vibe and context."
          />
          <HowItWorksCard
            number={2}
            emoji="📸"
            title="Share the Screen"
            description="Upload a screenshot or paste the convo, your AI wingman reads tone, intent, and momentum."
          />
          <HowItWorksCard
            number={3}
            emoji="📱"
            title="Fire the Perfect Text"
            description="Get ready-to-send replies tailored to your style and her energy."
          />
        </div>
      </section>

      {/* The Edge moderna */}
      <section className="w-full py-24 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] border-b border-[#23284A]">
        {/*
          Ajuste: El fondo de 'The Edge' ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <h2
          className={`text-4xl md:text-5xl font-extrabold text-center mb-16 drop-shadow-lg transition-colors ${
            edgeHovered ? "text-[#FFA726]" : "text-white"
          }`}
        >
          The Edge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {edgeFeatures.map((f, idx) => (
            <EdgeFeature
              key={f.title}
              emoji={f.emoji}
              title={f.title}
              description={f.description}
              hovered={hoveredIdx === idx}
              onHover={() => {
                setEdgeHovered(true);
                setHoveredIdx(idx);
                console.log(`[EdgeFeature] Hover en feature: ${f.title}`);
              }}
              onLeave={() => {
                setEdgeHovered(false);
                setHoveredIdx(null);
              }}
            />
          ))}
        </div>
      </section>

      {/* See It In Action */}
      <section className="w-full py-24 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] border-b border-[#23284A]">
        {/*
          Ajuste: El fondo de 'See It In Action' ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-12 drop-shadow-lg">
          See It In Action
        </h2>
        <VideoMockup />
        <div className="text-white/90 text-lg text-center mt-10 max-w-2xl mx-auto">
          30-second demo: See how Harem analyzes conversations and suggests
          perfect replies
        </div>
      </section>

      {/* Pricing Section moderna */}
      <section className="w-full py-32 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] flex flex-col items-center justify-center">
        {/*
          Ajuste: El fondo de la sección de pricing ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <div className="flex flex-col md:flex-row gap-10 max-w-5xl w-full mx-auto">
          {/* Card izquierda - ahora usando CustomCard */}
          <CustomCard className="flex-1 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-10">
              All-Access, $4 weekly
            </h2>
            <ul className="mb-2">
              <PricingBenefit text="Unlimited threads" />
              <PricingBenefit text="Unlimited advice" />
              <PricingBenefit text="Priority updates" />
              <PricingBenefit text="Cancel anytime from settings—zero lock-in" />
            </ul>
          </CustomCard>
          {/* Card derecha - ahora usando CustomCard con hover y compacto */}
          <CustomCard
            className="flex-1 flex flex-col items-center justify-center"
            hoverEffect
            compact
          >
            <CTAButton onClick={handlePricingCTA} size="xl">
              Upgrade Your Game
            </CTAButton>
            <div className="text-white/80 text-center mt-4 text-lg">
              Cancel anytime, no questions asked.
            </div>
          </CustomCard>
        </div>
      </section>

      {/* FAQ Section moderna */}
      <section className="w-full py-32 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] flex flex-col items-center justify-center">
        {/*
          Ajuste: El fondo de la sección FAQ ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-16 drop-shadow-lg">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          value={openFaq}
          onValueChange={setOpenFaq}
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.map((faq, idx) => (
            <FaqAccordionItem
              key={idx}
              value={String(idx)}
              question={faq.question}
              answer={faq.answer}
              open={openFaq === String(idx)}
              onClick={() => {
                setOpenFaq(openFaq === String(idx) ? "" : String(idx));
                console.log(`[FAQ] Click en pregunta: ${faq.question}`);
              }}
            />
          ))}
        </Accordion>
      </section>
      {/* Closing CTA Section */}
      <section className="w-full py-40 px-4 bg-gradient-to-br from-[#2B185A] via-[#3B217C] to-[#1A1A2E] flex flex-col items-center justify-center">
        {/*
          Ajuste: El fondo de la sección de cierre ahora usa el gradiente violeta principal del branding
          para máxima coherencia visual con el hero y el resto de la landing.
        */}
        <h2 className="text-4xl md:text-6xl font-extrabold text-white text-center mb-12 drop-shadow-lg">
          Make every message count.
        </h2>
        <div className="w-full flex justify-center mb-6">
          <div className="max-w-xs w-full">
            <CTAButton onClick={handleFinalCTA} size="xl">
              Start Now
            </CTAButton>
          </div>
        </div>
        <div className="text-white/80 text-center mt-2 text-lg">
          Cancel anytime, full control.
        </div>
      </section>
      <Footer />
    </main>
  );
}
