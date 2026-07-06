import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer snapshot", () => {
  it("renders consistently", () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
