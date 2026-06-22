import { useState, useCallback, type KeyboardEvent } from "react";
import { cn } from "../../../lib/cn";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How does AI job analysis work?",
    answer:
      "Nexus Talent uses a specialized AI model trained on recruitment patterns and technical skill taxonomies. You paste a job description, and our system extracts structured signals: required skills, experience levels, role seniority, key responsibilities, and cultural indicators. The analysis runs server-side — your JD text is sent securely, processed by the AI, and returned as a structured breakdown you can act on immediately.",
  },
  {
    question: "What formats are supported?",
    answer:
      "Paste plain text, structured HTML from any job board (LinkedIn, Indeed, Glassdoor), or upload a PDF. Our parser normalizes the input before analysis, so you get consistent results regardless of source format. Markdown-formatted descriptions also work. There is no file size limit for text-based descriptions.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Job descriptions are sent over HTTPS to our server-side proxy, processed by the AI, and never stored in plain text. Analysis results are saved in your private account under encrypted PostgreSQL storage. We do not share, sell, or train on your data. Your session is authenticated via httpOnly cookies — immune to XSS attacks.",
  },
  {
    question: "How does outreach generation work?",
    answer:
      "Based on the extracted skills and requirements, the AI generates personalized outreach messages tailored to different audiences: a version for recruiters highlighting relevant experience, and another for hiring managers emphasizing technical depth and architecture fit. Each message cites specific signals from the JD so it reads as a genuine, researched approach — not a template.",
  },
  {
    question: "Can I save and review past analyses?",
    answer:
      "Absolutely. Every analysis is saved to your history with the original JD, the structured breakdown, and the generated outreach copy. You can revisit, rename, add notes, or delete any analysis at any time. The history is paginated and searchable, making it easy to track applications over time.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Yes. Start with a free account and get a limited number of analyses per month — enough to evaluate the platform and run your first few job applications. Paid plans unlock unlimited analyses, advanced export options, and priority AI processing. No credit card is required to start.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "The AI achieves high accuracy on technical skill extraction, role seniority classification, and experience duration parsing. Accuracy varies for non-technical roles, creative positions, and descriptions with ambiguous requirements. We surface a confidence score per signal so you can prioritize which extracted data to trust. Our analysis engine improves over time as we refine the prompt architecture.",
  },
  {
    question: "Can I use Nexus Talent for team hiring?",
    answer:
      "Yes. Nexus Talent supports team workflows where multiple members can review and annotate analyses. Contact us for team pricing and collaboration features, including shared workspaces, role-based access, and consolidated reporting.",
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
