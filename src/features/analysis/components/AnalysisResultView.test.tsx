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
});