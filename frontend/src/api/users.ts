import apiClient from "./apiClient";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "./interfaces/user";

export const userApi = {
  create: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/users", userData);
      return response.data;
    } catch (error) {
      console.log("Error registering user", error);
      throw new Error("Error registering user");
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/users/login",
      credentials
    );
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/");
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    userId: string,
    updates: Partial<User>
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${userId}`, updates);
    return response.data;
  },

  // Delete user account
  deleteAccount: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // Get user by ID (for admin purposes)
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  // List all users (for admin purposes)
  listUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  // List all users publicly (without authentication, limited data)
  listUsersPublic: async (): Promise<Partial<User>[]> => {
    const response = await apiClient.get<Partial<User>[]>("/users/public");
    return response.data;
  },
};
