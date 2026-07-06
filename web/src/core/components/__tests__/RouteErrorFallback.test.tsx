import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorFallback } from "../RouteErrorFallback";

// Mocks for react-router-dom hooks used by RouteErrorFallback
const mockUseRouteError = vi.hoisted(() => vi.fn());
const mockUseNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useRouteError: mockUseRouteError,
    useNavigate: () => mockUseNavigate,
  };
});

describe("RouteErrorFallback", () => {
  it("renders the error status and message from a RouteErrorResponse", () => {
    mockUseRouteError.mockReturnValue({
      status: 404,
      statusText: "Not Found",
      data: { message: "La página solicitada no existe." },
      internal: false,
    });

    render(
      <MemoryRouter>
        <RouteErrorFallback />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("La página solicitada no existe.")).toBeInTheDocument();
  });

  it("renders the error message from an Error instance", () => {
    mockUseRouteError.mockReturnValue(new Error("Algo salió mal en el componente."));

    render(
      <MemoryRouter>
        <RouteErrorFallback />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Algo salió mal en el componente.")).toBeInTheDocument();
  });

  it("renders a fallback message when error is unknown", () => {
    mockUseRouteError.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <RouteErrorFallback />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Ha ocurrido un error inesperado.")).toBeInTheDocument();
  });

  it("renders a Retry button that reloads the page", () => {
    mockUseRouteError.mockReturnValue(new Error("boom"));

    const originalLocation = window.location;
    let reloadCalled = false;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: vi.fn(() => { reloadCalled = true; }) },
      writable: true,
      configurable: true,
    });

    render(
      <MemoryRouter>
        <RouteErrorFallback />
      </MemoryRouter>,
    );

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(reloadCalled).toBe(true);

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("renders a Volver link with the default fallbackRoute", () => {
    mockUseRouteError.mockReturnValue(new Error("boom"));

    render(
      <MemoryRouter>
        <RouteErrorFallback />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });

  it("uses the provided fallbackRoute for the navigation link", () => {
    mockUseRouteError.mockReturnValue(new Error("boom"));

    render(
      <MemoryRouter>
        <RouteErrorFallback fallbackRoute="/app/analysis" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/app/analysis");
  });
});
