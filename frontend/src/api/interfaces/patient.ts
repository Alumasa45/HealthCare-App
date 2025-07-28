export interface Patient {
  Patient_id?: number;
  User_id: number;
  First_Name: string;
  Last_Name: string;
  Emergency_Contact_Name: string;
  Emergency_Contact_Phone: string;
  Emergency_Contact_Relationship: string;
  Blood_Group: string;
  Height: number;
  Weight: number;
  Allergies?: string;
  Medical_History?: string;
  Insurance_Provider?: string;
  Insurance_Policy_Number?: string;
  Created_at?: Date;
  Updated_at?: Date;
}
