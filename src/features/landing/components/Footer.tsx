import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm">© {new Date().getFullYear()} Nexus Talent</div>
        <div className="flex gap-4 mt-4 md:mt-0 text-sm">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  );
}
