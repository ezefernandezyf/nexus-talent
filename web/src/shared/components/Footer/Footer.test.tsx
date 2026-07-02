import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  describe('variant="app"', () => {
    it("renders copyright text without SEO links", () => {
      render(
        <MemoryRouter>
          <Footer variant="app" />
        </MemoryRouter>,
      );

      // Must render copyright
      expect(screen.getByText(/built for the machine era/i)).toBeInTheDocument();

      // Must NOT render SEO/GEO navigation links
      expect(screen.queryByRole("link", { name: /privacy/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    });

    it("renders the Apex brand name", () => {
      render(
        <MemoryRouter>
          <Footer variant="app" />
        </MemoryRouter>,
      );

      // Brand name appears in the heading div, also in the copyright text
      expect(screen.getAllByText("Nexus Talent").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('variant="landing"', () => {
    it("renders copyright text with SEO links", () => {
      render(
        <MemoryRouter>
          <Footer variant="landing" />
        </MemoryRouter>,
      );

      // Must render SEO/GEO navigation links
      expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
      expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();

      // Must render copyright
      expect(screen.getByText(/© 2026/i)).toBeInTheDocument();
    });

    it("renders the Apex brand name", () => {
      render(
        <MemoryRouter>
          <Footer variant="landing" />
        </MemoryRouter>,
      );

      // Brand name appears in the heading div, also in the copyright text
      expect(screen.getAllByText("Nexus Talent").length).toBeGreaterThanOrEqual(1);
    });
  });
});
