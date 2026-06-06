export type PasswordResetClientErrorCode =
  | "invalid_email"
  | "rate_limited"
  | "redirect_not_allowed"
  | "failed";

type PasswordResetErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

function readErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "";

  const message = (error as PasswordResetErrorLike).message;
  return typeof message === "string" ? message : "";
}

function readErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "";

  const code = (error as PasswordResetErrorLike).code;
  return typeof code === "string" ? code : "";
}

function readErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const status = (error as PasswordResetErrorLike).status;
  return typeof status === "number" ? status : undefined;
}

export function parsePasswordResetClientError(
  error: unknown,
): PasswordResetClientErrorCode {
  const normalized = readErrorMessage(error).toLowerCase();
  const code = readErrorCode(error).toLowerCase();
  const status = readErrorStatus(error);

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    normalized.includes("rate limit") ||
    normalized.includes("too many") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
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
