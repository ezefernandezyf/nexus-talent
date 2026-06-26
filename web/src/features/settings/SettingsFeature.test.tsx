import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
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

    await waitFor(() => expect(screen.getByText(/información de la cuenta/i)).toBeInTheDocument());

    expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument();
    expect(screen.getByText(/zona de peligro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("analyst@nexustalent.dev");
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("Marcus Sterling");
    // Location data is not available with the new auth system (removed Supabase user_metadata)
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(within(screen.getByText("Google").closest("article") as HTMLElement).getByText(/no conectado/i)).toBeInTheDocument();
    expect(within(screen.getByText("Google").closest("article") as HTMLElement).getByRole("button", { name: /vincular/i })).toBeEnabled();
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

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled();
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

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

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

  it("shows linked accounts as interactive", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument());
    const googleCard = screen.getByText("Google").closest("article") as HTMLElement;
    expect(within(googleCard).getByRole("button", { name: /vincular/i })).toBeEnabled();
    expect(within(googleCard).getByText(/no conectado/i)).toBeInTheDocument();
  });

  it("reflects the shared theme state in the account summary", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/tema oscuro/i)).toBeInTheDocument());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
