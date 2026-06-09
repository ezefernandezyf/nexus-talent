export interface GitHubRepositoryLanguage {
  bytes: number;
  name: string;
}

export interface GitHubRepositoryMetadata {
  description: string;
  fullName: string;
  languages: GitHubRepositoryLanguage[];
  name: string;
  owner: string;
  primaryLanguage: string | null;
  repositoryUrl: string;
  topics: string[];
  warnings: string[];
}

export interface GitHubClient {
  lookupRepository(repositoryUrl: string): Promise<GitHubRepositoryMetadata>;
}

interface CreateGitHubClientOptions {
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

interface GitHubRepositoryReference {
  owner: string;
  repository: string;
  repositoryUrl: string;
}

class GitHubClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GitHubClientError";
    this.status = status;
  }
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    clear() {
      clearTimeout(timeoutId);
    },
  };
}

function normalizeRepositoryUrl(repositoryUrl: string) {
  return repositoryUrl.trim().replace(/\.git$/i, "").replace(/\/+$/g, "");
}

function parseGitHubRepositoryReference(repositoryUrl: string): GitHubRepositoryReference {
  const trimmedUrl = normalizeRepositoryUrl(repositoryUrl);

  if (trimmedUrl.length === 0) {
    throw new GitHubClientError("La URL de GitHub es obligatoria.");
  }

  const asUrl = trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
    ? new URL(trimmedUrl)
    : new URL(`https://${trimmedUrl}`);

  if (asUrl.hostname !== "github.com" && !asUrl.hostname.endsWith(".github.com")) {
    throw new GitHubClientError("La URL debe apuntar a github.com.");
  }

  const segments = asUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new GitHubClientError("La URL de GitHub debe incluir owner y repository.");
  }

  const owner = segments[0];
  const repository = segments[1];

  return {
    owner,
    repository,
    repositoryUrl: `https://github.com/${owner}/${repository}`,
  };
}

function normalizeLanguageEntries(payload: unknown): GitHubRepositoryLanguage[] {
  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  if ("__warning" in payload) {
    return [];
  }

  return Object.entries(payload as Record<string, unknown>)
    .map(([name, bytes]) => ({
      name,
      bytes: typeof bytes === "number" ? bytes : 0,
    }))
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 8);
}

async function fetchJson(fetchImpl: typeof globalThis.fetch, url: string, timeoutMs: number) {
  const { controller, clear } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new GitHubClientError(`GitHub respondió con ${response.status}.`, response.status);
    }

    return response.json() as Promise<unknown>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GitHubClientError("La consulta a GitHub superó el tiempo de espera.");
    }

    if (error instanceof GitHubClientError) {
      throw error;
    }

    throw new GitHubClientError("No se pudo leer GitHub.");
  } finally {
    clear();
  }
}

export function createGitHubClient(options: CreateGitHubClientOptions = {}): GitHubClient {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 5_000;

  return {
    async lookupRepository(repositoryUrl: string) {
      if (typeof fetchImpl !== "function") {
        throw new GitHubClientError("El entorno no soporta fetch.");
      }

      const reference = parseGitHubRepositoryReference(repositoryUrl);
      const repositoryEndpoint = `https://api.github.com/repos/${reference.owner}/${reference.repository}`;
      const languagesEndpoint = `${repositoryEndpoint}/languages`;

      const repositoryResponse = await fetchJson(fetchImpl, repositoryEndpoint, timeoutMs) as Record<string, unknown>;
      const languagesResponsePromise = fetchJson(fetchImpl, languagesEndpoint, timeoutMs)
        .catch(() => ({ __warning: "No se pudo leer el detalle de lenguajes de GitHub." }));
      const languagesResponse = await languagesResponsePromise;

      const owner = typeof repositoryResponse.owner === "object" && repositoryResponse.owner !== null && "login" in repositoryResponse.owner
        ? String((repositoryResponse.owner as { login?: unknown }).login ?? reference.owner)
        : reference.owner;

      const name = typeof repositoryResponse.name === "string" ? repositoryResponse.name : reference.repository;
      const fullName = typeof repositoryResponse.full_name === "string" ? repositoryResponse.full_name : `${owner}/${name}`;
      const description = typeof repositoryResponse.description === "string" ? repositoryResponse.description.trim() : "";
      const primaryLanguage = typeof repositoryResponse.language === "string" && repositoryResponse.language.trim().length > 0
        ? repositoryResponse.language.trim()
        : null;
      const topics = Array.isArray(repositoryResponse.topics)
        ? repositoryResponse.topics.filter((topic): topic is string => typeof topic === "string").map((topic) => topic.trim()).filter(Boolean)
        : [];

      const warnings = typeof languagesResponse === "object" && languagesResponse !== null && "__warning" in languagesResponse
        ? [String((languagesResponse as { __warning?: unknown }).__warning ?? "No se pudo leer el detalle de lenguajes de GitHub.")]
        : [];

      return {
        description,
        fullName,
        languages: normalizeLanguageEntries(typeof languagesResponse === "object" && languagesResponse !== null && !Array.isArray(languagesResponse) ? languagesResponse : {}),
        name,
        owner,
        primaryLanguage,
        repositoryUrl: reference.repositoryUrl,
        topics,
        warnings,
      } satisfies GitHubRepositoryMetadata;
    },
  };
}

export { GitHubClientError, parseGitHubRepositoryReference };