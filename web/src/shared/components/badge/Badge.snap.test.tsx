import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";
import { Tag } from "./Tag";
import { Status } from "./Status";
import { Check } from "@phosphor-icons/react";

describe("Badge snapshots", () => {
  it("renders all badge variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="brand">Brand</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="success" icon={<Check weight="bold" />}>Icon</Badge>
        <Badge variant="brand" size="sm">Small</Badge>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders tags in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Tag variant="brand">React</Tag>
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
        <Status variant="neutral">Draft</Status>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
