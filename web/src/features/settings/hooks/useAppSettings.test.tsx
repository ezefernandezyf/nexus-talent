import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { useAppSettings, APP_SETTINGS_KEY, type AppSettings } from "./useAppSettings";

const MOCK_SETTINGS: AppSettings = {
  theme: "dark",
  emailDigest: true,
  rateLimitTier: "default",
};

function createFetchMock({
  getStatus = 200,
  getBody = MOCK_SETTINGS,
  putStatus = 200,
  putBody = MOCK_SETTINGS,
  rejectGet = false,
  rejectPut = false,
}: {
  getStatus?: number;
  getBody?: AppSettings;
  putStatus?: number;
  putBody?: AppSettings;
  rejectGet?: boolean;
  rejectPut?: boolean;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const method = (init as RequestInit | undefined)?.method ?? "GET";

    if (method === "PUT") {
      if (rejectPut) throw new Error("Network error");
      return new Response(JSON.stringify(putBody), { status: putStatus });
    }

    // GET
    if (rejectGet) throw new Error("Network error");
    return new Response(JSON.stringify(getBody), { status: getStatus });
  });
}

describe("useAppSettings", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStatus.getState().setStatus("unknown");
  });

  it("fetches settings on mount when authenticated", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed session cache as authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    const fetchSpy = createFetchMock();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toEqual(MOCK_SETTINGS);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/settings");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("does NOT fetch when unauthenticated", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed session cache as unauthenticated
    queryClient.setQueryData(["auth", "session"], null);
    useAuthStatus.setState({ status: "unauthenticated" });

    const fetchSpy = createFetchMock();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    // Give React Query a tick to settle
    await waitFor(() => {
      expect(result.current.settings).toBeNull();
    });

    // The settings fetch should never have been called
    const fetchCalls = fetchSpy.mock.calls.filter(
      ([url]) => url === "/api/settings",
    );
    expect(fetchCalls).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("syncSettings mutation calls PUT /api/settings with correct body", async () => {
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    const fetchSpy = createFetchMock();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.settings).toEqual(MOCK_SETTINGS);
    });

    // Call syncSettings
    await result.current.syncSettings({ theme: "light" });

    // Verify PUT was called with correct URL, method, and body
    const putCall = fetchSpy.mock.calls.find(
      ([_url, init]) => (init as RequestInit | undefined)?.method === "PUT",
    );
    expect(putCall).toBeDefined();
    expect(putCall![0]).toBe("/api/settings");

    const putInit = putCall![1] as RequestInit;
    expect(putInit.method).toBe("PUT");
    expect(putInit.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(putInit.body as string)).toEqual({ theme: "light" });

    // Verify the query cache was updated with the response
    expect(queryClient.getQueryData(APP_SETTINGS_KEY)).toEqual(MOCK_SETTINGS);
  });

  it("handles GET API errors gracefully", async () => {
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    createFetchMock({ rejectGet: true });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBeDefined();
  });

  it("handles sync (PUT) API errors gracefully", async () => {
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    createFetchMock({ rejectPut: true });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    // Wait for initial GET to complete
    await waitFor(() => {
      expect(result.current.settings).toEqual(MOCK_SETTINGS);
    });

    // The sync mutation should reject with an error
    await expect(result.current.syncSettings({ theme: "light" })).rejects.toThrow();
  });

  it("returns null settings and no error before first successful fetch", async () => {
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(["auth", "session"], {
      user: { id: "user-1", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    // Delay the response so we can observe the loading state
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify(MOCK_SETTINGS), { status: 200 }),
              ),
            100,
          ),
        ),
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAppSettings(), { wrapper });

    // During loading, settings should be null and no error
    expect(result.current.settings).toBeNull();
    expect(result.current.isError).toBe(false);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.settings).toEqual(MOCK_SETTINGS);
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchSpy).toHaveBeenCalledWith("/api/settings");
  });
});
