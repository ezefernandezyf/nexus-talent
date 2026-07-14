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
