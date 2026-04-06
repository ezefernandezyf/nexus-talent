import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AnalysisResultView } from "./AnalysisResultView";

describe("AnalysisResultView", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    Object.defineProperty(window, "open", {
      configurable: true,
      value: vi.fn().mockReturnValue({} as Window),
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:outreach"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLAnchorElement.prototype, "click", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("preserves edits when copying outreach", async () => {
    const user = userEvent.setup();
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);

    render(
      <AnalysisResultView
        copyToClipboard={copyToClipboard}
        result={{
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [
                { name: "React", level: "core" },
                { name: "TypeScript", level: "strong" },
              ],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
          },
        }}
      />,
    );

    await user.clear(screen.getByLabelText(/asunto del mensaje/i));
    await user.type(screen.getByLabelText(/asunto del mensaje/i), "Interés en el puesto senior");

    await user.clear(screen.getByLabelText(/mensaje de contacto/i));
    fireEvent.change(screen.getByLabelText(/mensaje de contacto/i), {
      target: {
        value: "Hola equipo,\n\nRevisé la vacante y quiero conversar.\n\nSaludos,\n[Your Name]",
      },
    });

    await user.click(screen.getByRole("button", { name: /copiar mensaje/i }));

    expect(copyToClipboard).toHaveBeenCalledWith(
      expect.stringContaining("Interés en el puesto senior"),
    );
    expect(copyToClipboard).toHaveBeenCalledWith(expect.stringContaining("quiero conversar"));
    expect(screen.getByText(/se copió el mensaje editado/i)).toBeInTheDocument();
  });

  it("shows the error state when copying fails", async () => {
    const user = userEvent.setup();
    const copyToClipboard = vi.fn().mockRejectedValue(new Error("Clipboard unavailable"));

    render(
      <AnalysisResultView
        copyToClipboard={copyToClipboard}
        result={{
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "adjacent" }],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /copiar mensaje/i }));

    expect(screen.getByText(/no se pudo acceder al portapapeles/i)).toBeInTheDocument();
    expect(screen.getByText(/Adyacente/i)).toBeInTheDocument();
  });

  it("opens a draft email and exports outreach files", async () => {
    const user = userEvent.setup();

    render(
      <AnalysisResultView
        result={{
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /abrir email/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("mailto:"), "_self", "noopener,noreferrer");
    expect(screen.getByText(/se abrió el borrador de email/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /descargar markdown/i }));
    expect(screen.getByText(/se descargó el outreach en markdown/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /descargar json/i }));
    expect(screen.getByText(/se descargó el outreach en json/i)).toBeInTheDocument();
  });

  it("renders GitHub enrichment when available", () => {
    render(
      <AnalysisResultView
        result={{
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
          },
          githubEnrichment: {
            repositoryName: "ezefernandezyf/nexus-talent",
            repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
            detectedStack: [
              { name: "TypeScript", source: "languages" },
              { name: "React", source: "topics" },
            ],
          },
        }}
      />,
    );

    expect(screen.getByText(/GitHub enriquecido/i)).toBeInTheDocument();
    expect(screen.getByText(/Stack observado en el repositorio/i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ezefernandezyf\/nexus-talent/i })).toBeInTheDocument();
  });

  it("falls back to a copy-friendly error when email export is blocked", async () => {
    const user = userEvent.setup();
    vi.mocked(window.open).mockReturnValueOnce(null);

    render(
      <AnalysisResultView
        result={{
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /abrir email/i }));

    expect(screen.getByText(/no se pudo abrir el cliente de correo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar mensaje/i })).toBeInTheDocument();
  });
});