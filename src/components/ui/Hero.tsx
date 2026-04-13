import React from "react";

interface Cta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface HeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  ctas?: Cta[];
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle, description, ctas = [] }) => {
  return (
    <section className="relative pt-12 pb-12 px-6 max-w-screen-2xl mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col space-y-6">
          {subtitle ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container w-fit rounded-full border border-outline-variant/15">
              <span className="w-2 h-2 rounded-full bg-primary glow-pulse" />
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{subtitle}</span>
            </div>
          ) : null}

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-on-surface">{title}</h1>

          {description ? <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">{description}</p> : null}

          {ctas.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {ctas.map((cta, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={cta.onClick}
                  onKeyDown={() => {}}
                  className={idx === 0 ? "w-full sm:w-auto flex items-center justify-center gap-3 bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" : "w-full sm:w-auto border border-outline-variant text-primary font-bold py-3 px-6 rounded-xl hover:bg-primary/5 transition-all"}
                >
                  {cta.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <div className="grid h-48 grid-cols-6 grid-rows-6 gap-4 relative">
            <div className="col-span-6 row-span-6 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-center">
              <div className="text-on-surface-variant">Preview panel</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
