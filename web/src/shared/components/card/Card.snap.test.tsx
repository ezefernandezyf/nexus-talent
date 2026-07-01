import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card snapshot", () => {
  it("renders all variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Card variant="flat" padding="sm">
          <Card.Header>Flat Header</Card.Header>
          <Card.Body>Flat body content with more text.</Card.Body>
          <Card.Footer>Flat footer</Card.Footer>
        </Card>
        <Card variant="elevated" padding="md">
          <Card.Header>Elevated Header</Card.Header>
          <Card.Body>Elevated body content.</Card.Body>
          <Card.Footer>Elevated footer</Card.Footer>
        </Card>
        <Card variant="interactive" padding="lg">
          <Card.Header>Interactive Header</Card.Header>
          <Card.Body>Interactive body content.</Card.Body>
          <Card.Footer>Interactive footer</Card.Footer>
        </Card>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
