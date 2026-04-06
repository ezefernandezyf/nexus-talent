import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { formatHistoryCardDate, getHistorySummarySnippet } from "../history-formatters";
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
  it("renders the title fallback, summary snippet and up to five unique skills", () => {
    const onDelete = vi.fn();

    const { container } = render(<HistoryCard analysis={analysis} onDelete={onDelete} />);

    expect(screen.getByRole("heading", { name: "Frontend Engineer" })).toBeInTheDocument();
    expect(screen.getByText(getHistorySummarySnippet(analysis.summary))).toBeInTheDocument();
    const card = screen.getByRole("listitem", { name: "Frontend Engineer" });
    expect(within(card).getByText(/5 abr 2026/i)).toBeInTheDocument();

    const chips = container.querySelectorAll(".tech-chip");
    expect(chips).toHaveLength(5);
  });

  it("delegates delete actions to the provided callback", async () => {
    const onDelete = vi.fn();

    render(<HistoryCard analysis={analysis} onDelete={onDelete} />);

    await screen.getByRole("button", { name: /eliminar/i }).click();

    expect(onDelete).toHaveBeenCalledWith(analysis.id);
  });
});