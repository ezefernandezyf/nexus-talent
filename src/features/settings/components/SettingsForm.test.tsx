import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultSettings } from "../../../lib/validation/settings";
import { APP_SETTINGS_INPUT_SCHEMA } from "../../../lib/validation/settings";
import { SettingsForm } from "./SettingsForm";

describe("SettingsForm", () => {
  it("shows validation errors when the payload is malformed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const settings = createDefaultSettings({
      allowedDomains: ["empresa.com"],
      maintenanceMode: false,
      updatedAt: "2026-04-05T12:00:00.000Z",
    });
    const safeParseSpy = vi.spyOn(APP_SETTINGS_INPUT_SCHEMA, "safeParse").mockReturnValue({
      error: new Error("invalid") as never,
      success: false,
    });

    render(<SettingsForm onSubmit={onSubmit} settings={settings} />);

    await user.click(screen.getByRole("button", { name: /guardar configuración/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Revisá los dominios permitidos y el estado de mantenimiento.");

    safeParseSpy.mockRestore();
  });
});