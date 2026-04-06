interface DownloadTextFileOptions {
  content: string;
  filename: string;
  mimeType?: string;
}

export function downloadTextFile({ content, filename, mimeType = "text/plain;charset=utf-8" }: DownloadTextFileOptions) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener noreferrer";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    return true;
  } catch {
    return false;
  }
}