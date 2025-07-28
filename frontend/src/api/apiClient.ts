import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

const getCookie = (name: string): string | null => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

apiClient.interceptors.request.use((config) => {
  // Try cookie first, fallback to localStorage
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
    if (error.response?.status === 401) {
      console.error(
        "🚫 Authentication failed - clearing tokens and redirecting"
      );
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Don't redirect if we're already on auth page
      if (
        !window.location.pathname.includes("/auth") &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
