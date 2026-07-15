import { pdf, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5.0.0/index.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/index.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.0/index.css" />
<style>
  body {
    font-family: "Noto Sans SC", sans-serif;
    max-width: 210mm;
    margin: 0 auto;
    padding: 20mm;
    font-size: 9.5pt;
    line-height: 1.55;
    color: #353a42;
    background: #fff;
  }
  h1 {
    font-family: "Noto Serif SC", serif;
    font-size: 14pt;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #353a42;
  }
  h2 {
    font-family: "Noto Serif SC", serif;
    font-size: 10.5pt;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #dae3ea;
    padding-bottom: 2pt;
    color: #353a42;
  }
  p {
    margin-bottom: 0.75rem;
    white-space: pre-wrap;
    color: #353a42;
  }
  a, code {
    font-family: "JetBrains Mono", monospace;
    font-size: 9pt;
  }
  a { color: #4870ad; }
  .meta {
    font-family: "JetBrains Mono", monospace;
    font-size: 8pt;
    color: #8a8e94;
    margin-bottom: 1rem;
  }
  @media print {
    body { margin: 0; padding: 0; }
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
// PDF Export
// ---------------------------------------------------------------------------

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
  body: { fontSize: 11, lineHeight: 1.6, marginBottom: 16 },
  separator: { borderBottom: "1 solid #ccc", marginVertical: 12 },
  footer: { fontSize: 9, textAlign: "center", color: "#999", marginTop: 20 },
});

function CVPDFDocument({ sections }: { sections: CVSection[] }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {sections.sort((a, b) => a.order - b.order).map((section, i) => (
          <View key={i}>
            <Text style={pdfStyles.heading}>{section.heading}</Text>
            <Text style={pdfStyles.body}>{section.body}</Text>
            {i < sections.length - 1 && <View style={pdfStyles.separator} />}
          </View>
        ))}
        <Text style={pdfStyles.footer} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

/**
 * Generates a PDF document from CV sections and triggers a browser download.
 */
export async function exportAsPdf(sections: CVSection[]): Promise<void> {
  const blob = await pdf(<CVPDFDocument sections={sections} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cv.pdf";
  a.click();
  a.remove();
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
