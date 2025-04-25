import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { CheckCircle2, UserPlus, Image, Sparkles, Brain } from "lucide-react";

export default function LandingPage({ onRequestAccess }) {
  return (
    <main className="bg-black min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black via-[#0a0a23] to-[#1a1a2e] text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Master the Game. Stay in Control.
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-xl mx-auto opacity-80">
          Unlock elite dating strategy with private, AI-powered guidance.<br />
          Discreet. Tactical. Unmatched.
        </p>
        <Button size="lg" className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white shadow-lg hover:from-indigo-800 hover:to-blue-900" onClick={onRequestAccess}>
          Request Access
        </Button>
      </section>

      {/* The Harem Advantage */}
      <section className="bg-[#10101a] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-center">The Harem Advantage</h2>
          <ul className="space-y-5">
            {[
              'Private "case files" for every connection—never lose track, never get sloppy.',
              'Upload photos or chat history for instant, context-aware advice.',
              'AI detects mood shifts, ghosting risks, and optimal timing—so you always move first.',
              'Tag, note, and timeline every interaction for total situational awareness.',
              'Designed for men who demand results, privacy, and an edge.',
            ].map((adv, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-400 mt-1" />
                <span className="text-lg">{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#181828] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[
              {
                icon: <UserPlus className="w-8 h-8 text-indigo-400" />, title: "Create a Thread", desc: "Start a private case file for each connection."
              },
              {
                icon: <Image className="w-8 h-8 text-indigo-400" />, title: "Upload a Photo or Chat", desc: "Add a social photo or your chat history—just drop it in."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-indigo-400" />, title: "Get Personalized Strategy", desc: "Instantly receive tailored advice and next moves from your AI strategist."
              },
            ].map((step, i) => (
              <Card key={i} className="bg-[#23233a] border-none shadow-lg flex-1">
                <CardContent className="flex flex-col items-center py-8">
                  {step.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">{step.title}</h3>
                  <p className="text-base opacity-80 text-center">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Driven Strategy */}
      <section className="bg-gradient-to-b from-[#181828] to-[#10101a] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Brain className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-3xl font-semibold mb-4">AI-Driven Strategy</h2>
          <p className="text-lg opacity-90">
            Harem's AI isn't just smart—it's tactical.<br />
            It reads between the lines, senses shifts in mood, and calculates the perfect timing for your next move.<br />
            Whether you need to escalate, cool off, or re-engage, Harem's advice is always discreet, always on your side, and always tailored to your style.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#10101a] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">What Users Say</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {[
              {
                quote: "I never realized how much I was missing until Harem. It's like having a secret playbook—my results speak for themselves.",
                name: "Alex, 29",
              },
              {
                quote: "The AI's advice is scarily accurate. I feel in control, never second-guessing. Total game-changer.",
                name: "Marcus, 32",
              },
              {
                quote: "I value my privacy, and Harem gets that. The discretion and insight are next-level.",
                name: "Daniel, 27",
              },
            ].map((t, i) => (
              <Card key={i} className="bg-[#181828] border-none shadow-lg flex-1">
                <CardContent className="py-8 px-6 flex flex-col items-center">
                  <p className="text-lg italic mb-4">"{t.quote}"</p>
                  <span className="text-indigo-300 font-semibold">{t.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#181828] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">FAQ</h2>
          <Accordion type="single" collapsible>
            {[
              {
                q: "Is my data private?",
                a: "Absolutely. Your threads are encrypted and only you can access them. Local encrypted storage is coming soon.",
              },
              {
                q: "How does the AI know what to say?",
                a: "Harem's AI analyzes your chat history and context to suggest moves that fit your style and situation—never generic, always personal.",
              },
              {
                q: "Will it sound like me?",
                a: "Yes. The AI adapts to your tone and preferences, so your advice always feels authentic.",
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-lg">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-base opacity-80">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#0a0a23] to-[#181828] text-white py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Level up your game. Join Harem today.</h2>
        <Button size="lg" className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white shadow-lg hover:from-indigo-800 hover:to-blue-900" onClick={onRequestAccess}>
          Request Access
        </Button>
      </section>
    </main>
  );
} 