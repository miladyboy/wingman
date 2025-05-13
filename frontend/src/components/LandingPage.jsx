import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { CheckCircle2, UserPlus, Image, Sparkles, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStartChatting = () => navigate('/auth');

  return (
    <main className="min-h-screen font-sans">
      {/* Hero */}
      <section className="py-16 px-4 text-center bg-ivory text-royal">
        <h1 className="font-headline text-5xl md:text-6xl font-bold mb-6" data-testid='landing-page-headline'>
          Your Personal <span className="text-luxe">AI Wingman</span>
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">
          Chat smarter. Date better. Let Harem handle the strategy while you enjoy the conversation.
        </p>
        <Button
          size="lg"
          className="bg-royal text-ivory hover:bg-royal/90 shadow-xl mb-0"
          onClick={handleStartChatting}
        >
          Start Chatting
        </Button>
      </section>

      {/* The Edge */}
      <section className="py-12 px-4 bg-royal text-ivory border-t border-royal/10">
        <div className="max-w-3xl mx-auto grid gap-6">
          <h2 className="text-3xl font-semibold mb-6 text-center">The Edge</h2>
          <ul className="space-y-5">
            {[
              'Personalized Profiles – Each connection gets its own sleek case file, so every detail stays fresh and follow-ups stay effortless.',
              'Drop-and-Go Context – Upload a photo or chat screenshot and receive instant, situation-aware coaching.',
              'Smart Signals – Harem spots mood shifts, ghosting risk, and prime timing, keeping you one confident step ahead.',
              'Built for Winners – Crafted for men who demand results, discretion, and a genuine edge—minus the cringe.',
            ].map((adv, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-luxe mt-1" />
                <span className="text-lg">{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-ivory text-royal py-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[
              {
                icon: <UserPlus className="w-8 h-8 text-royal" />, title: "Create a Thread", desc: "Start a private case file for each connection."
              },
              {
                icon: <Image className="w-8 h-8 text-royal" />, title: "Upload a Photo or Chat", desc: "Add a social photo or your chat history—just drop it in."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-royal" />, title: "Get Personalized Strategy", desc: "Instantly receive tailored advice and next moves from your AI strategist."
              },
            ].map((step, i) => (
              <Card key={i} className="bg-white border border-royal/10 shadow-lg flex-1">
                <CardContent className="flex flex-col items-center py-8">
                  {step.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">{step.title}</h3>
                  <p className="text-base opacity-80 text-center text-royal/80">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Driven Strategy */}
      <section className="bg-royal text-ivory py-16 px-4 border-b border-royal/20">
        <div className="max-w-2xl mx-auto text-center">
          <Brain className="w-12 h-12 mx-auto text-luxe mb-4" />
          <h2 className="text-3xl font-semibold mb-4">AI-Driven Strategy</h2>
          <p className="text-lg opacity-90">
            Harem's AI isn't just smart—it's tactical.<br />
            It reads between the lines, senses shifts in mood, and calculates the perfect timing for your next move.<br />
            Whether you need to escalate, cool off, or re-engage, Harem's advice is always discreet, always on your side, and always tailored to your style.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ivory text-royal py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Level up your game. Join Harem today.</h2>
        <Button size="lg" className="bg-royal text-ivory font-bold shadow-md hover:bg-royal/90" onClick={handleStartChatting}>
          Request Access
        </Button>
      </section>
    </main>
  );
} 