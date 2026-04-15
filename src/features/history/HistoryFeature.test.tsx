import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnalysisRepository } from "../../lib/repositories";
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

function createAnalysis() {
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
      getAll: vi.fn(async () => []),
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
    const repository: AnalysisRepository = {
      save: vi.fn(async () => createAnalysis()),
      getAll: vi.fn(async () => [
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
      ]),
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
      getAll: vi.fn(async () => [...analyses]),
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
      getAll: vi.fn(async () => [...analyses]),
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