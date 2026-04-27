import { randomUUID } from "crypto";

export function getRequestId(req: Request): string {
  const existing = req.headers.get("x-request-id");
  return existing && existing.trim().length > 0 ? existing : randomUUID();
}

export function withRequestHeaders(
  payload: unknown,
  requestId: string,
  init?: ResponseInit
): Response {
  const response = Response.json(payload, init);
  response.headers.set("x-request-id", requestId);
  return response;
}
