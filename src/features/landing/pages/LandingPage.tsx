import React from "react";
import Hero from "../components/Hero";
import FeatureList from "../components/FeatureList";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <Hero />
      <FeatureList />
      <Footer />
    </div>
  );
}
