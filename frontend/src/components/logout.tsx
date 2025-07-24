import { BadgeCheck, ChevronsUpDown, LogOut, User as UserIcon, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { patientApi, type Patient } from "@/api/patients";

export function NavUser() {
  const isMobile = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  
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
    navigate({ to: '/', replace: true });
  };
  
  const handleProfileClick = () => {
    navigate({ to: "/settings" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-foreground">
                  {user ? `${user.First_Name?.split("")[0]}${user.Last_Name?.split("")[0]}` : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user ? `${user.First_Name} ${user.Last_Name}` : 'User'}</span>
                <span className="truncate text-xs">{user?.Email || 'No email'}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-foreground">
                  {user ? `${user.First_Name?.split("")[0]}${user.Last_Name?.split("")[0]}` : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user ? `${user.First_Name} ${user.Last_Name}` : 'User'}</span>
                <span className="truncate text-xs">{user?.Email || 'No email'}</span>
              </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {user?.User_Type === "Patient" && patientData && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled className="opacity-70">
                    <div className="flex flex-col w-full">
                      <span className="font-medium">Patient Information</span>
                      <span className="text-xs">Blood Type: {patientData.Blood_Type || "Not set"}</span>
                      {patientData.Insurance_Provider && (
                        <span className="text-xs">Insurance: {patientData.Insurance_Provider}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfileClick}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProfileClick}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}