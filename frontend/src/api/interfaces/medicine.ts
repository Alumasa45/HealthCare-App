export enum Strength {
  Very_Strong = "Very Strong",
  Average = "Average",
}

export interface Medicine {
  Medicine_id?: number;
  Medicine_Name: string;
  Brand_Name: string;
  Manufacturer: string;
  Category: string;
  Dosage: string;
  Strength: Strength;
  Description: string;
  Side_Effects: string;
  Storage_Instructions: string;
  Image_url?: string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
}

export interface CreateMedicineDto {
  Medicine_Name: string;
  Brand_Name: string;
  Manufacturer: string;
  Category: string;
  Dosage: string;
  Strength: Strength;
  Description: string;
  Side_Effects: string;
  Storage_Instructions: string;
  Image_url?: string;
}
