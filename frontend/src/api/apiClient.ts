import axios from "axios";

console.log("🔍 Environment Debug:");
console.log("- VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("- All env vars:", import.meta.env);
console.log("- Mode:", import.meta.env.MODE);

const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.MODE === "development";

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (isDevelopment) {
    return "http://localhost:3001";
  }

  return "https://healthcare-app-60pj.onrender.com";
};

const apiBaseUrl = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout for slow Render.com responses.
});

console.log("🌐 API Client configured with base URL:", apiBaseUrl);
console.log("🔧 Environment:", import.meta.env.MODE || "development");
console.log(
  "🔧 VITE_API_URL env var:",
  import.meta.env.VITE_API_URL || "not set"
);

const getCookie = (name: string): string | null => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

apiClient.interceptors.request.use((config) => {
  // Try cookie first, fallback to localStorage.
  const cookieToken = getCookie("authToken");
  const localToken = localStorage.getItem("authToken");
  const token = cookieToken || localToken;

  console.log("🔍 Token Debug:");
  console.log("- Cookie token available:", !!cookieToken);
  console.log("- Local storage token available:", !!localToken);
  console.log("- Final token length:", token?.length || 0);
  console.log(
    "- Token preview:",
    token ? token.substring(0, 20) + "..." : "No token"
  );

  if (token) {
    // Trim any whitespace and ensure it's properly formatted
    const cleanToken = token.trim();
    config.headers.Authorization = `Bearer ${cleanToken}`;
    console.log("✅ Authorization header set with clean token");
    console.log("- Full header:", config.headers.Authorization);
  } else {
    console.log("❌ No token found for request");
  }

  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      console.error("🚫 Authentication failed - clearing tokens");
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Don't redirect automatically - let the component handle it
      console.log(
        "Authentication failed - component should handle login redirect"
      );
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
