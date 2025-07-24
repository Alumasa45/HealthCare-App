export interface DoctorSchedule {
    Schedule_id: number;
    User_id: number;
    Doctor_id: number;
    Day_Of_The_Week: string;
    Start_Time: string;
    End_Time: string;
    Slot_Duration: number;
    Is_Active: boolean;
    Created_at?: Date | string;
    Updated_at?: Date | string;
}