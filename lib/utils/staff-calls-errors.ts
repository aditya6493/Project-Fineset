import { ApiError } from "@/types";
import type { Content } from "@/content/en";

type StaffCallsCopy = Content["staff"]["calls"];

export function getStaffCallsErrorMessage(
  error: unknown,
  copy: StaffCallsCopy,
): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return copy.loadErrorUnauthorized;
    }
    if (error.status === 503) {
      return copy.loadErrorUnavailable;
    }
  }

  return copy.loadErrorGeneric;
}
