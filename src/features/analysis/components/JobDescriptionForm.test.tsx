import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JobDescriptionForm } from "./JobDescriptionForm";

describe("JobDescriptionForm", () => {
  it("blocks empty submissions inline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /analizar vacante/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/pegá una descripción del puesto antes de ejecutar el análisis/i)).toBeInTheDocument();
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
    await user.type(screen.getByLabelText(/descripción del puesto/i), "  Ingeniero React senior con TypeScript  ");
    await user.click(screen.getByRole("button", { name: /analizar vacante/i }));

    expect(onSubmit).toHaveBeenCalledWith("Ingeniero React senior con TypeScript");
  });
});