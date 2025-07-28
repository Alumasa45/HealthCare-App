import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface User {
  User_id: number;
  Doctor_id?: number;
  Slot_id?: number;
  Appointment_id?: number;
  Email: string;
  User_Type: "Patient" | "Doctor" | "Pharmacist" | "Admin";
  First_Name: string;
  Last_Name: string;
}

interface AuthContextType {
  user: User | null;
  doctor?: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

const deleteCookie = (name: string) => {
  setCookie(name, "", -1);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("authToken");
    const userData = getCookie("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from cookie:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    // Clean the token to remove any extra whitespace or characters
    const cleanToken = token.trim();
    console.log("🔍 Login token debug:");
    console.log("- Original token length:", token.length);
    console.log("- Clean token length:", cleanToken.length);
    console.log("- Token preview:", cleanToken.substring(0, 20) + "...");

    setCookie("authToken", cleanToken);
    setCookie("userData", JSON.stringify(userData));
    setUser(userData);
    localStorage.setItem("authToken", cleanToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  const logout = () => {
    // Clear cookies
    deleteCookie("authToken");
    deleteCookie("userData");

    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentDoctor");
    localStorage.removeItem("patientData");
    localStorage.removeItem("doctorData");
    localStorage.removeItem("chatData");
    localStorage.removeItem("conversationData");
    localStorage.removeItem("messagesData");

    // Clear sessionStorage
    sessionStorage.clear();

    // Reset state
    setUser(null);

    // Clear any cached API data
    if (typeof window !== "undefined") {
      // Clear any IndexedDB or other storage if used
      try {
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              if (name.includes("healthcare") || name.includes("api")) {
                caches.delete(name);
              }
            });
          });
        }
      } catch (error) {
        console.warn("Error clearing caches:", error);
      }
    }

    console.log("🔐 Complete logout performed - all data cleared");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
