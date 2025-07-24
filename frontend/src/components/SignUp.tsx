import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { userApi } from "@/api/users";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { doctorApi } from "@/api/doctors";
import { pharmacistApi } from "@/api/pharmacists";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import { ClipboardPlus, PillBottle, SquareUserRound } from "lucide-react";


const DoctorIcon = () => (
  <ClipboardPlus />
);

const PharmacistIcon = () => (
  <PillBottle />
);

const PatientIcon = () => (
  <SquareUserRound />
);

const doctorLoginSchema = z.object({
  License_number: z.string().min(2, "License number must be at least 2 characters")
});

const formInfo = z.object({
    role: z.enum(['Doctor', 'Pharmacist', 'Patient']),
    First_Name: z.string().min(2, "First name must be at least 2 characters").max(50),
    Last_Name: z.string().min(2, "Last name must be at least 2 characters").max(50),
    License_number: z.string().min(2, "Last name must be at least 2 characters").max(50).optional(),
    Email: z.string().email("Please enter a valid email address."),
    Password: z.string()
        .min(8, "Password should be at least 8 characters.")
        .regex(/[A-Z]/, "Password should contain at least one uppercase letter!")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter!")
        .regex(/\d/, "Password must contain at least one number!"),
    Phone_Number: z.string(),
    Date_of_Birth: z.date(),
    Gender: z.enum(['Male', 'Female', 'Other'])
});

type FormData = z.infer<typeof formInfo>;

function validateField<T>(value: T, schema: z.ZodType<T>) {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues.map((issue) => issue.message);
}

const LoginForm = ({ role }: { role: 'Doctor' | 'Pharmacist' }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const form = useForm({
    defaultValues: {
      License_number: '',
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Attempting login with:", value)
        const result = doctorLoginSchema.safeParse(value);
        if (!result.success) {
          console.log("Validation failed:", result.error.issues);
          return;
        }

        let response;
        if (role === 'Doctor') {
          response = await doctorApi.login({License_number: value.License_number,});
        } else if (role === 'Pharmacist') {
          response = await pharmacistApi.login({License_Number: value.License_number});
        } else {
          throw new Error('Invalid role for login')
        }
        
        const { token, user: userData, doctor: doctorData } = response;
        const user: User = {
          User_id: (userData?.User_id || doctorData?.Doctor_id),
          Email: userData?.Email || `${role.toLowerCase()}@example.com`,
          User_Type: (userData?.User_Type || role) as 'Patient' | 'Doctor' | 'Pharmacist' | 'Admin',
          First_Name: userData?.First_Name || role,
          Last_Name: userData?.Last_Name || 'User'
        };
        
        login(token, user);
        console.log("Login successful:", user);
        
        toast.success(`Logged in successfully as ${role}, redirecting to your dashboard.`);
        navigate({
          to: '/dashboard',
          replace: true,
        });
      } catch (error) {
        console.error("Login failed:", error);
        toast.error("😩Login failed. Please check your credentials and try again.");
      }
    },
  });

  function setFormType(arg0: string): void {
    throw new Error("Function not implemented.");
  }

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
        name="License_number"
        validators={{
           onChange: ({ value }) => validateField(value, doctorLoginSchema.shape.License_number),
          onBlur: ({ value }) => validateField(value, doctorLoginSchema.shape.License_number),
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-purple-600 mb-1"
            >
              License Number
            </label>
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                field.state.meta.errors.length > 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              } bg-transparent text-purple-900 dark:text-white`}
              placeholder={`${role.toLowerCase()}@example.com`}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Submit Button */}
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
              {isSubmitting ? "Logging in..." : `Login as ${role}`}
            </button>
          )}
        </form.Subscribe>
      </div>

      <div className="text-center mt-4">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
         <button 
    type="button"
    onClick={() => setFormType('signup')}
    className="text-purple-600 hover:underline bg-transparent border-none cursor-pointer"
  >
    Sign up
  </button>
      </div>
    </form>
  );
};

interface RoleTabProps {
  role: 'Doctor' | 'Pharmacist' | 'Patient';
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const RoleTab: React.FC<RoleTabProps> = ({ role, isSelected, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 min-w-[100px] ${
      isSelected
        ? 'border-purple-500 bg-purple-50 text-purple-700'
        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-25 text-gray-600'
    }`}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-sm font-medium">{role}</span>
  </button>
);

function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'Doctor' | 'Pharmacist' | 'Patient'>('Patient');
  const [formType, setFormType] = useState<'login' | 'login'>('login');

  const form = useForm({
    defaultValues: {
      role: selectedRole,
      First_Name: "",
      Last_Name: "",
      Email: "",
      Password: "",
      Phone_Number: "",
      Date_of_Birth: new Date(),
      Gender: "Male",
    } as FormData,
    onSubmit: async ({ value }) => {
       try {
        const result = formInfo.safeParse(value);
        if (!result.success) {
          console.log("Validation failed:", result.error.issues);
          return;
        }
        const apiData = {
          ...value,
          Date_of_Birth: value.Date_of_Birth?.toISOString(), 
        };

        const { token, user: userData } = await userApi.create(apiData);
        
        const user: User = {
          User_id: userData?.User_id,
          Email: userData?.Email || '',
          User_Type: (userData?.User_Type || selectedRole) as 'Patient' | 'Doctor' | 'Pharmacist' | 'Admin',
          First_Name: userData?.First_Name || '',
          Last_Name: userData?.Last_Name || ''
        };
        
        console.log("API Response:", { token, userData });
        console.log("Constructed user object:", user);
        login(token, user);
        console.log("Registration successful:", user);
        
        toast.success("Signed Up successfully, you will now be redirected to your dashboard.");
        navigate({
          to: '/dashboard',
          replace: true,
        });
      } catch (error) {
        const errorMessage = error instanceof AxiosError ? error.response?.data.response.error : error instanceof Error ? error.message : "Registration Failed. PLease try again"
        console.error("Registration failed:", error);
        toast.error(errorMessage);
      } finally {
        form.reset();
      }
    },
  });

  const handleRoleChange = (role: 'Doctor' | 'Pharmacist' | 'Patient') => {
    setSelectedRole(role);
    form.setFieldValue('role', role);
    setFormType(role === 'Patient' ? 'login' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">HP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Healthcare Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Secure access for healthcare professionals and patients.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select your role:
          </label>
          <div className="flex gap-3 justify-center">
            <RoleTab
              role="Doctor"
              isSelected={selectedRole === 'Doctor'}
              onClick={() => handleRoleChange('Doctor')}
              icon={<DoctorIcon />}
            />
            <RoleTab
              role="Pharmacist"
              isSelected={selectedRole === 'Pharmacist'}
              onClick={() => handleRoleChange('Pharmacist')}
              icon={<PharmacistIcon />}
            />
            <RoleTab
              role="Patient"
              isSelected={selectedRole === 'Patient'}
              onClick={() => handleRoleChange('Patient')}
              icon={<PatientIcon />}
            />
          </div>
        </div>

        {/* Conditional rendering based on formType */}
        {formType === 'login' && (selectedRole === 'Doctor' || selectedRole === 'Pharmacist') ? (
          <LoginForm role={selectedRole} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4 mx-auto text-gray-900 dark:text-gray-100"
          >
            <input type="hidden" name="role" value={selectedRole} />

            {/* First Name field */}
            <form.Field
              name="First_Name"
              validators={{
                onChange: ({ value }) => validateField(value, formInfo.shape.First_Name),
                onBlur: ({ value }) => validateField(value, formInfo.shape.First_Name),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-purple-600 mb-1"
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      field.state.meta.errors.length > 0
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    } bg-transparent text-purple-900 dark:text-white`}
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
              onChange: ({ value }) => validateField(value, formInfo.shape.Last_Name),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Last_Name),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900 dark:text-white`}
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
              onChange: ({ value }) => validateField(value, formInfo.shape.Email),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Email),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900 dark:text-white`}
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
              onChange: ({ value }) => validateField(value, formInfo.shape.Password),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Password),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900 dark:text-white`}
                  placeholder="••••••••••"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Phone Number field */}
          <form.Field
            name="Phone_Number"
            validators={{
              onChange: ({ value }) => validateField(value, formInfo.shape.Phone_Number),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Phone_Number),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900 dark:text-white`}
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
              onChange: ({ value }) => validateField(value, formInfo.shape.Date_of_Birth),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Date_of_Birth),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id={field.name}
                  name={field.name}
                  value={field.state.value instanceof Date
                    ? field.state.value.toISOString().split('T')[0]
                    : field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const dateValue = event.target.value ? new Date(event.target.value) : new Date();
                    field.handleChange(dateValue);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
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

          {/* Gender field */}
          <form.Field
            name="Gender"
            validators={{
              onChange: ({ value }) => validateField(value, formInfo.shape.Gender),
              onBlur: ({ value }) => validateField(value, formInfo.shape.Gender),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-purple-600 mb-1"
                >
                  Gender
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value as "Male" | "Female" | "Other")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900 dark:text-white`}
                >
                  <option value="">Select Gender</option>
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

            {/* Submit Button */}
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
                    {isSubmitting ? "Submitting..." : `Sign Up as ${selectedRole}`}
                  </button>
                )}
              </form.Subscribe>
            </div>

            <div className="text-center mt-4">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                <button 
                type="button"
                onClick={() => setFormType('login')}
                className="text-purple-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SignUpForm;