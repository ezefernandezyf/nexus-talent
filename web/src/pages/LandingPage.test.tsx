import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "../features/landing/pages/LandingPage";

describe("LandingPage", () => {
  it("renders the stitched landing composition and mobile navigation", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // Hero section
    expect(screen.getByRole("heading", { name: /transform job descriptions into actionable insights/i })).toBeInTheDocument();
    expect(screen.getByText("AI-Powered Job Intelligence")).toBeInTheDocument();
    const signInLinks = screen.getAllByRole("link", { name: /^sign in$/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(2);
    const startAnalyzingLinks = screen.getAllByRole("link", { name: /start analyzing now/i });
    expect(startAnalyzingLinks.length).toBeGreaterThanOrEqual(1);
    startAnalyzingLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/sign-up");
    });

    // What Is section
    expect(screen.getByText("What Is Nexus Talent")).toBeInTheDocument();

    // How It Works section
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Three steps to a smarter application")).toBeInTheDocument();
    expect(screen.getByText("Paste the Job Description")).toBeInTheDocument();
    expect(screen.getByText("AI Analyzes the Signals")).toBeInTheDocument();
    expect(screen.getByText("Get Structured Output")).toBeInTheDocument();

    // Features section
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Smart Signal Extraction")).toBeInTheDocument();
    expect(screen.getByText("Structured Skills Matrix")).toBeInTheDocument();
    expect(screen.getByText("Instant Outreach Copy")).toBeInTheDocument();
    expect(screen.getByText("Private & Secure")).toBeInTheDocument();

    // FAQ section
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("How does AI job analysis work?")).toBeInTheDocument();

    // CTA section
    expect(screen.getByText(/stop guessing\. start applying with precision\./i)).toBeInTheDocument();

    // Brand link — find the nav root link
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: /nexus talent/i })).toHaveAttribute("href", "/");

    signInLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/sign-in");
    });

    // Mobile drawer interaction
    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(drawer).getByRole("link", { name: "Analysis" })).toHaveAttribute("href", "/app/analysis");
    expect(within(drawer).getByRole("link", { name: /^sign in$/i })).toHaveAttribute("href", "/auth/sign-in");
    expect(within(drawer).getByRole("link", { name: /^get started free$/i })).toHaveAttribute("href", "/auth/sign-up");

    await user.click(within(drawer).getByRole("button", { name: /cerrar menú/i }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog", { name: "Nexus Talent" }));
  });
});
