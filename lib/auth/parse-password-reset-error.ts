export type PasswordResetClientErrorCode =
  | "invalid_email"
  | "rate_limited"
  | "redirect_not_allowed"
  | "failed";

export function parsePasswordResetClientError(
  message: string,
): PasswordResetClientErrorCode {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "rate_limited";
  }

  if (
    normalized.includes("redirect") &&
    (normalized.includes("not allowed") || normalized.includes("invalid"))
  ) {
    return "redirect_not_allowed";
  }

  if (normalized.includes("invalid email")) {
    return "invalid_email";
  }

  return "failed";
}
