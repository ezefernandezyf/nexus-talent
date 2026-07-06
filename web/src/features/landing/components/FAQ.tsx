import { useState, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/shared/utils/cn";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "¿Qué hace exactamente Nexus Talent?",
    answer:
      "Pega cualquier descripción de trabajo y recibe un análisis estructurado: un resumen del rol, una matriz de habilidades que muestra lo esencial vs. lo deseable, extracción de palabras clave para optimización ATS, brechas que puedas tener con consejos sobre cómo abordarlas, y mensajes de contacto listos para editar para reclutadores y hiring managers.",
  },
  {
    question: "¿Qué modelo de IA impulsa el análisis?",
    answer:
      "El análisis se ejecuta a través de la API de Groq en nuestro servidor. El texto de tu descripción de trabajo se envía de forma segura, se procesa y el resultado estructurado regresa. Nunca exponemos claves de API al navegador.",
  },
  {
    question: "¿Qué sucede con mis datos?",
    answer:
      "Tus descripciones de trabajo y resultados de análisis se guardan en tu cuenta en una base de datos PostgreSQL. No compartimos, vendemos ni entrenamos con tus datos. La autenticación de sesión usa cookies httpOnly, inmunes a XSS.",
  },
  {
    question: "¿Puedo guardar mis análisis?",
    answer:
      "Sí. Cada análisis se guarda automáticamente en tu historial. Puedes revisitar, renombrar, agregar notas o eliminar cualquier análisis. Tu historial se almacena en el servidor, por lo que sobrevive a limpiezas del navegador y cambios de dispositivo.",
  },
  {
    question: "¿Nexus Talent es gratuito?",
    answer:
      "Sí, es gratuito. No requiere tarjeta de crédito. Crea una cuenta y empieza a analizar descripciones de trabajo de inmediato.",
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
        Preguntas Frecuentes
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
