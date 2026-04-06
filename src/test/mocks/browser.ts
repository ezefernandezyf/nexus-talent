import { vi } from "vitest";

export function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText,
    },
  });

  return { writeText };
}

export function mockWindowOpen(returnValue: Window | null = {} as Window) {
  const open = vi.fn().mockReturnValue(returnValue);

  Object.defineProperty(window, "open", {
    configurable: true,
    value: open,
  });

  return open;
}

export function mockDownloadApis() {
  const createObjectURL = vi.fn().mockReturnValue("blob:outreach");
  const revokeObjectURL = vi.fn();
  const click = vi.fn();

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });

  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });

  Object.defineProperty(HTMLAnchorElement.prototype, "click", {
    configurable: true,
    value: click,
  });

  return { createObjectURL, revokeObjectURL, click };
}