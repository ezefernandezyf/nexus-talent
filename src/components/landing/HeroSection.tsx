import { Link } from "react-router-dom";
import { LandingIcon } from "./LandingIcon";

export function HeroSection() {
  return (
    <section id="hero" className="relative pt-24 pb-16 px-8 max-w-screen-2xl mx-auto overflow-hidden">
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute -bottom-24 -left-24 w-100 h-100 bg-secondary-container/10 rounded-full blur-[100px] -z-10"></div>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container w-fit rounded-full border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-primary glow-pulse"></span>
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant" style={{}}>
              Eficiencia Radical
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-on-surface" style={{}}>
            De Job Description a <span className="gradient-text" style={{}}>Postulación Ganadora</span> en Segundos.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed" style={{}}>
            Optimiza tu perfil para vacantes de desarrollo con inteligencia artificial de grado técnico. Diseñado por y para desarrolladores.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link className="w-full sm:w-auto flex items-center justify-center gap-3 bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" style={{}} to="/auth/sign-in">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Ingresar con GitHub
            </Link>
            <button className="w-full sm:w-auto border border-outline-variant text-primary font-bold py-4 px-8 rounded-xl hover:bg-primary/5 transition-all" style={{}} type="button">
              Ver Demo
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all"></div>
          <div className="grid h-150 grid-cols-6 grid-rows-6 gap-4 relative">
            <div className="col-span-4 row-span-3 glass-panel border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-label text-sm text-primary mb-4 flex items-center gap-2" style={{}}>
                  <LandingIcon className="h-4.5 w-4.5 text-primary" name="analytics" />
                  SKILLS_MATRIX_V4
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs" style={{}}>TYPESCRIPT / NEXT.JS</span>
                    <span className="text-primary text-xs" style={{}}>98% Match</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[98%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs" style={{}}>AWS LAMBDA / IAC</span>
                    <span className="text-on-surface-variant text-xs" style={{}}>74% Match</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-on-surface-variant w-[74%]"></div>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-auto border-t border-outline-variant/10">
                <p className="text-[10px] font-label text-on-surface-variant/60 leading-tight" style={{}}>
                  ANALYSIS_CORE_RUNNING: OPTIMIZING_KEYWORDS...
                </p>
              </div>
            </div>

            <div className="col-span-2 row-span-4 bg-surface-container border border-outline-variant/15 rounded-xl p-4 overflow-hidden">
              <h3 className="font-label text-[10px] text-on-surface-variant mb-3" style={{}}>OUTREACH_GEN</h3>
              <div className="space-y-2">
                <div className="w-full h-2 bg-surface-container-high rounded"></div>
                <div className="w-3/4 h-2 bg-surface-container-high rounded"></div>
                <div className="w-full h-2 bg-surface-container-high rounded"></div>
                <div className="w-1/2 h-2 bg-primary/20 rounded"></div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <div className="p-2 bg-surface-container-lowest rounded text-[9px] font-label border border-outline-variant/10" style={{}}>
                  <span className="text-primary" style={{}}>Recruiter:</span> "I noticed your architecture pattern matches our..."
                </div>
                <div className="p-2 bg-surface-container-lowest rounded text-[9px] font-label border border-outline-variant/10" style={{}}>
                  <span className="text-primary" style={{}}>Dev Manager:</span> "The way you handled the legacy migration..."
                </div>
              </div>
            </div>

            <div className="col-span-4 row-span-3 bg-surface-container-low border border-outline-variant/15 rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold" style={{}}>4.2s</h4>
                  <p className="font-label text-[10px] uppercase text-on-surface-variant" style={{}}>Time to Apply</p>
                </div>
                <LandingIcon className="h-6 w-6 text-primary" name="bolt" />
              </div>
              <img
                alt="Performance visualization"
                className="w-full h-24 object-cover rounded-lg opacity-40 grayscale hover:grayscale-0 transition-all"
                data-alt="Abstract data visualization of speed and connectivity, glowing neon blue lines on a dark technical background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL8ha-PY4Sig1ZKefTBgYRmDAsvOhREFFboseKeOnBtXyNfpxzAqQtcI4hiHlCmdmILytA4aVgPIl_T_tmTJtspG4vfopDcXqqVoPk-2n2b3SOreaAown8qMxTeld5YBkQh8hhK9eonj2P-OsoTzHLkOMlCCgRnqf2GnPL8evUv13XiY17vhA8ZXiOXD9JBbSZwiyBHdyvqhA17HXieeVjXDCkS_CP8DwaMA6PheJDogPVmhlDC44YjQ0GrnaJzhwXLTI464MSsqwj"
                style={{}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
