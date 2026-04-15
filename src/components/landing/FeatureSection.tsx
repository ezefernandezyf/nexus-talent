import type { HTMLAttributes } from "react";
import { LandingIcon } from "./LandingIcon";

function FeatureCard({ title, copy, icon, ...props }: { title: string; copy: string; icon: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="p-8 bg-surface-container rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors" {...props}>
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
        <LandingIcon className="h-6 w-6 text-primary" name={icon as never} />
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{copy}</p>
    </div>
  );
}

export function FeatureSection() {
  return (
    <section id="features" className="py-24 px-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="md:w-1/3 md:sticky md:top-24">
          <h2 className="font-label text-sm text-primary mb-4" style={{}}>01 // SISTEMA CORE</h2>
          <h3 className="text-4xl font-bold tracking-tight mb-6" style={{}}>Arquitectura de Decisión.</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8" style={{}}>
            Nuestra IA no escribe texto genérico. Analiza el AST de tus proyectos en GitHub y lo cruza con los requerimientos técnicos de la vacante para generar argumentos técnicos irrefutables.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="tune" />
              <span className="text-sm font-medium" style={{}}>Análisis de Stack en tiempo real</span>
            </li>
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="search" />
              <span className="text-sm font-medium" style={{}}>Detección de "Keywords" fantasmas</span>
            </li>
            <li className="flex items-center gap-3" style={{}}>
              <LandingIcon className="h-4 w-4 text-primary" name="verified" />
              <span className="text-sm font-medium" style={{}}>Validación de Skills via GitHub API</span>
            </li>
          </ul>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard title="Integración con IDE" copy="Extrae información directamente de tus repositorios locales. Sin copiar y pegar código sensible." icon="terminal" />
          <FeatureCard title="Refactor de CV" copy="Transformamos tu experiencia en bullets points de alto impacto orientados a logros técnicos medibles." icon="auto_awesome" />
          <FeatureCard title="Postulación en un Click" copy="Generamos el cover letter y el perfil optimizado en el formato que los ATS de las Big Tech aman." icon="data_object" />
          <FeatureCard
            id="security"
            title="Privacidad Hardened"
            copy="Tus datos nunca entrenan modelos públicos. Procesamiento local y cifrado de grado bancario."
            icon="security"
          />
        </div>
      </div>
    </section>
  );
}
