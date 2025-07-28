import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { patientApi, type Patient } from "@/api/patients";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_layout/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (user?.User_id && user.User_Type === "Patient") {
        try {
          setLoading(true);
          const data = await patientApi.getByUserId(user.User_id);
          setPatientData(data);
        } catch (error) {
          console.error("Error fetching patient data:", error);
          toast.error("Failed to load patient information");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (patientData) {
      setPatientData({
        ...patientData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!patientData || !patientData.Patient_id) return;

    try {
      setSaving(true);
      await patientApi.update(patientData.Patient_id, patientData);
      toast.success("Patient information updated successfully");
    } catch (error) {
      console.error("Error updating patient data:", error);
      toast.error("Failed to update patient information");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Profile
          </TabsTrigger>
          {user?.User_Type === "Patient" && (
            <TabsTrigger
              value="medical"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
            >
              Medical Information
            </TabsTrigger>
          )}
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <Input
                    id="firstName"
                    value={user?.First_Name || ""}
                    disabled
                  />
                </div>
                <div>
                  <FormLabel htmlFor="lastName">Last Name</FormLabel>
                  <Input id="lastName" value={user?.Last_Name || ""} disabled />
                </div>
                <div>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input id="email" value={user?.Email || ""} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.User_Type === "Patient" && (
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Update your medical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    Loading patient data...
                  </div>
                ) : patientData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel htmlFor="Blood_Group">Blood Type</FormLabel>
                      <Input
                        id="Blood_Group"
                        name="Blood_Group"
                        value={patientData.Blood_Group || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="Allergies">Allergies</FormLabel>
                      <Input
                        id="Allergies"
                        name="Allergies"
                        value={patientData.Allergies || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="Height">Height (cm)</FormLabel>
                      <Input
                        id="Height"
                        name="Height"
                        type="number"
                        value={patientData.Height || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="Weight">Weight (kg)</FormLabel>
                      <Input
                        id="Weight"
                        name="Weight"
                        type="number"
                        value={patientData.Weight || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="Insurance_Provider">
                        Insurance Provider
                      </FormLabel>
                      <Input
                        id="Insurance_Provider"
                        name="Insurance_Provider"
                        value={patientData.Insurance_Provider || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="Insurance_Policy_Number">
                        Policy Number
                      </FormLabel>
                      <Input
                        id="Insurance_Policy_Number"
                        name="Insurance_Policy_Number"
                        value={patientData.Insurance_Policy_Number || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormLabel htmlFor="Emergency_Contact_Name">
                        Emergency Contact Name
                      </FormLabel>
                      <Input
                        id="Emergency_Contact_Name"
                        name="Emergency_Contact_Name"
                        value={patientData.Emergency_Contact_Name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormLabel htmlFor="Emergency_Contact_Phone">
                        Emergency Contact Phone
                      </FormLabel>
                      <Input
                        id="Emergency_Contact_Phone"
                        name="Emergency_Contact_Phone"
                        value={patientData.Emergency_Contact_Phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    No patient data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormLabel htmlFor="currentPassword">
                    Current Password
                  </FormLabel>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <FormLabel htmlFor="newPassword">New Password</FormLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <FormLabel htmlFor="confirmPassword">
                    Confirm New Password
                  </FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
