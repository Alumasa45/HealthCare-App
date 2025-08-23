import { createFileRoute, redirect } from "@tanstack/react-router";
import { DoctorSlotManagement } from "@/components/DoctorSlotManagement";
import { DoctorAppointmentManagement } from "@/components/DoctorAppointmentManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function DoctorSlotsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // If not logged in or not a doctor, this should be handled by the route guard
  if (!user || user.User_Type !== "Doctor") {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Access denied. Doctor login required.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Doctor Appointment Management</h1>

      <Tabs defaultValue="appointments" className="mb-8">
        <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Manage Appointments
          </TabsTrigger>
          <TabsTrigger
            value="slots"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Manage Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <DoctorAppointmentManagement />
        </TabsContent>

        <TabsContent value="slots">
          <DoctorSlotManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/_layout/doctorSlots")({
  beforeLoad: () => {
    // Add authentication check here
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      throw redirect({
        to: "/login",
      });
    }

    try {
      const user = JSON.parse(userData);
      if (!user || user.User_Type !== "Doctor") {
        throw redirect({
          to: "/dashboard",
        });
      }
    } catch {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: DoctorSlotsLayout,
});
