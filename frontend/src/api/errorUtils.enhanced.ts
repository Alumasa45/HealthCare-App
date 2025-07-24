
import axios, { AxiosError } from "axios";

const isValidError = (error: unknown): error is Error => {
  return error instanceof Error && typeof error.message === "string";
};

const isValidAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error) && error !== null && error !== undefined;
};

// Safe string extraction with fallback.
const safeStringExtraction = (
  data: unknown,
  fallback: string = "Unknown error"
): string => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
};


export const handleApiError = (error: unknown): Error => {
  try {
    if (isValidAxiosError(error)) {
      const axiosError = error as AxiosError;

      let message = "Request failed";

      if (axiosError.response?.data) {
        message = safeStringExtraction(
          axiosError.response.data,
          axiosError.message || message
        );
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      const status = axiosError.response?.status || "Unknown";
      return new Error(`Request failed (Status: ${status}): ${message}`);
    }

    if (isValidError(error)) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    if (error === null || error === undefined) {
      return new Error("An unexpected null or undefined error occurred");
    }

    return new Error(`An unexpected error occurred: ${String(error)}`);
  } catch (processingError) {
    console.error("Error while processing error:", processingError);
    return new Error("An error occurred while processing the original error");
  }
};

export const createErrorMessage = (error: unknown): string => {
  try {

    if (isValidAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.data) {
        return safeStringExtraction(
          axiosError.response.data,
          axiosError.message || "Request failed"
        );
      }

      return axiosError.message || "Request failed";
    }

    if (isValidError(error)) {
      return error.message || "An error occurred";
    }

    if (typeof error === "string") {
      return error;
    }

    if (error === null || error === undefined) {
      return "An unexpected error occurred";
    }

    if (typeof error === "object") {
      try {
        return JSON.stringify(error);
      } catch {
        return "An object error occurred";
      }
    }

    return String(error) || "An unexpected error occurred";
  } catch (processingError) {
    console.error("Error while creating error message:", processingError);
    return "An error occurred while processing the error message";
  }
};

export const isApiError = (error: unknown): error is AxiosError => {
  return isValidAxiosError(error);
};

export const validateError = (error: unknown): Error | AxiosError | null => {
  if (isValidAxiosError(error) || isValidError(error)) {
    return error;
  }
  return null;
};

export const createSafeError = (
  message: string = "An error occurred",
  statusCode?: number
): Error => {
  try {
    const errorMessage =
      typeof message === "string" ? message : "Invalid error message";
    const error = new Error(errorMessage);

    if (statusCode && typeof statusCode === "number") {
      (error as any).statusCode = statusCode;
    }

    return error;
  } catch {
    return new Error("Failed to create error object");
  }
};

export default {
  handleApiError,
  createErrorMessage,
  isApiError,
  validateError,
  createSafeError,
};
