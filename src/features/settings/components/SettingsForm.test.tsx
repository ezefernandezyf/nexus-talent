import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PROFILE_FORM_SCHEMA } from "../../../lib/validation/profile";
import { SettingsForm } from "./SettingsForm";

describe("SettingsForm", () => {
  it("shows validation errors when the payload is malformed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SettingsForm displayName="Marcus Sterling" email="analyst@nexustalent.dev" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nombre visible/i), {
      target: { value: `${"a".repeat(121)}` },
    });
    await user.click(screen.getByRole("button", { name: /guardar perfil/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Revisá el nombre visible antes de guardar.");
    expect(PROFILE_FORM_SCHEMA.safeParse({ displayName: `${"a".repeat(121)}` }).success).toBe(false);
  });

  it("shows the email as a read-only field and disables submission while saving", () => {
    render(
      <SettingsForm
        displayName="Marcus Sterling"
        email="analyst@nexustalent.dev"
        isPending
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue("analyst@nexustalent.dev");
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
  });

  it("shows an unavailable-state message when storage is blocked", () => {
    render(
      <SettingsForm
        displayName="Marcus Sterling"
        email="analyst@nexustalent.dev"
        isUnavailable
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("El almacenamiento del perfil no está disponible en este momento.");
  });
});