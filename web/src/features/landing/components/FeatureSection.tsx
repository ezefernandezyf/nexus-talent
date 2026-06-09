import { motion, useReducedMotion } from "framer-motion";
import { LandingIcon } from "./LandingIcon";
import { fadeUpVariants, scaleInVariants } from "../../../components/ui/motion";

interface FeatureCardProps {
  className?: string;
  copy: string;
  icon: string;
  id?: string;
  title: string;
}

function FeatureCard({ className, copy, icon, id, title }: FeatureCardProps) {
  return (
    <motion.div
      className={className ?? "p-8 bg-surface-container rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors"}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      variants={scaleInVariants}
      id={id}
    >
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
        <LandingIcon className="h-6 w-6 text-primary" name={icon as never} />
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{copy}</p>
    </motion.div>
  );
}

export function FeatureSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="features"
      className="py-24 px-8 max-w-screen-2xl mx-auto"
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.04,
          },
        },
      }}
    >
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <motion.div className="md:w-1/3 md:sticky md:top-24" variants={fadeUpVariants}>
          <h2 className="font-label text-sm text-primary mb-4" style={{}}>01 // SISTEMA CORE</h2>
          <h3 className="text-4xl font-bold tracking-tight mb-6" style={{}}>Arquitectura de Decisión.</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8" style={{}}>
            Nuestra IA cruza la descripción de la vacante con señales técnicas del perfil para generar argumentos concretos, sin humo y sin texto genérico.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="tune" />
              <span className="text-sm font-medium" style={{}}>Análisis de señales técnicas</span>
            </li>
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="search" />
              <span className="text-sm font-medium" style={{}}>Detección de keywords relevantes</span>
            </li>
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="verified" />
              <span className="text-sm font-medium" style={{}}>Validación de skills con datos guardados</span>
            </li>
          </ul>
        </motion.div>
        <motion.div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6" variants={{ hidden: {}, visible: {} }}>
          <FeatureCard title="Flujo para el editor" copy="Pensado para que trabajes rápido desde tu contexto habitual, sin pasos innecesarios." icon="terminal" />
          <FeatureCard title="Refactor de CV (próximamente)" copy="Estamos preparando una capa para convertir tu experiencia en bullets más fuertes y claros." icon="auto_awesome" />
          <FeatureCard title="Postulación asistida" copy="Generamos el cover letter y el perfil optimizado para que los adaptes antes de enviar." icon="data_object" />
          <FeatureCard
            id="security"
            title="Privacidad responsable"
            copy="No agregamos tracking extra y mantenemos el historial en tu entorno local. Lo mínimo necesario para trabajar bien."
            icon="security"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
