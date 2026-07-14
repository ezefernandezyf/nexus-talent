import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JobDescriptionForm } from "./JobDescriptionForm";
import { createAnalysisRequest } from "@/test/factories/analysis";

describe("JobDescriptionForm", () => {
  it("blocks empty submissions inline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/información insuficiente/i)).toBeInTheDocument();
  });

  it("blocks short submissions under 30 characters inline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/descripción del puesto/i), "Front-end");
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/información insuficiente/i)).toBeInTheDocument();
  });

  it("disables while pending and shows the external error message", () => {
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={true} onSubmit={onSubmit} errorMessage="No se pudo completar el análisis." />);

    expect(screen.getByRole("button", { name: /analizando/i })).toBeDisabled();
    expect(screen.getByText(/no se pudo completar el análisis/i)).toBeInTheDocument();
  });

  it("submits trimmed content", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/descripción del puesto/i), "  Senior React engineer with TypeScript and testing  ");
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      createAnalysisRequest({
        jobDescription: "Senior React engineer with TypeScript and testing",
      }),
    );
  });

  it("exposes the tone selector without blocking submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    document.documentElement.dataset.theme = "light";
    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/tono del mensaje/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/descripción del puesto/i), "Senior React engineer with TypeScript and testing");
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      createAnalysisRequest({
        jobDescription: "Senior React engineer with TypeScript and testing",
      }),
    );

    document.documentElement.dataset.theme = "dark";
  });

  it("hydrates a saved vacancy prefill once and keeps user edits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <JobDescriptionForm
        initialJobDescription="Frontend Lead para producto"
        initialPrefillKey="history-123"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Frontend Lead para producto");

    await user.clear(screen.getByLabelText(/descripción del puesto/i));
    await user.type(screen.getByLabelText(/descripción del puesto/i), "Reworked vacancy");

    rerender(
      <JobDescriptionForm
        initialJobDescription="Should not override edited draft"
        initialPrefillKey="history-123"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Reworked vacancy");
  });

  it("ignores an empty saved vacancy prefill", () => {
    const onSubmit = vi.fn();

    render(
      <JobDescriptionForm
        initialJobDescription={undefined}
        initialPrefillKey="history-123"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("");
  });

  it("hydrates a partial saved vacancy prefill", () => {
    const onSubmit = vi.fn();

    render(
      <JobDescriptionForm
        initialJobDescription="Frontend Lead para producto"
        initialPrefillKey="history-456"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Frontend Lead para producto");
  });
});
