import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patientApi } from "@/api/patients";

// Validation schema for patient profile.
const patientProfileSchema = z.object({
  // Personal Information
  First_Name: z.string().min(2, "First name must be at least 2 characters"),
  Last_Name: z.string().min(2, "Last name must be at least 2 characters"),
  Date_of_Birth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  Gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  Phone_Number: z.string().min(10, "Phone number must be at least 10 digits"),

  // Address Information
  Address_Line_1: z.string().min(5, "Address is required"),
  Address_Line_2: z.string().optional().or(z.literal("")),
  City: z.string().min(2, "City is required"),
  State: z.string().min(2, "State is required"),
  Postal_Code: z.string().min(3, "Postal code is required"),
  Country: z.string().min(2, "Country is required"),

  // Emergency Contact
  Emergency_Contact_Name: z
    .string()
    .min(2, "Emergency contact name is required"),
  Emergency_Contact_Phone: z
    .string()
    .min(10, "Emergency contact phone is required"),
  Emergency_Contact_Relationship: z.string().min(2, "Relationship is required"),

  // Medical Information
  Blood_Group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Please select a blood group" }),
  }),
  Height: z
    .number()
    .min(1, "Height must be greater than 0")
    .max(300, "Invalid height"),
  Weight: z
    .number()
    .min(1, "Weight must be greater than 0")
    .max(500, "Invalid weight"),
});

// Extended Patient interface to match your backend structure
interface ExtendedPatient {
  Patient_id?: number;
  User_id: number;
  First_Name: string;
  Last_Name: string;
  Date_of_Birth?: string;
  dateOfBirth?: string; // Alternative field name
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

function Settings() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get current user and patient data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);

      if (user.Patient) {
        setCurrentPatient(user.Patient);
      }
    }
  }, []);

  //new patient data.
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["patient", currentPatient?.User_id],
    queryFn: () => {
      if (!currentPatient?.User_id) {
        throw new Error("User ID is required");
      }
      return patientApi.getByUserId(Number(currentPatient.User_id));
    },
    enabled: !!currentPatient?.User_id,
  });

  // Mutation for updating patient profile
  const updatePatientMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ExtendedPatient>;
    }) => patientApi.update(id, data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const form = useForm({
    defaultValues: {
      First_Name: "",
      Last_Name: "",
      Date_of_Birth: "",
      Gender: "Male" as "Male" | "Female" | "Other",
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
    },
    onSubmit: async ({ value }) => {
      if (!currentPatient?.Patient_id) {
        toast.error("No patient profile found");
        return;
      }

      try {
        await updatePatientMutation.mutateAsync({
          id: Number(currentPatient.Patient_id),
          data: value,
        });
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
    // Remove validators that are causing issues
  });

  // Update form when patient data loads
  useEffect(() => {
    if (patientData) {
      const extendedPatient = patientData as ExtendedPatient;
      form.setFieldValue("First_Name", patientData.First_Name || "");
      form.setFieldValue("Last_Name", patientData.Last_Name || "");

      // Handle date parsing safely
      const dateValue =
        extendedPatient.Date_of_Birth || extendedPatient.dateOfBirth;
      form.setFieldValue(
        "Date_of_Birth",
        dateValue ? new Date(dateValue).toISOString().split("T")[0] : ""
      );

      form.setFieldValue("Gender", extendedPatient.Gender || "Male");
      form.setFieldValue("Phone_Number", extendedPatient.Phone_Number || "");
      form.setFieldValue(
        "Address_Line_1",
        extendedPatient.Address_Line_1 || ""
      );
      form.setFieldValue(
        "Address_Line_2",
        extendedPatient.Address_Line_2 || ""
      );
      form.setFieldValue("City", extendedPatient.City || "");
      form.setFieldValue("State", extendedPatient.State || "");
      form.setFieldValue("Postal_Code", extendedPatient.Postal_Code || "");
      form.setFieldValue("Country", extendedPatient.Country || "");
      form.setFieldValue(
        "Emergency_Contact_Name",
        patientData.Emergency_Contact_Name || ""
      );
      form.setFieldValue(
        "Emergency_Contact_Phone",
        patientData.Emergency_Contact_Phone || ""
      );
      form.setFieldValue(
        "Emergency_Contact_Relationship",
        patientData.Emergency_Contact_Relationship || ""
      );
      form.setFieldValue(
        "Blood_Group",
        (patientData.Blood_Group as any) || "A+"
      );
      form.setFieldValue("Height", patientData.Height || 0);
      form.setFieldValue("Weight", patientData.Weight || 0);
    }
  }, [patientData, form]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-600">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser || !currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Please log in to access settings.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update your personal information and medical profile.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Personal Information Section */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <form.Field
                  name="First_Name"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.First_Name
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.First_Name
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Last Name */}
                <form.Field
                  name="Last_Name"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Last_Name
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Last_Name
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Date of Birth */}
                <form.Field
                  name="Date_of_Birth"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Date_of_Birth
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Date_of_Birth
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Gender */}
                <form.Field
                  name="Gender"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Gender),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Gender),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Gender
                      </label>
                      <select
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as "Male" | "Female" | "Other"
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Phone Number */}
                <form.Field
                  name="Phone_Number"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Phone_Number
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Phone_Number
                      ),
                  }}
                >
                  {(field) => (
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
                Address Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Line 1 */}
                <form.Field
                  name="Address_Line_1"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Address_Line_1
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Address_Line_1
                      ),
                  }}
                >
                  {(field) => (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Address Line 1
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Address Line 2 */}
                <form.Field name="Address_Line_2">
                  {(field) => (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent text-purple-900 dark:text-white"
                      />
                    </div>
                  )}
                </form.Field>

                {/* City */}
                <form.Field
                  name="City"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.City),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.City),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        City
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* State */}
                <form.Field
                  name="State"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.State),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.State),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        State
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Postal Code */}
                <form.Field
                  name="Postal_Code"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Postal_Code
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Postal_Code
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Postal Code
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Country */}
                <form.Field
                  name="Country"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Country),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Country),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Country
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
                Emergency Contact
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Contact Name */}
                <form.Field
                  name="Emergency_Contact_Name"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Emergency_Contact_Name
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Emergency_Contact_Name
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Name
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
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Emergency Contact Phone */}
                <form.Field
                  name="Emergency_Contact_Phone"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Emergency_Contact_Phone
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Emergency_Contact_Phone
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Emergency Contact Relationship */}
                <form.Field
                  name="Emergency_Contact_Relationship"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape
                          .Emergency_Contact_Relationship
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape
                          .Emergency_Contact_Relationship
                      ),
                  }}
                >
                  {(field) => (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Relationship
                      </label>
                      <select
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                      >
                        <option value="">Select Relationship</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
                Medical Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Blood Group */}
                <form.Field
                  name="Blood_Group"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Blood_Group
                      ),
                    onBlur: ({ value }) =>
                      validateField(
                        value,
                        patientProfileSchema.shape.Blood_Group
                      ),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as
                              | "A+"
                              | "A-"
                              | "B+"
                              | "B-"
                              | "AB+"
                              | "AB-"
                              | "O+"
                              | "O-"
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
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
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Height */}
                <form.Field
                  name="Height"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Height),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Height),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                        min="1"
                        max="300"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Weight */}
                <form.Field
                  name="Weight"
                  validators={{
                    onChange: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Weight),
                    onBlur: ({ value }) =>
                      validateField(value, patientProfileSchema.shape.Weight),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-transparent text-purple-900 dark:text-white`}
                        min="1"
                        max="500"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || updatePatientMutation.isPending}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      canSubmit && !updatePatientMutation.isPending
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-400 cursor-not-allowed text-gray-200"
                    }`}
                  >
                    {isSubmitting || updatePatientMutation.isPending
                      ? "Updating Profile..."
                      : "Update Profile"}
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
