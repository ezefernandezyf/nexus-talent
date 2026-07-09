import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToastStore } from "@/shared/components/toast";
import { ProfileEditorCard, type ProfileEditorCardProps } from "./ProfileEditorCard";

// Wrap component with QueryClientProvider for hooks that might need it
function renderCard(props: Partial<ProfileEditorCardProps> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const defaultProps: ProfileEditorCardProps = {
    profile: null,
    isLoading: false,
    isPending: false,
    onSave: vi.fn(async () => ({
      created_at: "2026-04-05T12:00:00.000Z",
      display_name: null,
      email: "analyst@nexustalent.dev",
      id: "user-1",
      updated_at: "2026-04-05T12:00:00.000Z",
      skills: null,
      experience_level: null,
      role_title: null,
      resume_link: "",
      linkedin_url: "",
      github_url: "",
      location: null,
    })),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileEditorCard {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

const MOCK_PROFILE = {
  created_at: "2026-04-05T12:00:00.000Z",
  display_name: "Marcus Sterling",
  email: "analyst@nexustalent.dev",
  id: "user-1",
  updated_at: "2026-04-05T12:00:00.000Z",
  skills: "React, TypeScript",
  experience_level: "Senior 5+",
  role_title: "Full-Stack Developer",
  resume_link: "https://drive.google.com/resume.pdf",
  linkedin_url: "https://linkedin.com/in/marcus",
  github_url: "https://github.com/marcus",
  location: "San Francisco, CA",
};

describe("ProfileEditorCard", () => {
  afterEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("renders all 7 input fields", async () => {
    renderCard({ profile: MOCK_PROFILE });

    await waitFor(() => {
      expect(screen.getByLabelText(/rol actual/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/rol actual/i)).toHaveValue("Full-Stack Developer");
    expect(screen.getByLabelText(/nivel de experiencia/i)).toHaveValue("Senior 5+");
    expect(screen.getByLabelText(/skills/i)).toHaveValue("React, TypeScript");
    expect(screen.getByLabelText(/ubicación/i)).toHaveValue("San Francisco, CA");
    expect(screen.getByLabelText(/linkedin/i)).toHaveValue("https://linkedin.com/in/marcus");
    expect(screen.getByLabelText(/github/i)).toHaveValue("https://github.com/marcus");
    expect(screen.getByLabelText(/cv \/ resume link/i)).toHaveValue("https://drive.google.com/resume.pdf");
  });

  it("shows skeleton placeholders while loading", () => {
    renderCard({ isLoading: true, profile: null });

    // The skeleton has aria-hidden elements — form fields should not be rendered
    expect(screen.getByText(/perfil profesional/i)).toBeInTheDocument();
    expect(screen.getByText(/completá tus datos profesionales/i)).toBeInTheDocument();
    // Skeleton bars have aria-hidden="true" — we check they exist
    const skeletons = document.querySelectorAll("[aria-hidden='true']");
    expect(skeletons.length).toBeGreaterThan(0);
    // Form should not be interactive
    expect(screen.queryByLabelText(/rol actual/i)).not.toBeInTheDocument();
  });

  it("pre-fills form values when profile is populated", async () => {
    renderCard({ profile: MOCK_PROFILE });

    await waitFor(() => {
      expect(screen.getByLabelText(/rol actual/i)).toHaveValue("Full-Stack Developer");
    });

    expect(screen.getByLabelText(/nivel de experiencia/i)).toHaveValue("Senior 5+");
    expect(screen.getByLabelText(/skills/i)).toHaveValue("React, TypeScript");
  });

  it("shows empty inputs with placeholders when profile is null", async () => {
    renderCard({ profile: null, isLoading: false });

    await waitFor(() => {
      expect(screen.getByLabelText(/rol actual/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/rol actual/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/full-stack developer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senior, 5\+ años/i)).toBeInTheDocument();
  });

  it("rejects invalid LinkedIn URL via Zod before calling onSave", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderCard({ profile: MOCK_PROFILE, onSave });

    await waitFor(() => {
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/linkedin/i));
    await user.type(screen.getByLabelText(/linkedin/i), "not-a-url");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    // Give RHF time to validate and set errors
    await new Promise((r) => setTimeout(r, 200));

    expect(onSave).not.toHaveBeenCalled();
    // The ZodResolver should reject the URL and not submit
    expect(screen.getByLabelText(/linkedin/i)).toHaveValue("not-a-url");
  });

  it('shows "Guardando..." when form is submitting', () => {
    renderCard({ isPending: true });

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
  });

  it("shows success toast when save succeeds", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(async () => MOCK_PROFILE);

    renderCard({ profile: null, onSave });

    await waitFor(() => {
      expect(screen.getByLabelText(/rol actual/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts.some((t) => t.message.includes("guardado correctamente"))).toBe(true);
    });
  });

  it("shows error toast when save fails", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(async () => {
      throw new Error("Server error");
    });

    renderCard({ profile: null, onSave });

    await waitFor(() => {
      expect(screen.getByLabelText(/rol actual/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts.some((t) => t.message.includes("Error al guardar"))).toBe(true);
    });
  });
});
