type LandingIconName =
  | "analytics"
  | "auto_awesome"
  | "bolt"
  | "data_object"
  | "search"
  | "security"
  | "terminal"
  | "tune"
  | "trending_flat"
  | "verified";

export interface LandingIconProps {
  name: LandingIconName;
  className?: string;
}

export function LandingIcon({ className, name }: LandingIconProps) {
  const baseClassName = className ?? "";

  switch (name) {
    case "analytics":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M5 19V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "auto_awesome":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3Z" fill="currentColor" />
          <path d="M18 14l.7 2L21 17l-2.3.8L18 20l-.7-2.2L15 17l2.3-.8L18 14Z" fill="currentColor" opacity="0.75" />
        </svg>
      );
    case "bolt":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M13 2L5 13h5l-1 9 10-13h-5l-1-7Z" fill="currentColor" />
        </svg>
      );
    case "data_object":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M7 8l-3 4 3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 8l3 4-3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 16l4-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "search":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M14 14l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "security":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 3v5c0 4.8-3 7.9-7 10-4-2.1-7-5.2-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.5 12l1.8 1.8L15 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "terminal":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 10l3 2-3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "tune":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M5 7h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="7" r="1.5" fill="currentColor" />
          <circle cx="14" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
        </svg>
      );
    case "trending_flat":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M5 12h11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M14 8l4 4-4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "verified":
      return (
        <svg aria-hidden="true" className={baseClassName} viewBox="0 0 24 24" fill="none">
          <path d="M12 3l2.2 1.4 2.6.2 1.2 2.3 2.2 1.4-.5 2.5.5 2.5-2.2 1.4-1.2 2.3-2.6.2L12 21l-2.2-1.4-2.6-.2-1.2-2.3-2.2-1.4.5-2.5-.5-2.5 2.2-1.4 1.2-2.3 2.6-.2L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9.2 12.2l1.8 1.8 3.9-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
