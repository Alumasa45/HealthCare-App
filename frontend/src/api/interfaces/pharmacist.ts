

export interface Pharmacist {
    Pharmacy_id: number;
    User_id: number;
    Pharmacy_Name: string;
    License_Number: string;
    Phone_Number: string;
    Email: string;
    Opening_Time: string;
    Closing_Time: string;
    Delivery_Available: boolean;
    Is_Verified: boolean;
    Rating: number;
    Created_at: Date;
    Updated_at: Date;
};

export interface PharmacistLoginCredentials {
    License_Number: string;
}

export interface Pharmacist extends PharmacistLoginCredentials {
    User_id: number;
    Pharmacy_Name: string;
    License_Number: string;
    Phone_Number: string;
    Email: string;
    Opening_Time: string;
    Closing_Time: string;
    Delivery_Available: boolean;
    Is_Verified: boolean;
    Rating: number;
};

export interface PharmLoginResponse {
    token: string;
    user: {
        User_id: number;
        Email: string;
        First_Name: string;
        Last_Name: string;
        User_Type:  'Pharmacist' | 'Patient' | 'Admin' | 'Doctor'
    };
    pharmacist: {
        Pharmacist_id: number;
        License_Number: string;
    }
    doctor: {
        Doctor_id: number;
        License_number: string;
    }
};