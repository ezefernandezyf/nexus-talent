import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingIcon } from "./LandingIcon";
import { fadeUpVariants, scaleInVariants } from "../../../components/ui/motion";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const heroContainer = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.06,
          },
        },
      };

  return (
    <motion.section
      animate={prefersReducedMotion ? undefined : "visible"}
      className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pt-24"
      id="hero"
      initial={prefersReducedMotion ? false : "hidden"}
      variants={heroContainer}
    >
      <motion.div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" aria-hidden="true" />
      <motion.div className="absolute -bottom-24 -left-24 w-100 h-100 bg-secondary-container/10 rounded-full blur-[100px] -z-10" aria-hidden="true" />
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col space-y-8">
          <motion.div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container w-fit rounded-full border border-outline-variant/15" variants={fadeUpVariants}>
            <span className="w-2 h-2 rounded-full bg-primary glow-pulse"></span>
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant" style={{}}>
              Eficiencia Radical
            </span>
          </motion.div>
          <motion.h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-6xl lg:text-7xl" style={{}} variants={fadeUpVariants}>
            De Job Description a <span className="gradient-text" style={{}}>Postulación Ganadora</span> en Segundos.
          </motion.h1>
          <motion.p className="max-w-xl text-base leading-relaxed text-on-surface-variant sm:text-lg lg:text-xl" style={{}} variants={fadeUpVariants}>
            Convierte una vacante en señales técnicas, un resumen usable y un mensaje de outreach listo para editar. Sin promesas infladas.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row items-center gap-4 pt-4" variants={fadeUpVariants}>
            <Link className="w-full sm:w-auto flex items-center justify-center gap-3 bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" style={{}} to="/auth/sign-in">
              <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 9.5c3.6 0 6.1 1.6 7.5 2.9l5.5-5.5C33.1 4 28.5 2 23 2 14.9 2 7.8 6.7 4.1 13.6l6.6 5.1C12.9 13.2 17.5 9.5 23 9.5z" fill="#EA4335" />
                <path d="M38.9 18.1c.3 1.5.5 3.1.5 4.4 0 1.2-.2 2.1-.6 3.1-.6 1.6-1.6 3-2.8 4.2-1.3 1.2-2.9 2.1-4.7 2.7-1.7.6-3.6.9-5.5.9-3.6 0-6.1-1.6-7.5-2.9l-5.5 5.5C12.9 42 17.5 46 23 46c8.1 0 15.2-4.7 18.9-11.6 0 0-6.6-5.1-6.6-5.1 0 0 1.8-5.2 3.6-6.4.9-.6 1.9-1.2 2.1-2.8.1-.9.1-1.7.1-2.7 0-1.3-.2-2.6-.6-3.8L38.9 18.1z" fill="#4285F4" />
                <path d="M9.5 30.9c-.6-1.6-.9-3.3-.9-5 0-1.7.3-3.4.9-5l-6.6-5.1C1.1 18.4 0 20.6 0 23c0 2.4 1.1 4.6 2.9 6.2l6.6 1.7z" fill="#FBBC05" />
                <path d="M23 37c4.5 0 8.1-1.6 10.7-3.9 1.1-.9 2.1-2 2.8-3.2.5-.9.9-1.9 1.1-2.9.1-.9.1-1.7.1-2.6 0-1.3-.2-2.6-.6-3.8L23 37z" fill="#34A853" />
              </svg>
              Ingresar con Google
            </Link>
            <Link className="w-full sm:w-auto border border-outline-variant text-primary font-bold py-4 px-8 rounded-xl hover:bg-primary/5 transition-all text-center" style={{}} to="/auth/sign-up">
              Crear cuenta
            </Link>
          </motion.div>
        </div>

        <motion.div className="group relative" variants={fadeUpVariants}>
          <motion.div className="absolute inset-0 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all" aria-hidden="true" />
          <div className="relative grid gap-4 sm:grid-cols-6 sm:grid-rows-6 lg:h-150">
            <motion.div className="glass-panel flex flex-col justify-between rounded-xl border border-outline-variant/20 p-5 sm:col-span-4 sm:row-span-3 sm:p-6" variants={scaleInVariants} whileHover={prefersReducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
              <div>
                <motion.h3 className="font-label text-sm text-primary mb-4 flex items-center gap-2" style={{}} variants={fadeUpVariants}>
                  <LandingIcon className="h-4.5 w-4.5 text-primary" name="analytics" />
                  SKILLS_MATRIX_V4
                </motion.h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs" style={{}}>TYPESCRIPT / NEXT.JS</span>
                    <span className="text-primary text-xs" style={{}}>Señal alta</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[98%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs" style={{}}>AWS LAMBDA / IAC</span>
                    <span className="text-on-surface-variant text-xs" style={{}}>Señal media</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-on-surface-variant w-[74%]"></div>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-auto border-t border-outline-variant/10">
                <p className="text-[10px] font-label text-on-surface-variant/60 leading-tight" style={{}}>
                  ANALYSIS_CORE_RUNNING: EXTRACTING_SIGNALS...
                </p>
              </div>
            </motion.div>

            <motion.div className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container p-4 sm:col-span-2 sm:row-span-4" variants={scaleInVariants} whileHover={prefersReducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
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
            </motion.div>

            <motion.div className="flex flex-col rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 sm:col-span-4 sm:row-span-3 sm:p-6" variants={scaleInVariants} whileHover={prefersReducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
