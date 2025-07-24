

export interface MedicalRecords {
    Record_id: number;
    Patient_id: number;
    Doctor_id: number;
    Visit_Date: Date;
    Diagnosis: string;
    Symptoms: string;
    Treatment_Plan: string;
    Notes: string;
    Follow_up_Required: boolean;
    Follow_Up_Date: Date;
    Created_at: Date;
    Updated_at: Date;
}

export interface RecordInfo {
    Patient_id: number;
    Doctor_id: number;
    Visit_Date: Date;
    Diagnosis: string;
    Symptoms: string;
    Treatment_Plan: string;
    Notes: string;
    Follow_up_Required: boolean;
    Follow_Up_Date: Date;
}