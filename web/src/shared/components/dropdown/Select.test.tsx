import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

describe("Select", () => {
  it("renders with placeholder text", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("renders the selected value label", () => {
    render(<Select options={options} value="react" />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("opens the options list on trigger click", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vue" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Svelte" })).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Select options={options} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "React" }));
    expect(onChange).toHaveBeenCalledWith("react");
  });

  it("closes after selecting an option", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "Vue" }));

    expect(screen.queryByRole("option", { name: "React" })).not.toBeInTheDocument();
  });
});
