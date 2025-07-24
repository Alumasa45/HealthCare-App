export interface Notification {
  Notification_id: number;
  User_id: number;
  Type: "prescription" | "appointment" | "billing" | "general";
  Title: string;
  Message: string;
  Related_id?: number;
  Status: "unread" | "read";
  Created_at: string;
  Updated_at: string;
  user?: {
    User_id: number;
    First_Name: string;
    Last_Name: string;
    Email: string;
  };
}

export interface CreateNotificationRequest {
  User_id: number;
  Type: "prescription" | "appointment" | "billing" | "general";
  Title: string;
  Message: string;
  Related_id?: number;
  Status?: "unread" | "read";
}
