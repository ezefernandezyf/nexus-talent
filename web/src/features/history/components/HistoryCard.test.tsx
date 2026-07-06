import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SavedJobAnalysis } from "@/features/analysis/schemas/job-analysis";
import { HistoryCard } from "./HistoryCard";

const analysis: SavedJobAnalysis = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  createdAt: "2026-04-05T12:05:00.000Z",
  jobDescription: "Frontend Engineer\nReact, testing and TypeScript",
  summary:
    "Lead the product frontend strategy with strong React, TypeScript, testing and accessibility practices while collaborating with design and backend teams.",
  skillGroups: [
    {
      category: "Core stack",
      skills: [
        { name: "React", level: "core" },
        { name: "TypeScript", level: "core" },
        { name: "Accessibility", level: "strong" },
      ],
    },
    {
      category: "Quality",
      skills: [
        { name: "Testing", level: "strong" },
        { name: "Performance", level: "strong" },
        { name: "React", level: "adjacent" },
        { name: "Architecture", level: "adjacent" },
      ],
    },
  ],
  outreachMessage: {
    subject: "Interés en el puesto",
    body: "Hola equipo,",
  },
};

describe("HistoryCard", () => {
  it("renders the title and date", () => {
    render(
      <MemoryRouter>
        <HistoryCard analysis={analysis} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/frontend engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/5 abr 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir detalle de frontend engineer/i })).toHaveAttribute(
      "href",
      `/app/history/${analysis.id}`,
    );
  });

  it("prefers the persisted display name when available", () => {
    render(
      <MemoryRouter>
        <HistoryCard
          analysis={{
            ...analysis,
            displayName: "Frontend Lead",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Frontend Lead")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir detalle de frontend lead/i })).toHaveAttribute(
      "href",
      `/app/history/${analysis.id}`,
    );
  });
});
