import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdHocItemForm } from "./AdHocItemForm";
import type { AdHocItem } from "./AdHocItemForm";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AdHocItemForm", () => {
  const defaultItems: AdHocItem[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders type selector, title input, and add button", () => {
    render(<AdHocItemForm items={defaultItems} onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Built a portfolio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
  });

  it("shows added items as chips with remove button", () => {
    const items: AdHocItem[] = [
      { type: "experience", title: "Built AI project" },
      { type: "education", title: "MIT AI Lab" },
    ];

    render(<AdHocItemForm items={items} onChange={() => {}} />);

    expect(screen.getByText("Built AI project")).toBeInTheDocument();
    expect(screen.getByText("MIT AI Lab")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(2);
  });

  it("calls onChange with new item when add button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AdHocItemForm items={defaultItems} onChange={onChange} />);

    const titleInput = screen.getByPlaceholderText("e.g. Built a portfolio");
    await user.type(titleInput, "New Project");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(onChange).toHaveBeenCalledWith([
      { type: "experience", title: "New Project" },
    ]);
  });

  it("calls onChange with item removed when remove button is clicked", async () => {
    const user = userEvent.setup();
    const items: AdHocItem[] = [
      { type: "custom", title: "Custom Skill" },
      { type: "project", title: "My Project" },
    ];
    const onChange = vi.fn();

    render(<AdHocItemForm items={items} onChange={onChange} />);

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([
      { type: "project", title: "My Project" },
    ]);
  });

  it("uses selected type when adding item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AdHocItemForm items={defaultItems} onChange={onChange} />);

    // Select project type
    await user.selectOptions(screen.getByRole("combobox"), "project");
    const titleInput = screen.getByPlaceholderText("e.g. Built a portfolio");
    await user.type(titleInput, "Side Project");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(onChange).toHaveBeenCalledWith([
      { type: "project", title: "Side Project" },
    ]);
  });

  it("submits optional fields when filled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AdHocItemForm items={defaultItems} onChange={onChange} />);

    await user.selectOptions(screen.getByRole("combobox"), "education");
    const titleInput = screen.getByPlaceholderText("e.g. Built a portfolio");
    await user.type(titleInput, "Course");
    const subtitleInput = screen.getByPlaceholderText("e.g. Personal project");
    await user.type(subtitleInput, "Online Course");
    const dateInput = screen.getByLabelText(/date/i);
    await user.type(dateInput, "2024-01");
    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, "Learned a lot");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(onChange).toHaveBeenCalledWith([
      {
        type: "education",
        title: "Course",
        subtitle: "Online Course",
        date: "2024-01",
        description: "Learned a lot",
      },
    ]);
  });

  it("does not call onChange when title is empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AdHocItemForm items={defaultItems} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders all four type options", () => {
    render(<AdHocItemForm items={defaultItems} onChange={() => {}} />);

    const select = screen.getByRole("combobox");
    const options = within(select).getAllByRole("option");

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("experience");
    expect(options[1]).toHaveValue("education");
    expect(options[2]).toHaveValue("project");
    expect(options[3]).toHaveValue("custom");
  });
});
