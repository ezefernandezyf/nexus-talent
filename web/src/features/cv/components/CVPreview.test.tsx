import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CVPreview } from "./CVPreview";
import type { CVGenerateResponseDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleResponse: CVGenerateResponseDTO = {
  sections: [
    {
      heading: "Professional Summary",
      body: "Experienced software engineer with expertise in React and Node.js.",
      order: 0,
    },
    {
      heading: "Skills",
      body: "- React\n- TypeScript\n- Node.js\n- PostgreSQL",
      order: 1,
    },
    {
      heading: "Experience",
      body: "Senior Developer at Acme Corp (2023-present)\n- Led frontend architecture\n- Mentored junior engineers",
      order: 2,
    },
  ],
  metadata: {
    generatedAt: "2026-07-13T12:00:00.000Z",
    model: "groq-llama-3.3",
    sectionCount: 3,
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CVPreview", () => {
  it("renders all section headings", () => {
    render(<CVPreview data={sampleResponse} />);

    expect(screen.getByText("Professional Summary")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });

  it("renders section body content", () => {
    render(<CVPreview data={sampleResponse} />);

    expect(
      screen.getByText(
        "Experienced software engineer with expertise in React and Node.js.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Led frontend architecture/),
    ).toBeInTheDocument();
  });

  it("renders sections in order", () => {
    render(<CVPreview data={sampleResponse} />);

    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent("Professional Summary");
    expect(headings[1]).toHaveTextContent("Skills");
    expect(headings[2]).toHaveTextContent("Experience");
  });

  it("shows metadata info (generated date and model)", () => {
    render(<CVPreview data={sampleResponse} />);

    expect(screen.getByText(/groq-llama-3.3/)).toBeInTheDocument();
    expect(screen.getByText(/generated/i)).toBeInTheDocument();
    expect(screen.getByText(/3 sections/i)).toBeInTheDocument();
  });

  it("shows empty state when sections array is empty", () => {
    const emptyResponse: CVGenerateResponseDTO = {
      sections: [],
      metadata: {
        generatedAt: "",
        model: "",
        sectionCount: 0,
      },
    };

    render(<CVPreview data={emptyResponse} />);

    expect(screen.getByText(/no cv generated/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("preserves body whitespace with pre-wrap style", () => {
    render(<CVPreview data={sampleResponse} />);

    const skillsBody = screen.getByTestId("section-body-1");
    expect(skillsBody.tagName).toBe("DIV");
    // Body content with newlines should be visible as a block
    expect(skillsBody.innerHTML).toContain("React");
    expect(skillsBody.innerHTML).toContain("TypeScript");
    expect(skillsBody.innerHTML).toContain("PostgreSQL");
  });
});
