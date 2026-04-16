import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JobDescriptionForm } from "./JobDescriptionForm";
import { createAnalysisRequest } from "../../../test/factories/analysis";

describe("JobDescriptionForm", () => {
  it("blocks empty submissions inline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

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
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      createAnalysisRequest({
        jobDescription: "Ingeniero React senior con TypeScript",
      }),
    );
  });

  it("submits an optional GitHub repository URL", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/descripción del puesto/i), "Ingeniero React senior con TypeScript");
    await user.type(screen.getByLabelText(/url de github/i), "  https://github.com/acme/design-system.git  ");
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      createAnalysisRequest({
        jobDescription: "Ingeniero React senior con TypeScript",
        githubRepositoryUrl: "https://github.com/acme/design-system.git",
      }),
    );
  });

  it("exposes the tone selector without blocking submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    document.documentElement.dataset.theme = "light";
    render(<JobDescriptionForm isPending={false} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/tono del mensaje/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tono del mensaje/i).closest(".field-surface")).toBeInTheDocument();
    expect(screen.getByLabelText(/url de github/i).closest(".field-surface")).toBeInTheDocument();
    expect(screen.getByText(/ctrl\+v/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/descripción del puesto/i), "Ingeniero React senior con TypeScript");
    await user.click(screen.getByRole("button", { name: /analizar con ia/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      createAnalysisRequest({
        jobDescription: "Ingeniero React senior con TypeScript",
      }),
    );

    document.documentElement.dataset.theme = "dark";
  });

  it("hydrates a saved vacancy prefill once and keeps user edits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <JobDescriptionForm
        initialGithubRepositoryUrl="https://github.com/acme/design-system"
        initialJobDescription="Frontend Lead para producto"
        initialPrefillKey="history-123"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Frontend Lead para producto");
    expect(screen.getByLabelText(/url de github/i)).toHaveValue("https://github.com/acme/design-system");

    await user.clear(screen.getByLabelText(/descripción del puesto/i));
    await user.type(screen.getByLabelText(/descripción del puesto/i), "Reworked vacancy");

    rerender(
      <JobDescriptionForm
        initialGithubRepositoryUrl="https://github.com/acme/other-repo"
        initialJobDescription="Should not override edited draft"
        initialPrefillKey="history-123"
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Reworked vacancy");
    expect(screen.getByLabelText(/url de github/i)).toHaveValue("https://github.com/acme/design-system");
  });
});