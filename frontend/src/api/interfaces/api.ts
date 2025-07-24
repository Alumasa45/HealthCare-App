interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  request?: any;
  message?: string;
  config?: any;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'request' in error || 'message' in error)
  );
}