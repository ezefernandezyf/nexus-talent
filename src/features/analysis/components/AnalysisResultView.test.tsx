import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AnalysisResultView } from "./AnalysisResultView";
import { createAnalysisResult } from "../../../test/factories/analysis";
import { mockClipboard, mockDownloadApis, mockWindowOpen } from "../../../test/mocks/browser";

describe("AnalysisResultView", () => {
  beforeEach(() => {
    mockClipboard();
    mockWindowOpen();
    mockDownloadApis();
  });

  it("preserves edits when copying outreach", async () => {
    const user = userEvent.setup();
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);

    render(
      <AnalysisResultView
        copyToClipboard={copyToClipboard}
        result={createAnalysisResult({
          skillGroups: [
            {
              category: "Stack principal",
              skills: [
                { name: "React", level: "core" },
                { name: "TypeScript", level: "strong" },
              ],
            },
          ],
        })}
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
        result={createAnalysisResult({
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "adjacent" }],
            },
          ],
        })}
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
        result={createAnalysisResult({
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
        })}
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

  it("renders the structured vacancy sections and copies the short DM version", async () => {
    const user = userEvent.setup();
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);

    render(
      <AnalysisResultView
        copyToClipboard={copyToClipboard}
        result={createAnalysisResult({})}
      />,
    );

    expect(screen.getByText(/Resumen de la vacante/i)).toBeInTheDocument();
    expect(screen.getByText(/Skills y términos para repetir/i)).toBeInTheDocument();
    expect(screen.getByText(/Posibles huecos y cómo cubrirlos/i)).toBeInTheDocument();
    expect(screen.getByText(/Versión A/i)).toBeInTheDocument();
    expect(screen.getByText(/Versión B/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copiar dm corto/i }));

    expect(copyToClipboard).toHaveBeenCalledWith(expect.stringContaining("Hola"));
    expect(screen.getByText(/se copió el dm corto editado/i)).toBeInTheDocument();
  });

  it("renders GitHub enrichment when available", () => {
    const { getAllByText } = render(
      <AnalysisResultView
        result={createAnalysisResult({
          githubEnrichment: {
            repositoryName: "ezefernandezyf/nexus-talent",
            repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
            detectedStack: [
              { name: "TypeScript", source: "languages" },
              { name: "React", source: "topics" },
            ],
          },
        })}
      />,
    );

    expect(screen.getByText(/GitHub enriquecido/i)).toBeInTheDocument();
    expect(screen.getByText(/Stack observado en el repositorio/i)).toBeInTheDocument();
    expect(getAllByText("TypeScript").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /ezefernandezyf\/nexus-talent/i })).toBeInTheDocument();
  });
  it("falls back to the default GitHub label for unknown enrichment sources", () => {
    render(
      <AnalysisResultView
        result={createAnalysisResult({
          githubEnrichment: {
            repositoryName: "ezefernandezyf/nexus-talent",
            repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
            detectedStack: [{ name: "Documentation", source: "unknown" }],
          },
        })}
      />,
    );

    expect(screen.getByText(/GitHub enriquecido/i)).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("falls back to a copy-friendly error when email export is blocked", async () => {
    const user = userEvent.setup();
    vi.mocked(window.open).mockReturnValueOnce(null);

    render(
      <AnalysisResultView
        result={createAnalysisResult({
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /abrir email/i }));

    expect(screen.getByText(/no se pudo abrir el cliente de correo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar mensaje/i })).toBeInTheDocument();
  });

  it("renders GitHub topic and description signals and surfaces download failures", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      throw new Error("Downloads unavailable");
    });

    render(
      <AnalysisResultView
        result={createAnalysisResult({
          githubEnrichment: {
            repositoryName: "ezefernandezyf/nexus-talent",
            repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
            detectedStack: [
              { name: "Architecture", source: "description" },
              { name: "React", source: "topics" },
            ],
          },
        })}
      />,
    );

    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText(/Descripción/i)).toBeInTheDocument();

    const topicSignal = screen.getAllByText("React").find((element) => element.closest(".tech-chip")?.textContent?.includes("Topics"));
    expect(topicSignal).toBeDefined();
    expect(screen.getByText(/Topics/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /descargar markdown/i }));
    expect(screen.getByText(/no se pudo descargar el archivo markdown/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /descargar json/i }));
    expect(screen.getByText(/no se pudo descargar el archivo json/i)).toBeInTheDocument();

    createObjectURL.mockRestore();
  });
});