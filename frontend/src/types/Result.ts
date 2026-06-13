// Uniform type for API responses
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// We use T so that we can use this type for books now, but also for shelves in the future
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
