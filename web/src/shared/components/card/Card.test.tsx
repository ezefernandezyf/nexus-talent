import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children inside the card", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with flat, elevated, and interactive variants", () => {
    const variants = ["flat", "elevated", "interactive"] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Card variant={variant}>{variant}</Card>,
      );
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
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

  it("renders Card.Header with its children", () => {
    render(
      <Card>
        <Card.Header>Header content</Card.Header>
      </Card>,
    );
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("renders Card.Body with its children", () => {
    render(
      <Card>
        <Card.Body>Body content</Card.Body>
      </Card>,
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders Card.Footer with its children", () => {
    render(
      <Card>
        <Card.Footer>Footer content</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("renders header, body, and footer together", () => {
    render(
      <Card>
        <Card.Header>Title</Card.Header>
        <Card.Body>Description</Card.Body>
        <Card.Footer>Actions</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });
});
