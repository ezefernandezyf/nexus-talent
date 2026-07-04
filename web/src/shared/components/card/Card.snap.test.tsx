import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card snapshot", () => {
  it("renders all variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Card padding="sm">
          <Card.Header>Flat Header</Card.Header>
          <Card.Body>Flat body content with more text.</Card.Body>
          <Card.Footer>Flat footer</Card.Footer>
        </Card>
        <Card muted padding="md">
          <Card.Header>Muted Header</Card.Header>
          <Card.Body>Muted body content.</Card.Body>
          <Card.Footer>Muted footer</Card.Footer>
        </Card>
        <Card interactive padding="lg">
          <Card.Header>Interactive Header</Card.Header>
          <Card.Body>Interactive body content.</Card.Body>
          <Card.Footer>Interactive footer</Card.Footer>
        </Card>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
