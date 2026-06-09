import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "./download";

describe("downloadTextFile", () => {
  let createObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLAnchorElement.prototype, "click", {
      configurable: true,
      value: vi.fn(),
    });

    createObjectUrlSpy = vi.spyOn(URL, "createObjectURL");
    revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL");
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    createObjectUrlSpy.mockReturnValue("blob:outreach");
    revokeObjectUrlSpy.mockImplementation(() => undefined);
    clickSpy.mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("downloads a file using the requested filename", () => {
    const result = downloadTextFile({
      content: "# Outreach draft",
      filename: "outreach.md",
      mimeType: "text/markdown;charset=utf-8",
    });

    expect(result).toBe(true);
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:outreach");
  });

  it("fails closed when browser download APIs are unavailable", () => {
    createObjectUrlSpy.mockImplementation(() => {
      throw new Error("Unsupported");
    });

    const result = downloadTextFile({
      content: "{}",
      filename: "outreach.json",
      mimeType: "application/json;charset=utf-8",
    });

    expect(result).toBe(false);
  });
});