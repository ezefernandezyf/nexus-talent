import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children inside the card", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with muted background when muted is true", () => {
    render(<Card muted>Muted card</Card>);
    expect(screen.getByText("Muted card")).toBeInTheDocument();
  });

  it("renders as interactive when interactive is true", () => {
    render(<Card interactive>Interactive card</Card>);
    expect(screen.getByText("Interactive card")).toBeInTheDocument();
  });

  it("renders with sm, md, and lg padding", () => {
    const paddings = ["sm", "md", "lg"] as const;
    for (const padding of paddings) {
      const { unmount } = render(
        <Card padding={padding}>{padding}</Card>,
      );
      expect(screen.getByText(padding)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders Card.Header with its children (deprecated)", () => {
    render(
      <Card>
        <Card.Header>Header content</Card.Header>
      </Card>,
    );
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("renders Card.Body with its children (deprecated)", () => {
    render(
      <Card>
        <Card.Body>Body content</Card.Body>
      </Card>,
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders Card.Footer with its children (deprecated)", () => {
    render(
      <Card>
        <Card.Footer>Footer content</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
