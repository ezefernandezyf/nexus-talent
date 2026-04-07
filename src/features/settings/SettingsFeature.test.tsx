import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createQueryClientWrapper } from "../../test/mocks/query-client";
import { createDefaultSettings } from "../../lib/validation/settings";
import { SettingsFeature } from "./SettingsFeature";

function createRepository() {
  const settings = createDefaultSettings({
    allowedDomains: ["empresa.com"],
    maintenanceMode: false,
    updatedAt: "2026-04-05T12:00:00.000Z",
  });

  return {
    get: vi.fn(async () => settings),
    save: vi.fn(async (payload) => ({
      ...settings,
      allowedDomains: payload.allowedDomains,
      maintenanceMode: payload.maintenanceMode,
      updatedAt: "2026-04-05T12:10:00.000Z",
    })),
  };
}

describe("SettingsFeature", () => {
  it("renders the settings form after loading and persists updates", async () => {
    const user = userEvent.setup();
    const repository = createRepository();
    const wrapper = createQueryClientWrapper();

    render(<SettingsFeature repository={repository} />, { wrapper });

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar configuración/i })).toBeInTheDocument());

    await user.click(screen.getByRole("checkbox", { name: /modo mantenimiento/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "partners.dev");
    await user.click(screen.getByRole("button", { name: /guardar configuración/i }));

    await waitFor(() => expect(repository.save).toHaveBeenCalledWith({ allowedDomains: ["partners.dev"], maintenanceMode: true }));
    expect(screen.getByRole("status")).toHaveTextContent("Configuración guardada correctamente.");
  });
});
