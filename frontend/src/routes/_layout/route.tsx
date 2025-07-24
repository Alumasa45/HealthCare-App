import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "@/components/Sidebar";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header className="sticky top-0 border-b shadow z-10" /> */}

      <div className="flex flex-1 relative">
        <Sidebar
          className={`sticky top-16 pt-6 h-screen border-r transition-all duration-300`}
        />

        <main className="flex-1 overflow-auto p-4 relative">
          <div className="sticky top-0"></div>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
