import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../api/users";
import { patientApi } from "../api/patients";
import type { User } from "../api/interfaces/user";
import type { Patient } from "../api/interfaces/patient";

// Icons
const PatientIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const step1Schema = z.object({
  First_Name: z.string().min(2, "First name must be at least 2 characters"),
  Last_Name: z.string().min(2, "Last name must be at least 2 characters"),
  Email: z.string().email("Please enter a valid email address"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
});

const step2Schema = z.object({
  Phone_Number: z.string().min(10, "Phone number must be at least 10 digits"),
  Date_of_Birth: z.date({ required_error: "Date of birth is required" }),
  Gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
  }),
});

const step3Schema = z.object({
  Emergency_Contact_Name: z
    .string()
    .min(2, "Emergency contact name is required"),
  Emergency_Contact_Phone: z
    .string()
    .min(10, "Emergency contact phone is required"),
  Emergency_Contact_Relationship: z.string().min(1, "Relationship is required"),
  Blood_Group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select your blood group",
  }),
  Height: z.number().min(1, "Height is required"),
  Weight: z.number().min(1, "Weight is required"),
});

const formInfo = z.object({
  First_Name: z.string().min(2, "First name must be at least 2 characters"),
  Last_Name: z.string().min(2, "Last name must be at least 2 characters"),
  Email: z.string().email("Please enter a valid email address"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
  Phone_Number: z.string().min(10, "Phone number must be at least 10 digits"),
  Date_of_Birth: z.date({ required_error: "Date of birth is required" }),
  Gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
  }),
  Emergency_Contact_Name: z
    .string()
    .min(2, "Emergency contact name is required"),
  Emergency_Contact_Phone: z
    .string()
    .min(10, "Emergency contact phone is required"),
  Emergency_Contact_Relationship: z.string().min(1, "Relationship is required"),
  Blood_Group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select your blood group",
  }),
  Height: z.number().min(1, "Height is required"),
  Weight: z.number().min(1, "Weight is required"),
});

type FormData = z.infer<typeof formInfo>;

const validateField = (value: any, schema: z.ZodType) => {
  try {
    schema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid input";
    }
    return "Invalid input";
  }
};

const UniversalLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    defaultValues: {
      Email: "",
      Password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Attempting universal login with:", { Email: value.Email });

        // Use the secure userApi.login which handles all user types
        const response = await userApi.login({
          Email: value.Email,
          Password: value.Password,
        });

        const { accessToken, user: userData } = response;
        const user: User = {
          User_id: userData?.User_id,
          Email: userData?.Email || "",
          User_Type: userData?.User_Type as
            | "Patient"
            | "Doctor"
            | "Pharmacist"
            | "Admin",
          First_Name: userData?.First_Name || "",
          Last_Name: userData?.Last_Name || "",
          Password: "",
          Phone_Number: "",
          Date_of_Birth: "",
          Gender: "Male",
          Account_Status: "Active",
          Created_at: userData?.Created_at || new Date().toISOString(),
        };

        login(accessToken, user);
        console.log("Login successful:", user);

        toast.success(
          `Welcome back, ${user.First_Name}! Redirecting to your dashboard.`
        );
        navigate({
          to: "/dashboard",
          replace: true,
        });
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(
          "Login failed. Please check your email and password and try again."
        );
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 mx-auto text-gray-900 dark:text-gray-100"
    >
      {/* Email field */}
      <form.Field
        name="Email"
        validators={{
          onChange: ({ value }) =>
            validateField(value, step1Schema.shape.Email),
          onBlur: ({ value }) => validateField(value, step1Schema.shape.Email),
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                field.state.meta.errors.length > 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
              placeholder="your@email.com"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Password field */}
      <form.Field
        name="Password"
        validators={{
          onChange: ({ value }) =>
            validateField(value, step1Schema.shape.Password),
          onBlur: ({ value }) =>
            validateField(value, step1Schema.shape.Password),
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                field.state.meta.errors.length > 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
              placeholder="Enter your password"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="pt-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                canSubmit
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 cursor-not-allowed text-gray-200"
              }`}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

interface RoleTabProps {
  role: "Patient";
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const RoleTab: React.FC<RoleTabProps> = ({
  role,
  isSelected,
  onClick,
  icon,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 min-w-[100px] ${
      isSelected
        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
        : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-25 dark:hover:bg-purple-900/10 text-gray-600 dark:text-gray-300"
    }`}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-sm font-medium">{role}</span>
  </button>
);

function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"Patient">("Patient");
  const [formType, setFormType] = useState<"signup" | "login">("signup");
  const [registrationStep, setRegistrationStep] = useState<1 | 2 | 3>(1);
  const [userAccountCreated, setUserAccountCreated] = useState<{
    accessToken: string;
    user: any;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      First_Name: "",
      Last_Name: "",
      Email: "",
      Password: "",
      Phone_Number: "",
      Date_of_Birth: new Date(),
      Gender: "Male" as "Male" | "Female" | "Other",
      Emergency_Contact_Name: "",
      Emergency_Contact_Phone: "",
      Emergency_Contact_Relationship: "",
      Blood_Group: "O+" as
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
      try {
        // Validate based on current step
        if (registrationStep === 1) {
          const step1Data = {
            First_Name: value.First_Name,
            Last_Name: value.Last_Name,
            Email: value.Email,
            Password: value.Password,
          };

          const result = step1Schema.safeParse(step1Data);
          if (!result.success) {
            console.log("Step 1 validation failed:", result.error.issues);
            return;
          }
        } else if (registrationStep === 2) {
          const step2Data = {
            Phone_Number: value.Phone_Number,
            Date_of_Birth: value.Date_of_Birth,
            Gender: value.Gender,
          };

          const result = step2Schema.safeParse(step2Data);
          if (!result.success) {
            console.log("Step 2 validation failed:", result.error.issues);
            return;
          }
        } else if (registrationStep === 3) {
          const step3Data = {
            Emergency_Contact_Name: value.Emergency_Contact_Name,
            Emergency_Contact_Phone: value.Emergency_Contact_Phone,
            Emergency_Contact_Relationship:
              value.Emergency_Contact_Relationship,
            Blood_Group: value.Blood_Group,
            Height: value.Height,
            Weight: value.Weight,
          };

          const result = step3Schema.safeParse(step3Data);
          if (!result.success) {
            console.log("Step 3 validation failed:", result.error.issues);
            return;
          }
        }

        const apiData = {
          ...value,
          Date_of_Birth: value.Date_of_Birth?.toISOString(),
        };

        if (selectedRole === "Patient" && registrationStep === 1) {
          const userAccountData = {
            First_Name: value.First_Name,
            Last_Name: value.Last_Name,
            Email: value.Email,
            Password: value.Password,
            User_Type: "Patient",
            Phone_Number: "0000000000",
            Date_of_Birth: new Date("1990-01-01").toISOString(),
            Gender: "Male" as "Male" | "Female" | "Other",
          };

          const { accessToken, user: userData } = await userApi.create(
            userAccountData
          );
          setUserAccountCreated({ accessToken, user: userData });
          setRegistrationStep(2);
          toast.success(
            "User account created! Please complete your personal details."
          );
          return;
        }

        if (
          selectedRole === "Patient" &&
          registrationStep === 2 &&
          userAccountCreated
        ) {
          // Update the user profile with step 2 information
          const updatedProfileData = {
            Phone_Number: value.Phone_Number,
            Date_of_Birth: value.Date_of_Birth?.toISOString(),
            Gender: value.Gender,
          };

          await userApi.updateProfile(
            userAccountCreated.user?.User_id.toString(),
            updatedProfileData
          );

          setRegistrationStep(3);
          toast.success(
            "Personal details saved! Please complete your medical profile."
          );
          return;
        }

        if (
          selectedRole === "Patient" &&
          registrationStep === 3 &&
          userAccountCreated
        ) {
          // Get the updated user data
          const updatedUser = await userApi.getUserById(
            userAccountCreated.user?.User_id.toString()
          );

          // Create a patient record with comprehensive information
          const patientData: Omit<Patient, "Patient_id"> = {
            User_id: updatedUser.User_id,
            First_Name: updatedUser.First_Name || "",
            Last_Name: updatedUser.Last_Name || "",
            Emergency_Contact_Name: value.Emergency_Contact_Name,
            Emergency_Contact_Phone: value.Emergency_Contact_Phone,
            Emergency_Contact_Relationship:
              value.Emergency_Contact_Relationship,
            Blood_Group: value.Blood_Group,
            Height: value.Height,
            Weight: value.Weight,
            Allergies: "", // Optional - can be updated later in settings
            Medical_History: "", // Optional - can be updated later in settings
            Insurance_Provider: "", // Optional - can be updated later in settings
            Insurance_Policy_Number: "", // Optional - can be updated later in settings
          };

          try {
            const createdPatient = await patientApi.create(patientData);
            console.log("Patient record created:", createdPatient);
          } catch (error) {
            console.error("Error creating patient record:", error);
            toast.error(
              "User created but patient profile setup incomplete. You can complete it in settings."
            );
          }

          const user: User = {
            User_id: updatedUser.User_id,
            Email: updatedUser.Email || "",
            User_Type: "Patient",
            First_Name: updatedUser.First_Name || "",
            Last_Name: updatedUser.Last_Name || "",
            Password: "",
            Phone_Number: updatedUser.Phone_Number || "",
            Date_of_Birth: updatedUser.Date_of_Birth || "",
            Gender: updatedUser.Gender || "Male",
            Account_Status: updatedUser.Account_Status || "Active",
            Created_at: updatedUser.Created_at || new Date().toISOString(),
          };

          login(userAccountCreated.accessToken, user);
          console.log("Patient registration completed:", user);

          toast.success(
            "Registration completed successfully! Welcome to Healthcare Portal."
          );
          navigate({
            to: "/dashboard",
            replace: true,
          });
          return;
        }

        const { accessToken, user: userData } = await userApi.create(apiData);

        const user: User = {
          User_id: userData?.User_id,
          Email: userData?.Email || "",
          User_Type: (userData?.User_Type || selectedRole) as
            | "Patient"
            | "Doctor"
            | "Pharmacist"
            | "Admin",
          First_Name: userData?.First_Name || "",
          Last_Name: userData?.Last_Name || "",
          Password: "",
          Phone_Number: userData?.Phone_Number || "",
          Date_of_Birth: userData?.Date_of_Birth || "",
          Gender: userData?.Gender || "Male",
          Account_Status: userData?.Account_Status || "Active",
          Created_at: userData?.Created_at || new Date().toISOString(),
        };

        login(accessToken, user);
        console.log("Registration successful:", user);

        toast.success(
          "Signed Up successfully, you will now be redirected to your dashboard."
        );
        navigate({
          to: "/dashboard",
          replace: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data.response.error
            : error instanceof Error
            ? error.message
            : "Registration Failed. Please try again";
        console.error("Registration failed:", error);
        toast.error(errorMessage);
      } finally {
        form.reset();
      }
    },
  });

  const handleRoleChange = (role: "Patient") => {
    setSelectedRole(role);
    setRegistrationStep(1);
    setUserAccountCreated(null);
  };

  const handleFormTypeToggle = () => {
    setFormType(formType === "signup" ? "login" : "signup");
    setRegistrationStep(1);
    setUserAccountCreated(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans relative"
      style={{
        backgroundImage:
          "url('/Stethoscope Neon Sign, Stethoscope LED Light, Hospital Wall Decor, Medical Room Wall Art, Doctor Office Neon Light, Healthcare Neon Art.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="w-full max-w-md p-6 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">HP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Healthcare Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {formType === "login"
              ? "Sign in to access your healthcare dashboard."
              : "Create your account for secure healthcare access."}
          </p>
        </div>

        {/* Form Type Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-1">
            <button
              type="button"
              onClick={() => setFormType("signup")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                formType === "signup"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setFormType("login")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                formType === "login"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Conditional rendering based on formType */}
        {formType === "login" ? (
          <UniversalLoginForm />
        ) : (
          <>
            {/* Role Selection - Only for Patient signup now */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Account Type:
              </label>
              <div className="flex gap-3 justify-center">
                <RoleTab
                  role="Patient"
                  isSelected={selectedRole === "Patient"}
                  onClick={() => handleRoleChange("Patient")}
                  icon={<PatientIcon />}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Healthcare professionals are registered through the admin portal
                for security.
              </p>
            </div>

            {/* Registration Progress for Patients */}
            {selectedRole === "Patient" && (
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      registrationStep >= 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`w-8 h-1 ${
                      registrationStep >= 2 ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      registrationStep >= 2
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`w-8 h-1 ${
                      registrationStep >= 3 ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      registrationStep >= 3
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Account</span>
                  <span>Personal</span>
                  <span>Medical</span>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4 mx-auto text-gray-900 dark:text-gray-100"
            >
              <input type="hidden" name="role" value={selectedRole} />

              {/* Registration Step Content */}
              {registrationStep === 1 && (
                <>
                  {/* First Name field */}
                  <form.Field
                    name="First_Name"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step1Schema.shape.First_Name),
                      onBlur: ({ value }) =>
                        validateField(value, step1Schema.shape.First_Name),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter your first name..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Last Name field */}
                  <form.Field
                    name="Last_Name"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step1Schema.shape.Last_Name),
                      onBlur: ({ value }) =>
                        validateField(value, step1Schema.shape.Last_Name),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter your last name..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Email field */}
                  <form.Field
                    name="Email"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step1Schema.shape.Email),
                      onBlur: ({ value }) =>
                        validateField(value, step1Schema.shape.Email),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="patient@example.com"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Password field */}
                  <form.Field
                    name="Password"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step1Schema.shape.Password),
                      onBlur: ({ value }) =>
                        validateField(value, step1Schema.shape.Password),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter a secure password..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </>
              )}

              {registrationStep === 2 && (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      Complete Your Patient Profile
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add additional information to complete your registration.
                    </p>
                  </div>

                  {/* Phone Number field */}
                  <form.Field
                    name="Phone_Number"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step2Schema.shape.Phone_Number),
                      onBlur: ({ value }) =>
                        validateField(value, step2Schema.shape.Phone_Number),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter your phone number..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Date of Birth field */}
                  <form.Field
                    name="Date_of_Birth"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step2Schema.shape.Date_of_Birth),
                      onBlur: ({ value }) =>
                        validateField(value, step2Schema.shape.Date_of_Birth),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id={field.name}
                          name={field.name}
                          value={
                            field.state.value instanceof Date
                              ? field.state.value.toISOString().split("T")[0]
                              : field.state.value || ""
                          }
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            const dateValue = event.target.value
                              ? new Date(event.target.value)
                              : new Date();
                            field.handleChange(dateValue);
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Gender field */}
                  <form.Field
                    name="Gender"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step2Schema.shape.Gender),
                      onBlur: ({ value }) =>
                        validateField(value, step2Schema.shape.Gender),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Gender
                        </label>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(
                              event.target.value as "Male" | "Female" | "Other"
                            )
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                          <option
                            value=""
                            className="text-gray-500 dark:text-gray-400"
                          >
                            Select Gender
                          </option>
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
                </>
              )}

              {registrationStep === 3 && (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      Medical Profile
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete your medical information for better healthcare
                      services.
                    </p>
                  </div>

                  {/* Emergency Contact Name field */}
                  <form.Field
                    name="Emergency_Contact_Name"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Name
                        ),
                      onBlur: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Name
                        ),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter emergency contact name..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Emergency Contact Phone field */}
                  <form.Field
                    name="Emergency_Contact_Phone"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Phone
                        ),
                      onBlur: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Phone
                        ),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Emergency Contact Phone
                        </label>
                        <input
                          type="tel"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="Enter emergency contact phone..."
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-red-500">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Emergency Contact Relationship field */}
                  <form.Field
                    name="Emergency_Contact_Relationship"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Relationship
                        ),
                      onBlur: ({ value }) =>
                        validateField(
                          value,
                          step3Schema.shape.Emergency_Contact_Relationship
                        ),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Relationship to Emergency Contact
                        </label>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                          <option
                            value=""
                            className="text-gray-500 dark:text-gray-400"
                          >
                            Select Relationship
                          </option>
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

                  {/* Blood Group field */}
                  <form.Field
                    name="Blood_Group"
                    validators={{
                      onChange: ({ value }) =>
                        validateField(value, step3Schema.shape.Blood_Group),
                      onBlur: ({ value }) =>
                        validateField(value, step3Schema.shape.Blood_Group),
                    }}
                  >
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                        >
                          Blood Group
                        </label>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(
                              event.target.value as
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                            field.state.meta.errors.length > 0
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                          <option
                            value=""
                            className="text-gray-500 dark:text-gray-400"
                          >
                            Select Blood Group
                          </option>
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

                  {/* Height and Weight in grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Height field */}
                    <form.Field
                      name="Height"
                      validators={{
                        onChange: ({ value }) =>
                          validateField(value, step3Schema.shape.Height),
                        onBlur: ({ value }) =>
                          validateField(value, step3Schema.shape.Height),
                      }}
                    >
                      {(field) => (
                        <div>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                          >
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            id={field.name}
                            name={field.name}
                            value={field.state.value || ""}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(Number(event.target.value))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                            placeholder="170"
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

                    {/* Weight field */}
                    <form.Field
                      name="Weight"
                      validators={{
                        onChange: ({ value }) =>
                          validateField(value, step3Schema.shape.Weight),
                        onBlur: ({ value }) =>
                          validateField(value, step3Schema.shape.Weight),
                      }}
                    >
                      {(field) => (
                        <div>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-1"
                          >
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            id={field.name}
                            name={field.name}
                            value={field.state.value || ""}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(Number(event.target.value))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                            placeholder="70"
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
                </>
              )}

              {/* Navigation Buttons */}
              <div className="pt-4">
                <div className="flex justify-between gap-4">
                  {registrationStep > 1 && (
                    <button
                      type="button"
                      // union type assertion.
                      onClick={() =>
                        setRegistrationStep((registrationStep - 1) as 1 | 2 | 3)
                      }
                      className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-md transition-colors"
                    >
                      Previous
                    </button>
                  )}

                  {registrationStep < 3 ? (
                    <button
                      type="button"
                      onClick={async () => {
                        // Validate current step before proceeding
                        let fieldsToValidate: Array<
                          | "First_Name"
                          | "Last_Name"
                          | "Email"
                          | "Password"
                          | "Phone_Number"
                          | "Date_of_Birth"
                          | "Gender"
                          | "Emergency_Contact_Name"
                          | "Emergency_Contact_Phone"
                          | "Emergency_Contact_Relationship"
                          | "Blood_Group"
                          | "Height"
                          | "Weight"
                        > = [];

                        if (registrationStep === 1) {
                          fieldsToValidate = [
                            "First_Name",
                            "Last_Name",
                            "Email",
                            "Password",
                          ];
                        } else if (registrationStep === 2) {
                          fieldsToValidate = [
                            "Phone_Number",
                            "Date_of_Birth",
                            "Gender",
                          ];
                        } else if (registrationStep === 3) {
                          fieldsToValidate = [
                            "Emergency_Contact_Name",
                            "Emergency_Contact_Phone",
                            "Emergency_Contact_Relationship",
                            "Blood_Group",
                            "Height",
                            "Weight",
                          ];
                        }

                        let isValid = true;
                        for (const field of fieldsToValidate) {
                          const valid = await form.validateField(
                            field,
                            "change"
                          );
                          if (!valid) {
                            isValid = false;
                          }
                        }

                        if (isValid) {
                          setRegistrationStep((prev) =>
                            prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev
                          );
                        }
                      }}
                      className={`${
                        registrationStep > 1 ? "flex-1" : "w-full"
                      } py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors`}
                    >
                      Next
                    </button>
                  ) : (
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <button
                          type="submit"
                          disabled={!canSubmit}
                          className={`${
                            registrationStep > 1 ? "flex-1" : "w-full"
                          } py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            canSubmit
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-400 cursor-not-allowed text-gray-200"
                          }`}
                        >
                          {isSubmitting
                            ? "Creating Account..."
                            : "Complete Registration"}
                        </button>
                      )}
                    </form.Subscribe>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="text-center mt-4">
                <span className="text-gray-600 dark:text-gray-400">
                  {registrationStep === 2
                    ? "Want to go back? "
                    : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (registrationStep === 2) {
                      setRegistrationStep(1);
                      setUserAccountCreated(null);
                    } else {
                      handleFormTypeToggle();
                    }
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  {registrationStep === 2 ? "Previous Step" : "Sign In"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SignUpForm;
