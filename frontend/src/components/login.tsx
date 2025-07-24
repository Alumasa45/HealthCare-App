import { userApi } from "@/api/users";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import z from "zod";


const formInfo = z.object({
    Email: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "Should not exceed 50 characters."),
    Password: z
        .string()
        .min(8, "Password should be at least 8 characters.")
        .regex(/[A-Z]/, "Password should contain at least one uppercase letter!")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter!")
        .regex(/\d/, "Password must contain at least one number!")
});

type FormData = z.infer<typeof formInfo>;

function validateField<T>(value: T, schema: z.ZodType<T>) {
    const result = schema.safeParse(value);
    return result.success 
    ?undefined: result.error.issues.map((issue) => issue.message);
}

function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const form = useForm({
        defaultValues: {
        Email: "",
        Password: ""
    } as FormData,
    onSubmit: async ({ value}) => {
        try {
            const result = formInfo.safeParse(value);
            if(!result.success) {
                console.log("Validation failed:", result.error.issues);
                return;
            }
            const apiData = { ...value};
            const {token, user: userData } = await userApi.login(apiData);
            const user = userData;
            
            login(token, user);
            console.log("Login successful:", user);
            console.log("User type for redirection:", user.User_Type);
            toast.success("Logged in successfully! Redirecting to your dashboard.");
            navigate({to: '/dashboard', replace: true})
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Log in failed.😞 Please try again. 💡Ensure you are entering the correct details.")
        } finally {
            form.reset();
        }
    },
});

return (
<div className="min-h-screen flex items-center justify-center font-sans">
    <div className="w-full max-w-md p-6 bg-purple-300 dark:bg-gray-900 font-sans rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-800 dark:text-purple-300 text-center"> Log in to your Account.</h2>
        <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}
        className="space-y-4 mx-auto p-6 text-gray-100 dark:text-gray-900 rounded-lg"
        >
            {/* Email field */}
            <form.Field
            name="Email"
            validators={{
              onChange: ({ value }) =>
                validateField(value, formInfo.shape.Email),
              onBlur: ({ value }) =>
                validateField(value, formInfo.shape.Email),
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
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } bg-transparent text-purple-900`}
                  placeholder="Add your email here..."
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-300">
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
                validateField(value, formInfo.shape.Password),
              onBlur: ({ value }) =>
                validateField(value, formInfo.shape.Password),
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
                  } bg-transparent text-purple-900`}
                  placeholder="Enter your password here..."
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-300 ">
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
                      ? "bg-gray-400 hover:bg-purple-600 text-white"
                      : "bg-gray-400 cursor-not-allowed text-gray-200"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Log In"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
    </div>
</div>
);
}

export default LoginForm;