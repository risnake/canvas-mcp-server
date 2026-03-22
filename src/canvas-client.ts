/**
 * Canvas LMS API HTTP client wrapper.
 *
 * Reads configuration from environment variables:
 *   CANVAS_API_TOKEN  – Bearer token for authentication
 *   CANVAS_BASE_URL   – Canvas instance URL (default: https://houstonisd.instructure.com)
 */

const DEFAULT_BASE_URL = "https://houstonisd.instructure.com";
const DEFAULT_MAX_PAGES = 10;

export class CanvasApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
    public readonly path: string,
  ) {
    super(
      `Canvas API error ${status} (${statusText}) for ${path}: ${body}`,
    );
    this.name = "CanvasApiError";
  }
}

export class CanvasClient {
  public readonly baseUrl: string;
  private readonly token: string;

  /**
   * @param baseUrl - Canvas instance URL. Falls back to CANVAS_BASE_URL env var,
   *                  then to the default (https://houstonisd.instructure.com).
   * @param token   - API bearer token. Falls back to CANVAS_API_TOKEN env var.
   */
  constructor(baseUrl?: string, token?: string) {
    const resolvedToken = token ?? process.env.CANVAS_API_TOKEN;
    if (!resolvedToken) {
      throw new Error(
        "Canvas API token is required. Provide it via the constructor or set the CANVAS_API_TOKEN environment variable.",
      );
    }
    this.token = resolvedToken;

    const resolvedBase =
      baseUrl ?? process.env.CANVAS_BASE_URL ?? DEFAULT_BASE_URL;
    // Strip any trailing slash so we get a clean join with /api/v1
    this.baseUrl = `${resolvedBase.replace(/\/+$/, "")}/api/v1`;
  }

  // ---------------------------------------------------------------------------
  // Public HTTP helpers
  // ---------------------------------------------------------------------------

  /**
   * Perform a GET request.
   *
   * @param path   - API path relative to /api/v1 (e.g. "/courses").
   * @param params - Optional query parameters. `undefined` values are filtered out.
   */
  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(path, { method: "GET" }, params);
  }

  /**
   * Perform a POST request.
   *
   * @param path - API path relative to /api/v1.
   * @param body - Optional JSON-serialisable request body.
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Perform a PUT request.
   *
   * @param path - API path relative to /api/v1.
   * @param body - Optional JSON-serialisable request body.
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Perform a DELETE request.
   *
   * @param path - API path relative to /api/v1.
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  /**
   * Perform a paginated GET request, following `Link: <…>; rel="next"` headers.
   *
   * Results from every page are concatenated into a single flat array.
   *
   * @param path     - API path relative to /api/v1.
   * @param params   - Optional query parameters for the first request.
   * @param maxPages - Safety cap on the number of pages to fetch (default 10).
   */
  async getPaginated<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    maxPages: number = DEFAULT_MAX_PAGES,
  ): Promise<T[]> {
    const results: T[] = [];
    let url: string | null = this.buildUrl(path, params);
    let page = 0;

    while (url && page < maxPages) {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const body = await this.safeReadBody(response);
        throw new CanvasApiError(
          response.status,
          response.statusText,
          body,
          url,
        );
      }

      const data = (await response.json()) as T[];
      results.push(...data);

      url = this.parseNextLink(response.headers.get("link"));
      page++;
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Return the standard authorisation and content-type headers.
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Core request method shared by all public HTTP helpers.
   */
  private async request<T>(
    path: string,
    options: RequestInit,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const body = await this.safeReadBody(response);
      throw new CanvasApiError(
        response.status,
        response.statusText,
        body,
        path,
      );
    }

    // Handle empty responses (e.g. 204 No Content)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  /**
   * Build a fully-qualified URL from a relative path and optional query params.
   * `undefined` parameter values are silently dropped.
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Parse the RFC 5988 `Link` header and return the URL for `rel="next"`,
   * or `null` if there is no next page.
   *
   * Example header value:
   *   <https://…/api/v1/courses?page=2&per_page=10>; rel="next",
   *   <https://…/api/v1/courses?page=5&per_page=10>; rel="last"
   */
  private parseNextLink(linkHeader: string | null): string | null {
    if (!linkHeader) {
      return null;
    }

    const links = linkHeader.split(",");
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Safely read the response body as text, returning an empty string on failure.
   * Used inside error paths where the body may already have been consumed or be
   * unreadable.
   */
  private async safeReadBody(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch {
      return "";
    }
  }
}
