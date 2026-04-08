type ErrorWithMessage = {
  message?: string;
};

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const msg = (error as ErrorWithMessage).message;
    return typeof msg === "string" && msg.trim() ? msg : fallback;
  }
  return fallback;
}
