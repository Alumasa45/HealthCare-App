import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/api/users";
import { patientApi, type Patient } from "@/api/patients";
import { User, Key, Shield, Edit3, Save, Eye, EyeOff } from "lucide-react";

// Validation schemas
const passwordChangeSchemaBase = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

const passwordChangeSchema = passwordChangeSchemaBase.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

const accountInfoSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
type AccountInfoForm = z.infer<typeof accountInfoSchema>;

interface ExtendedPatient {
  Patient_id?: number;
  User_id: number;
  First_Name: string;
  Last_Name: string;
  Date_of_Birth?: string;
  dateOfBirth?: string;
  Gender?: "Male" | "Female" | "Other";
  Phone_Number?: string;
  Address_Line_1?: string;
  Address_Line_2?: string;
  City?: string;
  State?: string;
  Postal_Code?: string;
  Country?: string;
  Emergency_Contact_Name?: string;
  Emergency_Contact_Phone?: string;
  Emergency_Contact_Relationship?: string;
  Blood_Group?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  Height?: number;
  Weight?: number;
  Allergies?: string;
  Medical_History?: string;
  Insurance_Provider?: string;
  Insurance_Policy_Number?: string;
  Created_at?: Date;
  Updated_at?: Date;
}

const validateField = (value: any, fieldSchema: z.ZodType) => {
  try {
    fieldSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid input";
    }
    return "Invalid input";
  }
};

export function ProfileManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "account" | "password" | "medical"
  >("account");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch patient data
  const {
    data: patientData,
    isLoading: patientLoading,
    error: patientError,
  } = useQuery({
    queryKey: ["patient", user?.User_id],
    queryFn: () => {
      if (!user?.User_id) {
        throw new Error("User ID is required");
      }
      return patientApi.getByUserId(Number(user.User_id));
    },
    enabled: !!user?.User_id,
    retry: false, // Don't retry if patient doesn't exist
  });

  // Password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: async (data: PasswordChangeForm) => {
      return userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });

  // Account update mutation
  const accountUpdateMutation = useMutation({
    mutationFn: async (data: AccountInfoForm) => {
      if (!user?.User_id) throw new Error("User ID is required");
      return userApi.updateProfile(String(user.User_id), {
        Email: data.email,
        First_Name: data.firstName,
        Last_Name: data.lastName,
      });
    },
    onSuccess: () => {
      toast.success("Account information updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });

  // Medical info update mutation
  const medicalUpdateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ExtendedPatient>;
    }) => patientApi.update(id, data),
    onSuccess: () => {
      toast.success("Medical information updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update medical info: ${error.message}`);
    },
  });

  // Medical info create mutation (for users without patient profiles)
  const medicalCreateMutation = useMutation({
    mutationFn: (data: Omit<Patient, "Patient_id">) => patientApi.create(data),
    onSuccess: () => {
      toast.success("Patient profile created successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create patient profile: ${error.message}`);
    },
  });

  // Password change form
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await passwordChangeMutation.mutateAsync(value);
    },
  });

  // Account info form
  const accountForm = useForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
    onSubmit: async ({ value }) => {
      await accountUpdateMutation.mutateAsync(value);
    },
  });

  // Medical info form
  const medicalForm = useForm({
    defaultValues: {
      Phone_Number: "",
      Address_Line_1: "",
      Address_Line_2: "",
      City: "",
      State: "",
      Postal_Code: "",
      Country: "",
      Emergency_Contact_Name: "",
      Emergency_Contact_Phone: "",
      Emergency_Contact_Relationship: "",
      Blood_Group: "A+" as
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "AB+"
        | "AB-"
        | "O+"
        | "O-",
      Height: 0,
      Weight: 0,
      Allergies: "",
      Medical_History: "",
      Insurance_Provider: "",
      Insurance_Policy_Number: "",
    },
    onSubmit: async ({ value }) => {
      const extendedPatient = patientData as ExtendedPatient;

      if (!extendedPatient?.Patient_id) {
        // Create new patient profile
        if (!user?.User_id) {
          toast.error("User information not available");
          return;
        }

        const newPatientData: Omit<Patient, "Patient_id"> = {
          User_id: user.User_id,
          First_Name: user.First_Name || "",
          Last_Name: user.Last_Name || "",
          Emergency_Contact_Name: value.Emergency_Contact_Name || "",
          Emergency_Contact_Phone: value.Emergency_Contact_Phone || "",
          Emergency_Contact_Relationship:
            value.Emergency_Contact_Relationship || "",
          Blood_Group: value.Blood_Group || "A+",
          Height: value.Height || 0,
          Weight: value.Weight || 0,
          Allergies: value.Allergies || "",
          Medical_History: value.Medical_History || "",
          Insurance_Provider: value.Insurance_Provider || "",
          Insurance_Policy_Number: value.Insurance_Policy_Number || "",
        };

        try {
          await medicalCreateMutation.mutateAsync(newPatientData);
        } catch (error) {
          console.error("Failed to create patient profile:", error);
        }
      } else {
        // Update existing patient profile
        try {
          await medicalUpdateMutation.mutateAsync({
            id: Number(extendedPatient.Patient_id),
            data: value,
          });
        } catch (error) {
          console.error("Failed to update medical info:", error);
        }
      }
    },
  });

  // Initialize account form when user data loads
  useEffect(() => {
    if (user) {
      accountForm.setFieldValue("email", user.Email || "");
      accountForm.setFieldValue("firstName", user.First_Name || "");
      accountForm.setFieldValue("lastName", user.Last_Name || "");
    }
  }, [user, accountForm]);

  // Initialize medical form when patient data loads
  useEffect(() => {
    if (patientData) {
      const extendedPatient = patientData as ExtendedPatient;
      medicalForm.setFieldValue(
        "Phone_Number",
        extendedPatient.Phone_Number || ""
      );
      medicalForm.setFieldValue(
        "Address_Line_1",
        extendedPatient.Address_Line_1 || ""
      );
      medicalForm.setFieldValue(
        "Address_Line_2",
        extendedPatient.Address_Line_2 || ""
      );
      medicalForm.setFieldValue("City", extendedPatient.City || "");
      medicalForm.setFieldValue("State", extendedPatient.State || "");
      medicalForm.setFieldValue(
        "Postal_Code",
        extendedPatient.Postal_Code || ""
      );
      medicalForm.setFieldValue("Country", extendedPatient.Country || "");
      medicalForm.setFieldValue(
        "Emergency_Contact_Name",
        patientData.Emergency_Contact_Name || ""
      );
      medicalForm.setFieldValue(
        "Emergency_Contact_Phone",
        patientData.Emergency_Contact_Phone || ""
      );
      medicalForm.setFieldValue(
        "Emergency_Contact_Relationship",
        patientData.Emergency_Contact_Relationship || ""
      );
      medicalForm.setFieldValue(
        "Blood_Group",
        (patientData.Blood_Group as any) || "A+"
      );
      medicalForm.setFieldValue("Height", patientData.Height || 0);
      medicalForm.setFieldValue("Weight", patientData.Weight || 0);
      medicalForm.setFieldValue("Allergies", extendedPatient.Allergies || "");
      medicalForm.setFieldValue(
        "Medical_History",
        extendedPatient.Medical_History || ""
      );
      medicalForm.setFieldValue(
        "Insurance_Provider",
        extendedPatient.Insurance_Provider || ""
      );
      medicalForm.setFieldValue(
        "Insurance_Policy_Number",
        extendedPatient.Insurance_Policy_Number || ""
      );
    }
  }, [patientData, medicalForm]);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Profile Management
            </h1>
            <p className="mt-2 opacity-90">
              Manage your account settings, security, and medical information
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("account")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "account"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Account Information
                </div>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "password"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Security & Password
                </div>
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "medical"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Medical Information
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "account" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Account Information
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    accountForm.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <accountForm.Field
                      name="firstName"
                      validators={{
                        onChange: ({ value }) =>
                          validateField(
                            value,
                            accountInfoSchema.shape.firstName
                          ),
                      }}
                    >
                      {(field) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-sm text-red-500">
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                        </div>
                      )}
                    </accountForm.Field>

                    <accountForm.Field
                      name="lastName"
                      validators={{
                        onChange: ({ value }) =>
                          validateField(
                            value,
                            accountInfoSchema.shape.lastName
                          ),
                      }}
                    >
                      {(field) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-sm text-red-500">
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                        </div>
                      )}
                    </accountForm.Field>
                  </div>

                  <accountForm.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, accountInfoSchema.shape.email),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500"
                              : "border-gray-300"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </accountForm.Field>

                  <div className="pt-4">
                    <accountForm.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <button
                          type="submit"
                          disabled={
                            !canSubmit || accountUpdateMutation.isPending
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            canSubmit && !accountUpdateMutation.isPending
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-400 cursor-not-allowed text-gray-200"
                          }`}
                        >
                          <Save className="h-4 w-4" />
                          {isSubmitting || accountUpdateMutation.isPending
                            ? "Updating..."
                            : "Update Account"}
                        </button>
                      )}
                    </accountForm.Subscribe>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Security Tips</span>
                  </div>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Use at least 8 characters</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Add numbers and special characters</li>
                    <li>• Don't reuse old passwords</li>
                  </ul>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    passwordForm.handleSubmit();
                  }}
                  className="space-y-4 max-w-md"
                >
                  <passwordForm.Field
                    name="currentPassword"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(
                          value,
                          passwordChangeSchemaBase.shape.currentPassword
                        ),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </passwordForm.Field>

                  <passwordForm.Field
                    name="newPassword"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(
                          value,
                          passwordChangeSchemaBase.shape.newPassword
                        ),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </passwordForm.Field>

                  <passwordForm.Field
                    name="confirmPassword"
                    validators={{
                      onChange: ({ value }) => {
                        const newPassword =
                          passwordForm.getFieldValue("newPassword");
                        if (value !== newPassword) {
                          return "Passwords don't match";
                        }
                        return validateField(
                          value,
                          passwordChangeSchemaBase.shape.confirmPassword
                        );
                      },
                    }}
                  >
                    {(field) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : "border-gray-300"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </passwordForm.Field>

                  <div className="pt-4">
                    <passwordForm.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <button
                          type="submit"
                          disabled={
                            !canSubmit || passwordChangeMutation.isPending
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            canSubmit && !passwordChangeMutation.isPending
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-400 cursor-not-allowed text-gray-200"
                          }`}
                        >
                          <Key className="h-4 w-4" />
                          {isSubmitting || passwordChangeMutation.isPending
                            ? "Changing Password..."
                            : "Change Password"}
                        </button>
                      )}
                    </passwordForm.Subscribe>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "medical" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Medical Information
                </h2>
                {patientLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : patientError && !patientData ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Complete Your Patient Profile
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                      You need to complete your patient profile to place
                      medicine orders and book appointments. Please fill out the
                      information below to create your profile.
                    </p>
                  </div>
                ) : null}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    medicalForm.handleSubmit();
                  }}
                  className="space-y-6"
                >
                  {/* Contact Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <medicalForm.Field name="Phone_Number">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Address_Line_1">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="City">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="State">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                      Medical Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <medicalForm.Field name="Blood_Group">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Blood Group
                            </label>
                            <select
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value as any)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Height">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Height (cm)
                            </label>
                            <input
                              type="number"
                              value={field.state.value || ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              min="1"
                              max="300"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Weight">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              value={field.state.value || ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              min="1"
                              max="500"
                            />
                          </div>
                        )}
                      </medicalForm.Field>
                    </div>

                    <div className="mt-4 space-y-4">
                      <medicalForm.Field name="Allergies">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Allergies
                            </label>
                            <textarea
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="List any known allergies..."
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Medical_History">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Medical History
                            </label>
                            <textarea
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Previous medical conditions, surgeries, etc..."
                            />
                          </div>
                        )}
                      </medicalForm.Field>
                    </div>
                  </div>

                  {/* Emergency Contact & Insurance */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4">
                      Emergency Contact & Insurance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <medicalForm.Field name="Emergency_Contact_Name">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Emergency Contact Name
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Emergency_Contact_Phone">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Emergency Contact Phone
                            </label>
                            <input
                              type="tel"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Insurance_Provider">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Insurance Provider
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>

                      <medicalForm.Field name="Insurance_Policy_Number">
                        {(field) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Policy Number
                            </label>
                            <input
                              type="text"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </medicalForm.Field>
                    </div>
                  </div>

                  <div className="pt-4">
                    <medicalForm.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <button
                          type="submit"
                          disabled={
                            !canSubmit || medicalUpdateMutation.isPending
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            canSubmit && !medicalUpdateMutation.isPending
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-400 cursor-not-allowed text-gray-200"
                          }`}
                        >
                          <Save className="h-4 w-4" />
                          {isSubmitting || medicalUpdateMutation.isPending
                            ? "Updating..."
                            : "Update Medical Information"}
                        </button>
                      )}
                    </medicalForm.Subscribe>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
