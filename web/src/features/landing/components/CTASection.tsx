import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingIcon } from "./LandingIcon";
import { fadeUpVariants } from "../../../components/ui/motion";

export function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="contact"
      className="py-24 bg-surface-container-low"
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
    >
      <div className="max-w-4xl mx-auto text-center px-8">
        <motion.h2 className="text-4xl md:text-5xl font-bold mb-6 italic" style={{}} variants={fadeUpVariants}>
          "Menos aplicaciones, más entrevistas."
        </motion.h2>
        <motion.p className="text-on-surface-variant text-lg mb-12" style={{}} variants={fadeUpVariants}>
          Únete a los desarrolladores que automatizan la parte más tediosa de su carrera.
        </motion.p>
        <Link className="inline-flex items-center gap-3 bg-on-surface text-surface-container-lowest font-black py-5 px-12 rounded-xl text-lg hover:bg-primary transition-all duration-300" style={{}} to="/auth/sign-up">
          Empieza ahora gratis
          <LandingIcon className="h-5 w-5" name="trending_flat" />
        </Link>
      </div>
    </motion.section>
  );
}
