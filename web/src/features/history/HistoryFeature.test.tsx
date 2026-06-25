import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnalysisRepository } from "@/features/analysis/api/repository";
import type { SavedJobAnalysis } from "@/features/analysis/schemas/job-analysis";
import { HistoryFeature } from "./HistoryFeature";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;

  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function createAnalysis(overrides: Partial<SavedJobAnalysis> = {}): SavedJobAnalysis {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: "2026-04-05T12:05:00.000Z",
    jobDescription: "Frontend Engineer\nBuild robust UI systems",
    summary: "Análisis guardado para revisar la estrategia frontend y la calidad técnica.",
    skillGroups: [
      {
        category: "Core",
        skills: [{ name: "React", level: "core" }],
      },
    ],
    outreachMessage: {
      subject: "Interés",
      body: "Hola equipo",
    },
    ...overrides,
  };
}

describe("HistoryFeature", () => {
  it("renders the loading state while history is pending", () => {
    const deferred = createDeferred<Awaited<ReturnType<AnalysisRepository["getAll"]>>>();
    const repository: AnalysisRepository = {
      save: vi.fn(async () => createAnalysis()),
      getAll: vi.fn(() => deferred.promise),
      getById: vi.fn(async () => null),
      update: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);

    render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    expect(screen.getByRole("status", { name: /cargando historial/i })).toBeInTheDocument();
    expect(screen.getByText(/compañía \/ id/i)).toBeInTheDocument();
  });

  it("renders the empty state when no analyses exist", async () => {
    const repository: AnalysisRepository = {
      save: vi.fn(async () => createAnalysis()),
      getAll: vi.fn(async () => ({ items: [], total: 0 })),
      getById: vi.fn(async () => null),
      update: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);

    render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("link", { name: /ir al análisis/i })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /ir al análisis/i })).toHaveAttribute("href", "/app/analysis");
  });

  it("renders analyses sorted by most recent first", async () => {
    const items = [
      {
        ...createAnalysis(),
        id: "11111111-1111-4111-8111-111111111111",
        createdAt: "2026-04-05T11:05:00.000Z",
        jobDescription: "Platform Engineer\nBuild resilient systems",
      },
      {
        ...createAnalysis(),
        id: "22222222-2222-4222-8222-222222222222",
        createdAt: "2026-04-05T12:05:00.000Z",
        jobDescription: "Frontend Engineer\nBuild robust UI systems",
      },
    ];
    const repository: AnalysisRepository = {
      save: vi.fn(async () => createAnalysis()),
      getAll: vi.fn(async () => ({ items, total: 2 })),
      getById: vi.fn(async () => null),
      update: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);

    const { container } = render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("listitem", { name: /Frontend Engineer/i })).toBeInTheDocument());

    const companies = Array.from(container.querySelectorAll("[role='listitem'] p.text-sm.font-semibold")).map((node) => node.textContent);
    expect(companies).toEqual(["Frontend Engineer", "Platform Engineer"]);
  });

  it("shows only the current page of analyses from the server and navigates pages", async () => {
    const allAnalyses = Array.from({ length: 11 }, (_, index) =>
      createAnalysis({
        id: `550e8400-e29b-41d4-a716-44665544${String(index).padStart(4, "0")}`,
        createdAt: `2026-04-05T12:${String(11 - index).padStart(2, "0")}:00.000Z`,
        jobDescription: `Analysis ${11 - index}\nBuild item ${11 - index}`,
        summary: `Summary ${11 - index}`,
      }),
    );

    const repository: AnalysisRepository = {
      save: vi.fn(async () => allAnalyses[0]),
      getAll: vi.fn(async (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const start = (page - 1) * limit;
        const items = allAnalyses.slice(start, start + limit);
        return { items, total: allAnalyses.length };
      }),
      getById: vi.fn(async (id) => allAnalyses.find((analysis) => analysis.id === id) ?? null),
      update: vi.fn(async () => null),
      delete: vi.fn(async (id) => {
        const index = allAnalyses.findIndex((analysis) => analysis.id === id);
        if (index >= 0) {
          allAnalyses.splice(index, 1);
        }
      }),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    // Page 1: server returns 10 items, total = 11
    await waitFor(() => expect(screen.getByText("Analysis 11")).toBeInTheDocument());
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();

    // Navigate to page 2: server returns 1 item
    await user.click(screen.getByRole("button", { name: /página siguiente/i }));

    await waitFor(() => expect(screen.getByText("Analysis 1")).toBeInTheDocument());
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders an error state when the history query fails", async () => {
    const repository: AnalysisRepository = {
      save: vi.fn(async () => createAnalysis()),
      getAll: vi.fn(async () => {
        throw new Error("Repository unavailable");
      }),
      getById: vi.fn(async () => null),
      update: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);

    render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Repository unavailable/i));
  });

  it("renders saved analyses and returns to the empty state after deleting the last one", async () => {
    const analyses = [createAnalysis()];
    const repository: AnalysisRepository = {
      save: vi.fn(async () => analyses[0]),
      getAll: vi.fn(async () => ({ items: [...analyses], total: analyses.length })),
      getById: vi.fn(async (id) => analyses.find((analysis) => analysis.id === id) ?? null),
      update: vi.fn(async () => null),
      delete: vi.fn(async (id) => {
        const index = analyses.findIndex((analysis) => analysis.id === id);
        if (index >= 0) {
          analyses.splice(index, 1);
        }
      }),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("listitem", { name: /Frontend Engineer/i })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => expect(screen.getByRole("link", { name: /ir al análisis/i })).toBeInTheDocument());
  });

  it("removes the targeted card after deleting a specific analysis", async () => {
    const analyses = [
      createAnalysis(),
      {
        ...createAnalysis(),
        id: "660e8400-e29b-41d4-a716-446655440000",
        createdAt: "2026-04-05T12:25:00.000Z",
        jobDescription: "Platform Engineer\nBuild resilient systems",
        summary: "Another saved analysis for the platform role.",
      },
    ];
    const repository: AnalysisRepository = {
      save: vi.fn(async () => analyses[0]),
      getAll: vi.fn(async () => ({ items: [...analyses], total: analyses.length })),
      getById: vi.fn(async (id) => analyses.find((analysis) => analysis.id === id) ?? null),
      update: vi.fn(async () => null),
      delete: vi.fn(async (id) => {
        const index = analyses.findIndex((analysis) => analysis.id === id);
        if (index >= 0) {
          analyses.splice(index, 1);
        }
      }),
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Wrapper>
          <HistoryFeature repository={repository} />
        </Wrapper>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("listitem", { name: /Frontend Engineer/i })).toBeInTheDocument());

    const cards = container.querySelectorAll("[role='listitem']");
    await user.click(within(cards[0] as HTMLElement).getByRole("button", { name: /eliminar/i }));

    await waitFor(() => expect(screen.getByRole("listitem", { name: /Frontend Engineer/i })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: /Platform Engineer/i })).not.toBeInTheDocument();
    expect(repository.delete).toHaveBeenCalledWith("660e8400-e29b-41d4-a716-446655440000");
  });
});