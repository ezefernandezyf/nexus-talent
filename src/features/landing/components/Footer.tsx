import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-8 text-on-surface-variant">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-on-surface">© {new Date().getFullYear()} Nexus Talent</div>
        <div className="flex gap-4 mt-4 md:mt-0 text-sm">
          <Link className="hover:underline" to="/privacy">
            Privacy
          </Link>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  );
}
