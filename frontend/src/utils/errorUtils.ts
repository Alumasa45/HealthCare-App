//import { ErrorResponse } from '../api/interfaces/api';

export function handleApiError(error: unknown): never {
  if (isApiError(error)) {
    // Handle Axios errors
    if (error.response?.status) {
      // Server responded with error status
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Request failed";
      throw new Error(`${message} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("No response from server. Please check your connection.");
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    throw error;
  }

  // Handle string errors
  if (typeof error === "string") {
    throw new Error(error);
  }

  // Fallback for unknown error types
  throw new Error("An unknown error occurred");
}

export function createErrorMessage(prefix: string, error: unknown): string {
  try {
    if (isApiError(error)) {
      if (error.response) {
        return `${prefix}: ${
          error.response.data?.message || "Request failed"
        } (Status: ${error.response.status})`;
      }
      return `${prefix}: ${error.message || "Network error"}`;
    }
    if (error instanceof Error) {
      return `${prefix}: ${error.message}`;
    }
    return `${prefix}: Unknown error occurred`;
  } catch {
    return `${prefix}: Unknown error occurred`;
  }
}

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  request?: {
    message?: string;
  };
  message?: string;
};

export function getErrorMessage(error: unknown): string {
  let message: string;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (isApiError(error)) {
    message = error.response?.data?.message || error.message || "Unknown error";
  } else {
    message = "An unknown error occurred";
  }

  return message;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
}
