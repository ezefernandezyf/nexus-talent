import { describe, expect, it } from "vitest";
import {
  buildMailtoHref,
  buildOutreachExportPayload,
  buildOutreachJson,
  buildOutreachMarkdown,
  createOutreachExportFilename,
} from "./format-outreach";

describe("outreach export helpers", () => {
  const input = {
    body: "Hola equipo,\n\nQuiero conversar sobre la vacante.",
    subject: "Interés en el puesto senior",
  };

  it("formats markdown and json exports from the edited outreach", () => {
    expect(buildOutreachMarkdown(input)).toContain("# Outreach draft");
    expect(buildOutreachMarkdown(input)).toContain("Subject: Interés en el puesto senior");
    expect(buildOutreachJson(input)).toContain("Quiero conversar sobre la vacante.");
  });

  it("builds a mailto href that carries the current subject and body", () => {
    const mailtoHref = buildMailtoHref(input);
    const parsed = new URL(mailtoHref);

    expect(parsed.protocol).toBe("mailto:");
    expect(parsed.searchParams.get("subject")).toBe("Interés en el puesto senior");
    expect(parsed.searchParams.get("body")).toContain("Quiero conversar sobre la vacante.");
  });

  it("creates stable export filenames", () => {
    expect(createOutreachExportFilename("Interés en el puesto senior", "md")).toBe("interes-en-el-puesto-senior-outreach.md");
    expect(createOutreachExportFilename("   ", "json")).toBe("nexus-talent-outreach.json");
  });

  it("returns a complete export payload", () => {
    const payload = buildOutreachExportPayload(input);

    expect(payload.subject).toBe("Interés en el puesto senior");
    expect(payload.body).toContain("Quiero conversar");
    expect(payload.markdown).toContain("Subject: Interés en el puesto senior");
    expect(payload.json).toContain("Interés en el puesto senior");
    expect(payload.mailtoHref).toContain("mailto:");
  });
});