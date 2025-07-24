// src/components/ui/sidebar.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Context for sidebar state
const SidebarContext = React.createContext<{
  isCollapsed: boolean
  toggleCollapse: () => void
}>({
  isCollapsed: false,
  toggleCollapse: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return React.useContext(SidebarContext)
}

const sidebarVariants = cva(
  "h-full border-r transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-background",
        secondary: "bg-secondary",
      },
      size: {
        default: "w-64",
        collapsed: "w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        sidebarVariants({ variant, size: isCollapsed ? "collapsed" : "default" }),
        className
      )}
      {...props}
    />
  )
}

export function SidebarTrigger() {
  const { toggleCollapse } = useSidebar()
  return (
    <button onClick={toggleCollapse} className="p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  )
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        isCollapsed ? "hidden" : "block",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

const sidebarMenuButtonVariants = cva(
  "flex items-center w-full p-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
      asChild? : boolean
    }

export function SidebarMenuButton({ className, active, asChild = false, children, ...props }: SidebarMenuButtonProps) {
  const { isCollapsed } = useSidebar()
  const buttonClass = cn(
    sidebarMenuButtonVariants({ active }),
    isCollapsed ? "justify-center" : "justify-start",
    className
  )

  if (asChild) {
    const child = React.Children.only(children);
    if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) {
      throw new Error('Child must be a valid React element when using asChild');
    }
    return React.cloneElement(child, {
      className: cn(buttonClass, child.props?.className),
      ...props
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  )
}