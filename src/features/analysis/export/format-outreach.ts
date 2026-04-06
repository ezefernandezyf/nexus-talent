export interface OutreachExportInput {
  body: string;
  subject: string;
}

export interface OutreachExportPayload {
  body: string;
  json: string;
  mailtoHref: string;
  markdown: string;
  subject: string;
}

function normalizeValue(value: string) {
  return value.trim();
}

export function buildOutreachMarkdown(input: OutreachExportInput) {
  const subject = normalizeValue(input.subject);
  const body = normalizeValue(input.body);

  return [`# Outreach draft`, "", `Subject: ${subject}`, "", `Body:`, body].join("\n").trim();
}

export function buildOutreachJson(input: OutreachExportInput) {
  const payload = {
    body: normalizeValue(input.body),
    subject: normalizeValue(input.subject),
  };

  return JSON.stringify(payload, null, 2);
}

export function buildMailtoHref(input: OutreachExportInput) {
  const subject = normalizeValue(input.subject);
  const body = normalizeValue(input.body);
  const query = new URLSearchParams({
    body,
    subject,
  });

  return `mailto:?${query.toString()}`;
}

export function buildOutreachExportPayload(input: OutreachExportInput): OutreachExportPayload {
  const subject = normalizeValue(input.subject);
  const body = normalizeValue(input.body);

  return {
    body,
    json: buildOutreachJson({ body, subject }),
    mailtoHref: buildMailtoHref({ body, subject }),
    markdown: buildOutreachMarkdown({ body, subject }),
    subject,
  };
}

function slugify(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "nexus-talent";
}

export function createOutreachExportFilename(subject: string, extension: "json" | "md") {
  return `${slugify(subject)}-outreach.${extension}`;
}