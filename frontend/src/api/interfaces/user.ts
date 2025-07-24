import type { Doctors } from "./doctor";

export interface User {
  User_id: number;
  Email: string;
  Password: string;
  Phone_Number: string;
  User_Type: "Patient" | "Doctor" | "Pharmacist" | "Admin";
  First_Name: string;
  Last_Name: string;
  Date_of_Birth: string;
  Gender: "Male" | "Female" | "Other";
  Account_Status: "Active" | "InActive";
  Created_at: Date;
  Doctor_id?: number; // Optional because not all users are doctors
}

export interface Userr_Type {
  User_Type: "Patient" | "Doctor" | "Pharmacist" | "Admin";
}

export interface LoginCredentials {
  Email?: string;
  Password?: string;
  License_number?: string;
}

export interface RegisterData extends LoginCredentials {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Password: string;
  Phone_Number: string;
  Date_of_Birth: string;
  Gender: "Male" | "Female" | "Other";
}

export interface AuthResponse {
  token: string;
  user: User;
  doctor: Doctors;
}
