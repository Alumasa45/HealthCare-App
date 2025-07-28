import { createFileRoute } from "@tanstack/react-router";
import ThemeDemo from "@/components/ThemeDemo";

export const Route = createFileRoute("/theme-demo")({
  component: ThemeDemo,
});
