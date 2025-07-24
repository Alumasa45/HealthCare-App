import axios, { AxiosError } from "axios";

export const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data &&
      typeof axiosError.response.data === "object" &&
      "message" in axiosError.response.data
        ? (axiosError.response.data as { message?: string }).message
        : undefined) ||
      axiosError.message ||
      "Request failed";
    const status = axiosError.response?.status || "Unknown";
    return new Error(`Request failed (Status: ${status}): ${message}`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("An unexpected error occurred");
};

export const createErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data &&
      typeof axiosError.response.data === "object" &&
      "message" in axiosError.response.data
        ? (axiosError.response.data as { message?: string }).message
        : undefined) ||
      axiosError.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};
