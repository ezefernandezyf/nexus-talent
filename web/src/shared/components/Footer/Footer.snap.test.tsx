import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer snapshot", () => {
  it("renders both variants consistently", () => {
    const { container: appContainer } = render(
      <MemoryRouter>
        <Footer variant="app" />
      </MemoryRouter>,
    );

    expect(appContainer.firstChild).toMatchSnapshot();

    const { container: landingContainer } = render(
      <MemoryRouter>
        <Footer variant="landing" />
      </MemoryRouter>,
    );

    expect(landingContainer.firstChild).toMatchSnapshot();
  });
});
