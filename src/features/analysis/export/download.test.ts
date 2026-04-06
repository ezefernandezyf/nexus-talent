import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "./download";

describe("downloadTextFile", () => {
  const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL");
  const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL");
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

  beforeEach(() => {
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