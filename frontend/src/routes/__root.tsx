import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/Header";
import { NotFound } from "@/components/NotFound";

const ErrorComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          An error occurred while loading this page. Please try again or contact
          support if the problem persists.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster position="top-right" richColors />
    </>
  ),
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
