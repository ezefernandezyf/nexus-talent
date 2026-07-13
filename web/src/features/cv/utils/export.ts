import type { CVSection } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Markdown Export
// ---------------------------------------------------------------------------

/**
 * Converts CV sections to Markdown format.
 * First section uses h1, subsequent sections use h2.
 */
export function exportAsMarkdown(sections: CVSection[]): string {
  if (sections.length === 0) return "";

  return sections
    .map((section, index) => {
      const prefix = index === 0 ? "#" : "##";
      return `${prefix} ${section.heading}\n${section.body}`;
    })
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// HTML Export
// ---------------------------------------------------------------------------

/**
 * Converts CV sections to a styled HTML document suitable for printing.
 */
export function exportAsHtml(sections: CVSection[]): string {
  if (sections.length === 0) return "";

  const sectionHtml = sections
    .map((section, index) => {
      const tag = index === 0 ? "h1" : "h2";
      return `<${tag}>${escapeHtml(section.heading)}</${tag}>\n<p>${escapeHtml(section.body)}</p>`;
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CV</title>
<style>
  body {
    font-family: "Switzer", "Geist", -apple-system, sans-serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 0 24px;
    line-height: 1.6;
    color: #1a1a1a;
  }
  h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
  h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.5rem; }
  p { margin-bottom: 1rem; white-space: pre-wrap; }
  @media print {
    body { margin: 0; padding: 0.5in; }
  }
</style>
</head>
<body>
${sectionHtml}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

/**
 * Triggers a browser download of the given content as a file.
 */
export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
