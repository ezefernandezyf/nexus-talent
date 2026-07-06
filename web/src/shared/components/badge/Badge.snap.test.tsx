import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";
import { Tag } from "./Tag";
import { Status } from "./Status";

describe("Badge snapshots", () => {
  it("renders badges in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge className="text-xs">Styled Badge</Badge>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders tags in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Tag>React</Tag>
        <Tag variant="info" onRemove={() => {}}>Dismiss</Tag>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders status indicators in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Status variant="success">Online</Status>
        <Status variant="error">Offline</Status>
        <Status variant="warning">Away</Status>
        <Status variant="info">Pending</Status>
        <Status>Draft</Status>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
