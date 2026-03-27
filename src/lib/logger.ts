export function logError(route: string, error: unknown, context?: Record<string, unknown>) {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[ERROR] ${route}: ${msg}`, { ...context, stack });
}
