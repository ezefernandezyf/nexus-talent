import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

const highlights = [
  {
    title: "Análisis inmediato",
    copy: "Pegá una descripción y obtené un resumen estructurado, señales técnicas y mensaje sugerido.",
  },
  {
    title: "Modo público",
    copy: "La app completa funciona sin login; la diferencia aparece sólo en qué se persiste y dónde.",
  },
  {
    title: "Deep Space UI",
    copy: "Glass panels, ghost frames y jerarquía editorial alineada con las referencias visuales.",
  },
] as const;

export function LandingPage() {
  return (
    <main className="deep-space-shell relative min-h-screen overflow-hidden bg-surface-container-lowest text-on-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(125, 211, 252, 0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(96, 165, 250, 0.12), transparent 24%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 88px 88px, 88px 88px",
          maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.15) 75%, transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-10 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <span className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">Nexus Talent</span>
          <div className="flex items-center gap-3">
            <Link className="secondary-button" to="/auth/sign-in">
              Iniciar sesión
            </Link>
            <Link className="primary-button" to="/app/analysis">
              Entrar a la app
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-6">
            <span className="label-chip w-fit">Recruiting precision layer</span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Convertí una job description en una estrategia de candidatura clara.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
                Nexus Talent extrae el resumen, la matriz de skills y el mensaje para recruiters con una experiencia pública o privada que se ve igual.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="primary-button" to="/app/analysis">
                Probar análisis
              </Link>
              <Link className="tech-chip text-primary" to="/auth/sign-up">
                Crear cuenta
              </Link>
            </div>
          </div>

          <Card className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="space-y-2">
              <span className="label-chip">Home pública</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Un acceso visualmente serio, sin fricción.</h2>
              <p className="text-base leading-7 text-on-surface-variant">
                La landing presenta el producto y abre el shell principal sin bloquear a quienes todavía no iniciaron sesión.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="ghost-frame rounded-2xl bg-surface-container-lowest/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.copy}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
