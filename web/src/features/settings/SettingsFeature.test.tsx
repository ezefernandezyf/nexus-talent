import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { createProfileRepository } from "./api/profile-repository";
import { ThemeProvider } from "@/core/theme";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { mockDownloadApis } from "@/test/mocks/browser";
import { SettingsFeature } from "./SettingsFeature";

// Shared mock axios instance
const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(() => false),
  },
}));

function preSeedSession(queryClient: ReturnType<typeof createTestQueryClient>) {
  queryClient.setQueryData(["auth", "session"], {
    user: {
      id: "user-1",
      email: "analyst@nexustalent.dev",
      displayName: "Marcus Sterling",
      user_metadata: {
        display_name: "Marcus Sterling",
        location: "San Francisco, CA",
      },
      identities: [
        { identity_id: "github-identity", provider: "github", user_id: "user-1" },
      ],
      app_metadata: { provider: "github" },
    },
    isAdmin: false,
  });
  useAuthStatus.setState({ status: "authenticated" });
}

function renderSettingsFeature(repository = createProfileRepository(null)) {
  const queryClient = createTestQueryClient();

  preSeedSession(queryClient);
  localStorage.setItem("nexus-talent:theme:v1", "dark");

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
              <SettingsFeature repository={repository} />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("SettingsFeature", () => {
  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  it("renders the settings sections with reference-like hierarchy", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/gestioná tu identidad/i)).toBeInTheDocument());

    // 4 numbered cards exist (P14 adds a 4th card)
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();

    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Perfil Profesional")).toBeInTheDocument();

    // Email and name fields
    expect(screen.getByLabelText(/email/i)).toHaveValue("analyst@nexustalent.dev");
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("Marcus Sterling");
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();

    // Export and sign out buttons
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it("keeps the profile form editable after a save failure", async () => {
    const user = userEvent.setup();
    const repository = {
      get: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
      save: vi.fn(async () => {
        throw new Error("Supabase is temporarily unavailable");
      }),
    };

    renderSettingsFeature(repository as never);

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /guardar cambios/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
      expect(buttons[0]).toBeEnabled();
    });

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    // Click the FIRST "Guardar cambios" button (Account card)
    const saveButtons = screen.getAllByRole("button", { name: /guardar cambios/i });
    await user.click(saveButtons[0]);

    await waitFor(() => expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument());
    const buttonsAfter = screen.getAllByRole("button", { name: /guardar cambios/i });
    expect(buttonsAfter[0]).toBeEnabled();
  });

  it("persists the profile display name through the settings flow", async () => {
    const user = userEvent.setup();
    const repository = {
      get: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
      save: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "M. Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
    };

    renderSettingsFeature(repository as never);

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /guardar cambios/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
      expect(buttons[0]).toBeEnabled();
    });

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    // Click the FIRST "Guardar cambios" button (Account card)
    const saveButtons = screen.getAllByRole("button", { name: /guardar cambios/i });
    await user.click(saveButtons[0]);

    await waitFor(() => expect(screen.getByText(/perfil guardado correctamente/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("M. Sterling");
    expect(repository.save).toHaveBeenCalledWith({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });
  });

  it("keeps the delete account flow interactive", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeEnabled();
  });

  it("shows the linked accounts section (OAuth enabled)", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/gestioná tu identidad/i)).toBeInTheDocument());

    // OAuth section is visible — ACCOUNT_LINKING_AVAILABLE = true
    expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument();
  });

  it("reflects the shared theme state in the account summary", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/oscuro/i)).toBeInTheDocument());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
