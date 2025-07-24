import { useTheme } from "next-themes"
import { Toaster, type ToasterProps } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"

const ThemedToaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Toaster
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-2 p-4 rounded-md border text-sm font-medium shadow-lg",
          success: "bg-purple-50 text-purple-800 border-purple-200",
          error: "bg-red-50 text-red-800 border-red-200",
        },
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-purple-600" />,
        error: <XCircle className="w-5 h-5 text-red-600" />,
      }}
      {...props}
    />
  )
}

export { ThemedToaster as Toaster }