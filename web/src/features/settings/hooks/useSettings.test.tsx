import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { ThemeProvider } from "@/core/theme";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { useSettings } from "./useSettings";

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

describe("useSettings", () => {
  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  it("saves the profile through the repository and keeps the cache in sync", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    const repository = {
      delete: vi.fn(async () => undefined),
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

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    await result.current.saveProfile({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });

    expect(repository.save).toHaveBeenCalledWith({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });
    await waitFor(() => expect(result.current.saveProfileSuccess).toBe(true));
  });

  it("deletes the profile and signs out the active session", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    // Mock the logout POST so signOut() resolves
    mockAxiosInstance.post.mockResolvedValue({ data: {} });

    const repository = {
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => null),
      save: vi.fn(async () => {
        throw new Error("not used");
      }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    await expect(result.current.deleteAccount()).resolves.toBeUndefined();

    expect(repository.delete).toHaveBeenCalledWith("user-1");
    expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("surfaces an error when trying to link or unlink identities (deprecated)", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    const repository = {
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => null),
      save: vi.fn(async () => {
        throw new Error("not used");
      }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(result.current.identityLinkingAvailable).toBe(true);

    // linkIdentity now throws - identity linking is deprecated
    await expect(result.current.connectAccount("google")).rejects.toThrow(
      "Social identity linking is not available in this version.",
    );
    await waitFor(() => expect(result.current.accountActionError).toContain("Social identity linking"));

    // unlinkIdentity also throws (different error message)
    await expect(result.current.disconnectAccount("google")).rejects.toThrow(
      "Social identity unlinking is not available in this version.",
    );
  });

  it("surfaces an error when trying to unlink a single identity (deprecated)", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    const repository = {
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => null),
      save: vi.fn(async () => {
        throw new Error("not used");
      }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    // unlinkIdentity throws immediately - identity linking is deprecated
    await expect(result.current.disconnectAccount("github")).rejects.toThrow(
      "Social identity unlinking is not available in this version.",
    );
    await waitFor(() => expect(String(result.current.accountActionError)).toContain("Social identity unlinking"));
  });
});
