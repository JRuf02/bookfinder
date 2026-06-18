/** Uniform type for handling API responses in the frontend */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Type for responses from the manual add flow. Uses ternary status instead of a boolean. */
// Use T to be able to use this type for books now, but also for shelves in the future
export type ManualAddResponse<T> =
  | {
      status: "error";
      message: string;
    }
  | {
      status: "warning";
      message: string;
      data: T;
    }
  | {
      status: "success";
      data: T;
    };

/** Extract data from Result, throw an error if ok is false. */
export function unwrapResult<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data as T;
}
