import { describe, expect, it, vi, beforeEach } from "vitest";
import { exportAsMarkdown, exportAsHtml, downloadBlob } from "./export";
import type { CVSection } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleSections: CVSection[] = [
  {
    heading: "Professional Summary",
    body: "Experienced software engineer with 5 years in full-stack development.",
    order: 0,
  },
  {
    heading: "Skills",
    body: "- React\n- TypeScript\n- Node.js",
    order: 1,
  },
  {
    heading: "Experience",
    body: "Senior Developer at Acme Corp (2023-present)\n- Built scalable APIs\n- Led team of 5 engineers",
    order: 2,
  },
];

const emptySections: CVSection[] = [];

// ---------------------------------------------------------------------------
// exportAsMarkdown
// ---------------------------------------------------------------------------

describe("exportAsMarkdown", () => {
  it("generates markdown with headings and body content for each section", () => {
    const result = exportAsMarkdown(sampleSections);

    expect(result).toContain("# Professional Summary");
    expect(result).toContain(
      "Experienced software engineer with 5 years in full-stack development.",
    );
    expect(result).toContain("## Skills");
    expect(result).toContain("- React\n- TypeScript\n- Node.js");
    expect(result).toContain("## Experience");
    expect(result).toContain("Senior Developer at Acme Corp (2023-present)");
  });

  it("uses h1 for first section and h2 for subsequent sections", () => {
    const result = exportAsMarkdown(sampleSections);

    const lines = result.split("\n");
    const firstHeading = lines.find((l) => l.startsWith("# "));
    const subHeadings = lines.filter((l) => l.startsWith("## "));

    expect(firstHeading).toBe("# Professional Summary");
    expect(subHeadings).toHaveLength(2);
    expect(subHeadings[0]).toBe("## Skills");
    expect(subHeadings[1]).toBe("## Experience");
  });

  it("returns empty string when sections array is empty", () => {
    const result = exportAsMarkdown(emptySections);
    expect(result).toBe("");
  });

  it("separates sections with double newlines", () => {
    const result = exportAsMarkdown(sampleSections);
    // There should be blank lines between sections
    expect(result).toContain("development.\n\n## Skills");
    expect(result).toContain("Node.js\n\n## Experience");
  });

  it("handles single section — uses h1, no h2", () => {
    const sections: CVSection[] = [
      { heading: "Summary", body: "Just one section.", order: 0 },
    ];

    const result = exportAsMarkdown(sections);

    expect(result).toBe("# Summary\nJust one section.");
    expect(result).not.toContain("##");
  });
});

// ---------------------------------------------------------------------------
// exportAsHtml
// ---------------------------------------------------------------------------

describe("exportAsHtml", () => {
  it("generates a complete HTML document with sections", () => {
    const result = exportAsHtml(sampleSections);

    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<html");
    expect(result).toContain("</html>");
    expect(result).toContain("<h1>Professional Summary</h1>");
    expect(result).toContain(
      "<p>Experienced software engineer with 5 years in full-stack development.</p>",
    );
    expect(result).toContain("<h2>Skills</h2>");
  });

  it("wraps body content in paragraph tags", () => {
    const result = exportAsHtml(sampleSections);

    // Simple body text should be in <p>
    expect(result).toContain(
      "<p>Experienced software engineer with 5 years in full-stack development.</p>",
    );
  });

  it("returns empty string when sections array is empty", () => {
    const result = exportAsHtml(emptySections);
    expect(result).toBe("");
  });

  it("includes basic styling for print-friendly output", () => {
    const result = exportAsHtml(sampleSections);

    expect(result).toContain("font-family");
    expect(result).toContain("max-width");
    expect(result).toContain("margin");
  });

  it("names first section with h1 and rest with h2", () => {
    const result = exportAsHtml(sampleSections);

    const h1Count = (result.match(/<h1>/g) || []).length;
    const h2Count = (result.match(/<h2>/g) || []).length;

    expect(h1Count).toBe(1);
    expect(h2Count).toBe(2);
  });

  it("escapes HTML special characters in headings and body", () => {
    const sections: CVSection[] = [
      { heading: "Skills & Tools", body: "C# & .NET <3", order: 0 },
    ];

    const result = exportAsHtml(sections);

    expect(result).toContain("Skills &amp; Tools");
    expect(result).toContain("C# &amp; .NET &lt;3");
    expect(result).not.toContain("&amp;amp;");
    expect(result).not.toContain("<h1>Skills & Tools</h1>");
  });
});

// ---------------------------------------------------------------------------
// downloadBlob
// ---------------------------------------------------------------------------

describe("downloadBlob", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let anchorClickMock: ReturnType<typeof vi.fn>;
  let anchorRemoveMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock URL.createObjectURL
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();

    // Mock document.createElement('a') behavior
    anchorClickMock = vi.fn();
    anchorRemoveMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        return {
          href: "",
          download: "",
          click: anchorClickMock,
          remove: anchorRemoveMock,
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it("creates a Blob with the correct content and MIME type", () => {
    const blobSpy = vi.spyOn(globalThis, "Blob" as any).mockImplementation(
      (content: BlobPart[], options?: BlobPropertyBag) =>
        ({ content, options }) as unknown as Blob,
    );

    downloadBlob("# Hello", "cv.md", "text/markdown");

    expect(blobSpy).toHaveBeenCalledWith(["# Hello"], {
      type: "text/markdown",
    });

    blobSpy.mockRestore();
  });

  it("creates an anchor element, sets download attributes, clicks it, and removes it", () => {
    downloadBlob("content", "cv.html", "text/html");

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(anchorClickMock).toHaveBeenCalledTimes(1);
    expect(anchorRemoveMock).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("uses the correct filename in the download attribute", () => {
    const createElementSpy = vi.spyOn(document, "createElement");

    downloadBlob("content", "cv.pdf", "application/pdf");

    const anchorCalls = createElementSpy.mock.results.filter(
      (r) => r.value && typeof r.value === "object" && "download" in r.value,
    );
    if (anchorCalls.length > 0) {
      const anchor = anchorCalls[0].value as HTMLAnchorElement;
      expect(anchor.download).toBe("cv.pdf");
    }

    createElementSpy.mockRestore();
  });
});
