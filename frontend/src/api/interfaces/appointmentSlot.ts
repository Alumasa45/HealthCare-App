export interface Slots {
    Slot_id: number;
    Appointment_id: number;
    Doctor_id: number;
    Slot_Date: Date | string;
    Slot_Time: Date | string;
    Is_Available: boolean;
    Is_Blocked: boolean;
    Created_at?: Date | string;
    Updated_at?: Date | string;
}

export interface SlotInfo {
    Appointment_id: number;
    Doctor_id: number;
    Slot_Date: Date | string;
    Slot_Time: Date | string;
    Is_Available: boolean;
    Is_Blocked: boolean;
}