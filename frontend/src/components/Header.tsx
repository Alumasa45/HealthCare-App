import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { FaHospitalUser } from "react-icons/fa";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header
      className={`p-2 flex gap-2 bg-background text-foreground justify-between sticky top-0 border-b shadow z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95`}
    >
      <FaHospitalUser className=" size-12" />
      <nav className="flex flex-row">
        {/* <div className="px-2 font-bold"> */}
        <ul className="flex gap-12 justify-center w-full">
          <li>
            <Link to="/" className=" hover:underline">
              Home
            </Link>
          </li>
          <li>
            <a href="#services" className=" hover:underline">
              Services
            </a>
          </li>
          <li>
            <Link to="/aboutUs" className=" hover:underline">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/pharmacies" className=" hover:underline">
              Pharmacies
            </Link>
          </li>
          <li>
            <Link to="/contacts" className=" hover:underline">
              Contact Us
            </Link>
          </li>
          {/* <li>
              <Link to="/dashboard" className="text-black hover:underline">
                Dashboard
              </Link>
            </li> */}
          <div className="gap-40">
            <ThemeToggle size="sm" />
          </div>
          <div className="justify-between">
            <Button
              onClick={() => navigate({ to: "/signUp" })}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-white-700 transition-colors"
              variant="outline"
            >
              Sign Up
            </Button>
          </div>
        </ul>
        {/* </div> */}
      </nav>
    </header>
  );
}
