import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { patientApi, type Patient } from "@/api/patients";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function AccountDropdown() {
  const { user, logout } = useAuth();
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      if (user?.User_id && user.User_Type === "Patient") {
        try {
          setLoading(true);
          const data = await patientApi.getByUserId(user.User_id);
          setPatientData(data);
        } catch (error) {
          console.error("Error fetching patient data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientData();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const handleProfileClick = () => {
    navigate({ to: "/settings" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-purple-700">
            {user?.First_Name?.[0] || user?.Email?.[0] || "U"}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.First_Name} {user?.Last_Name}</span>
            <span className="text-xs text-gray-500">{user?.Email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user?.User_Type === "Patient" && patientData && (
          <>
            <DropdownMenuItem disabled className="text-xs">
              <div className="flex flex-col">
                <span>Blood Type: {patientData.Blood_Type || "Not set"}</span>
                {patientData.Insurance_Provider && (
                  <span>Insurance: {patientData.Insurance_Provider}</span>
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleProfileClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}