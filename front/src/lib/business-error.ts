import "server-only";

export class BusinessError extends Error {}

// O Drizzle encapsula os erros do PostgreSQL em cause.
export function hasPostgresCode(error: unknown, code: string): boolean {
  const visited = new Set<object>();
  while (typeof error === "object" && error !== null && !visited.has(error)) {
    visited.add(error);
    if ("code" in error && error.code === code) return true;
    error = "cause" in error ? error.cause : undefined;
  }
  return false;
}
