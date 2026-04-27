type HttpMethod = "GET" | "POST";

export class SocialApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "SocialApiError";
  }
}

interface JsonRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function requestJson<T>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const method = options.method ?? "GET";

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error_description" in data &&
          typeof data.error_description === "string"
            ? data.error_description
            : `HTTP ${response.status}`;

        if (attempt < retries && shouldRetry(response.status)) {
          attempt += 1;
          await sleep(250 * attempt);
          continue;
        }
        throw new SocialApiError(message, response.status, data);
      }

      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        attempt += 1;
        await sleep(250 * attempt);
        continue;
      }
      if (error instanceof SocialApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new SocialApiError("Request timeout");
      }
      throw new SocialApiError(
        error instanceof Error ? error.message : "Unknown request error"
      );
    } finally {
      clearTimeout(timer);
    }
  }

  throw new SocialApiError(
    lastError instanceof Error ? lastError.message : "Request failed"
  );
}
