import { Link } from "react-router-dom";
import { LandingIcon } from "./LandingIcon";

export function CTASection() {
  return (
    <section id="contact" className="py-24 bg-surface-container-low">
      <div className="max-w-4xl mx-auto text-center px-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 italic" style={{}}>
          "Menos aplicaciones, más entrevistas."
        </h2>
        <p className="text-on-surface-variant text-lg mb-12" style={{}}>
          Únete a más de 5,000 desarrolladores que han automatizado la parte más tediosa de su carrera.
        </p>
        <Link className="inline-flex items-center gap-3 bg-on-surface text-surface-container-lowest font-black py-5 px-12 rounded-xl text-lg hover:bg-primary transition-all duration-300" style={{}} to="/auth/sign-up">
          Empieza ahora gratis
          <LandingIcon className="h-5 w-5" name="trending_flat" />
        </Link>
      </div>
    </section>
  );
}
