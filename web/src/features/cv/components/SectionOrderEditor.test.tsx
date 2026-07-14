import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionOrderEditor } from "./SectionOrderEditor";
import type { SectionOption } from "./SectionOrderEditor";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleOptions: SectionOption[] = [
  { id: "professional-summary", label: "Resumen Profesional" },
  { id: "experience", label: "Experiencia Laboral" },
  { id: "education", label: "Educacion" },
  { id: "skills", label: "Habilidades" },
  { id: "projects", label: "Proyectos" },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SectionOrderEditor", () => {
  it("renders all section items", () => {
    const onChange = vi.fn();
    render(
      <SectionOrderEditor
        options={sampleOptions}
        value={sampleOptions.map((o) => o.id)}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Resumen Profesional")).toBeInTheDocument();
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    expect(screen.getByText("Educacion")).toBeInTheDocument();
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
  });

  it("renders items in the order specified by value", () => {
    const onChange = vi.fn();
    const reordered = ["skills", "projects", "professional-summary", "experience", "education"];

    render(
      <SectionOrderEditor
        options={sampleOptions}
        value={reordered}
        onChange={onChange}
      />,
    );

    const items = screen.getAllByTestId("section-order-item");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Habilidades");
    expect(items[1]).toHaveTextContent("Proyectos");
    expect(items[2]).toHaveTextContent("Resumen Profesional");
    expect(items[3]).toHaveTextContent("Experiencia Laboral");
    expect(items[4]).toHaveTextContent("Educacion");
  });

  it("shows drag handle for each item", () => {
    const onChange = vi.fn();
    render(
      <SectionOrderEditor
        options={sampleOptions}
        value={sampleOptions.map((o) => o.id)}
        onChange={onChange}
      />,
    );

    const dragHandles = screen.getAllByTestId("drag-handle");
    expect(dragHandles).toHaveLength(5);
  });

  it("displays count badge for each item", () => {
    const onChange = vi.fn();
    render(
      <SectionOrderEditor
        options={sampleOptions}
        value={sampleOptions.map((o) => o.id)}
        onChange={onChange}
      />,
    );

    // Each item should show its position number
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
