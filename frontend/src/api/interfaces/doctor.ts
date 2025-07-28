export interface Doctors {
  Doctor_id?: number;
  User_id: number;
  License_number: string;
  Specialization: string;
  Qualification: string;
  Experience_Years: number;
  Department: string;
  Bio: string;
  Languages_Spoken: string;
  Is_Available_Online: boolean;
  Rating: number;
  Reviews: string;
  Created_at?: Date;
  Updated_at?: Date;
}

export interface DoctorInfo {
  // User fields required by backend
  Email: string;
  Password: string;
  Phone_Number: string;
  First_Name: string;
  Last_Name: string;
  Date_of_Birth: string;
  Gender: "Male" | "Female" | "Other";

  // Doctor-specific fields
  Doctor_id?: number;
  License_number: string;
  Specialization: string;
  Qualification: string;
  Experience_Years: number;
  Department: string;
  Bio: string;
  Languages_Spoken: string;
  Is_Available_Online: boolean;
  Rating: number;
  Reviews: string;
}

export interface LoginResponse {
  token: string;
  user: {
    User_id: number;
    Email: string;
    First_Name: string;
    Last_Name: string;
    User_Type: "Doctor" | "Patient" | "Admin" | "Pharmacist";
  };
  doctor: {
    Doctor_id: number;
    License_Number: string;
  };
}
