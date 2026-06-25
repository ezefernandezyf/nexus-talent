import { useState, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/shared/utils/cn";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What does Nexus Talent actually do?",
    answer:
      "Paste any job description and get a structured analysis back: a role summary, a skills matrix showing what's core vs. nice-to-have, keyword extraction for ATS optimization, gaps you might have with advice on how to frame them, and ready-to-edit outreach messages for recruiters and hiring managers.",
  },
  {
    question: "What AI model powers the analysis?",
    answer:
      "Analysis runs through Groq's API on our server. Your job description text is sent securely, processed, and the structured result comes back. We never expose API keys to the browser.",
  },
  {
    question: "What happens to my data?",
    answer:
      "Your job descriptions and analysis results are saved to your account on a PostgreSQL database. We don't share, sell, or train on your data. Session auth uses httpOnly cookies, immune to XSS.",
  },
  {
    question: "Can I save my analyses?",
    answer:
      "Yes. Every analysis saves automatically to your history. You can revisit, rename, add notes, or delete any analysis. Your history is stored server-side, so it survives browser clears and device switches.",
  },
  {
    question: "Is Nexus Talent free?",
    answer:
      "Yes, it's free to use. No credit card required. Create an account and start analyzing job descriptions immediately.",
  },
];

interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQAccordionItem({ item, isOpen, onToggle, index }: FAQItemProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  const accordionId = `faq-panel-${index}`;
  const accordionHeaderId = `faq-header-${index}`;

  return (
    <div className="border-b border-outline-variant/10">
      <h3>
        <button
          aria-controls={accordionId}
          aria-expanded={isOpen}
          className={cn(
            "flex w-full items-center justify-between gap-4 px-2 py-5 text-left text-sm font-semibold leading-relaxed text-on-surface transition-colors",
            "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
          id={accordionHeaderId}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <span>{item.question}</span>
          <span
            aria-hidden="true"
            className={cn(
              "flex-shrink-0 text-lg text-on-surface-variant transition-transform duration-200",
              isOpen ? "rotate-45" : "",
            )}
          >
            +
          </span>
        </button>
      </h3>
      <div
        aria-labelledby={accordionHeaderId}
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={accordionId}
        role="region"
      >
        <div className="overflow-hidden">
          <p className="px-2 pb-5 text-sm leading-relaxed text-on-surface-variant">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export interface FAQProps {
  className?: string;
}

export function FAQ({ className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <section aria-labelledby="faq-heading" className={cn("w-full", className)} id="faq">
      <h2 id="faq-heading" className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
        Frequently Asked Questions
      </h2>
      <div className="mt-8 space-y-0">
        {faqItems.map((item, index) => (
          <FAQAccordionItem
            key={index}
            index={index}
            isOpen={openIndex === index}
            item={item}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}
