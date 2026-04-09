import React from "react";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export default function Hero({
  title = "Nexus Talent",
  subtitle = "AI-assisted job analysis for developers",
  ctaText = "Get started"
}: HeroProps) {
  return (
    <section className="bg-slate-900 text-white py-20">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 text-slate-300 text-base md:text-lg">{subtitle}</p>
            <div className="mt-6">
              <a href="/signup" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md">{ctaText}</a>
              <a href="/login" className="ml-4 text-sm text-slate-300 hover:underline">Login</a>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full h-56 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">Image / Illustration</div>
          </div>
        </div>
      </div>
    </section>
  );
}
