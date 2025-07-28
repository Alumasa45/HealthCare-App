import { useState, useEffect } from "react";
import "./AdminDashboard.css";
import {
  Users,
  UserPlus,
  Activity,
  Stethoscope,
  ShoppingBag,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  UserCheck,
  Bell,
  Pill,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { userApi } from "@/api/users";
import { doctorApi } from "@/api/doctors";
import { pharmacistApi } from "@/api/pharmacists";
import { patientApi, type Patient } from "@/api/patients";
import { notificationApi } from "@/api/notifications";
import type { User } from "@/api/interfaces/user";
import type { Notification } from "@/api/interfaces/notification";
import type { Doctors as Doctor } from "@/api/interfaces/doctor";
import type { Pharmacist } from "@/api/interfaces/pharmacist";
import { Textarea } from "../ui/textarea";

type AdminTabType =
  | "overview"
  | "users"
  | "doctors"
  | "pharmacists"
  | "patients"
  | "activity";
type RegistrationTabType = "doctor" | "pharmacist";

const AdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [registrationTab, setRegistrationTab] =
    useState<RegistrationTabType>("doctor");
  const [isRegistrationSheetOpen, setIsRegistrationSheetOpen] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Form states for user creation
  const [newUser, setNewUser] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_Number: "",
    Date_Of_Birth: "",
    Gender: "" as "Male" | "Female" | "Other" | "",
    Address: "",
    User_Type: "" as "Doctor" | "Pharmacist" | "",
    Password: "",
  });

  // Form states for doctor registration
  const [newDoctor, setNewDoctor] = useState({
    User_id: "",
    License_number: "",
    Password: "", // Add password field
    Specialization: "",
    Qualification: "",
    Experience_Years: 0,
    Department: "",
    Bio: "",
    Languages_Spoken: "",
    Is_Available_Online: false,
    Rating: 0,
    Reviews: "",
  });

  // Form states for pharmacist registration
  const [newPharmacist, setNewPharmacist] = useState({
    User_id: "",
    Pharmacy_Name: "",
    License_Number: "",
    Phone_Number: "",
    Email: "",
    Opening_Time: "",
    Closing_Time: "",
    Delivery_Available: false,
    Is_Verified: false,
    Rating: 0,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    userDistribution: [
      { name: "Doctors", value: 0, color: "#8B5CF6" },
      { name: "Patients", value: 0, color: "#06B6D4" },
      { name: "Pharmacists", value: 0, color: "#10B981" },
      { name: "Admins", value: 0, color: "#F59E0B" },
    ],
    monthlyRegistrations: [] as Array<{
      month: string;
      doctors: number;
      patients: number;
      pharmacists: number;
      total: number;
    }>,
    revenueData: [] as Array<{
      month: string;
      revenue: number;
      appointments: number;
      prescriptions: number;
    }>,
  });

  // Helper function to check if email is already taken
  const isEmailTaken = (email: string): boolean => {
    if (!email) return false;
    return !!users.find(
      (user) => user.Email.toLowerCase() === email.toLowerCase()
    );
  };

  // Helper function to get available users count for suggestion
  const getAvailableUsersCount = (): number => {
    if (!newUser.User_Type) return 0;
    return availableUsers.filter((user) => user.User_Type === newUser.User_Type)
      .length;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch available users when registration sheet opens
  useEffect(() => {
    if (isRegistrationSheetOpen) {
      fetchAvailableUsers();
    }
  }, [isRegistrationSheetOpen, registrationTab]);

  const handleOpenRegistrationSheet = () => {
    // Reset all states when opening the registration sheet
    setRegistrationStep(1);
    setCreatedUserId(null);
    setSelectedUser(null);
    setIsRegistrationSheetOpen(true);

    // Reset forms
    setNewUser({
      First_Name: "",
      Last_Name: "",
      Email: "",
      Phone_Number: "",
      Date_Of_Birth: "",
      Gender: "",
      Address: "",
      User_Type: "",
      Password: "",
    });
    setNewDoctor({
      User_id: "",
      License_number: "",
      Password: "",
      Specialization: "",
      Qualification: "",
      Experience_Years: 0,
      Department: "",
      Bio: "",
      Languages_Spoken: "",
      Is_Available_Online: false,
      Rating: 0,
      Reviews: "",
    });
  };

  const fetchAllData = async () => {
    setLoading(true);
    console.log("🔄 Starting to fetch admin dashboard data...");

    try {
      // Check if we have auth token
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1] || localStorage.getItem("authToken");
      console.log("🔑 Auth token available:", !!token);

      console.log("📡 Fetching users...");
      const usersData = await userApi.listUsers();
      console.log("✅ Users fetched:", usersData?.length || 0);

      console.log("📡 Fetching doctors...");
      const doctorsData = await doctorApi.getAll();
      console.log("✅ Doctors fetched:", doctorsData?.length || 0);

      console.log("📡 Fetching pharmacists...");
      const pharmacistsData = await pharmacistApi.getAll();
      console.log("✅ Pharmacists fetched:", pharmacistsData?.length || 0);

      console.log("📡 Fetching patients...");
      const patientsData = await patientApi.getAll();
      console.log("✅ Patients fetched:", patientsData?.length || 0);

      console.log("📡 Fetching notifications...");
      const notificationsData = await notificationApi.findAll();
      console.log("✅ Notifications fetched:", notificationsData?.length || 0);

      setUsers(usersData || []);
      setDoctors(doctorsData || []);
      setPharmacists(pharmacistsData || []);
      setPatients(patientsData || []);
      setNotifications(notificationsData || []);

      // Generate analytics data
      generateAnalyticsData(
        usersData || [],
        doctorsData || [],
        pharmacistsData || [],
        patientsData || [],
        notificationsData || []
      );

      console.log("🎉 All data fetched successfully!");
    } catch (error: any) {
      console.error("❌ Error fetching admin data:", error);
      if (error?.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      }
      toast.error(`Failed to load dashboard data: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (
    usersData: User[],
    doctorsData: Doctor[],
    pharmacistsData: Pharmacist[],
    patientsData: Patient[],
    notificationsData: Notification[]
  ) => {
    // User distribution data
    const adminUsers = usersData.filter((user) => user.User_Type === "Admin");
    const userDistribution = [
      { name: "Doctors", value: doctorsData.length, color: "#8B5CF6" },
      { name: "Patients", value: patientsData.length, color: "#06B6D4" },
      { name: "Pharmacists", value: pharmacistsData.length, color: "#10B981" },
      { name: "Admins", value: adminUsers.length, color: "#F59E0B" },
    ];

    // Generate monthly registration data (mock data for demo)
    const monthlyRegistrations = [
      { month: "Jan", doctors: 12, patients: 45, pharmacists: 8, total: 65 },
      { month: "Feb", doctors: 15, patients: 52, pharmacists: 6, total: 73 },
      { month: "Mar", doctors: 18, patients: 38, pharmacists: 10, total: 66 },
      { month: "Apr", doctors: 22, patients: 41, pharmacists: 7, total: 70 },
      { month: "May", doctors: 20, patients: 55, pharmacists: 9, total: 84 },
      { month: "Jun", doctors: 25, patients: 48, pharmacists: 11, total: 84 },
      {
        month: "Jul",
        doctors: doctorsData.length > 25 ? doctorsData.length - 25 : 8,
        patients: patientsData.length > 48 ? patientsData.length - 48 : 35,
        pharmacists:
          pharmacistsData.length > 11 ? pharmacistsData.length - 11 : 5,
        total:
          (doctorsData.length > 25 ? doctorsData.length - 25 : 8) +
          (patientsData.length > 48 ? patientsData.length - 48 : 35) +
          (pharmacistsData.length > 11 ? pharmacistsData.length - 11 : 5),
      },
    ];

    // Generate revenue data (mock data for demo)
    const revenueData = [
      { month: "Jan", revenue: 12500, appointments: 125, prescriptions: 89 },
      { month: "Feb", revenue: 15200, appointments: 142, prescriptions: 98 },
      { month: "Mar", revenue: 13800, appointments: 138, prescriptions: 76 },
      { month: "Apr", revenue: 16900, appointments: 156, prescriptions: 112 },
      { month: "May", revenue: 18500, appointments: 171, prescriptions: 134 },
      { month: "Jun", revenue: 20100, appointments: 189, prescriptions: 145 },
      { month: "Jul", revenue: 22300, appointments: 201, prescriptions: 167 },
    ];

    setAnalyticsData({
      userDistribution,
      monthlyRegistrations,
      revenueData,
    });
  };

  const fetchAvailableUsers = async () => {
    try {
      const allUsers = await userApi.listUsers();
      console.log("📋 All users fetched:", allUsers);

      if (registrationTab === "doctor") {
        // Filter out users who already have doctor profiles
        const existingDoctorUserIds = doctors.map((doctor) => doctor.User_id);
        console.log("🏥 Existing doctor User_ids:", existingDoctorUserIds);

        const availableDoctorUsers = allUsers.filter(
          (user) =>
            user.User_Type === "Doctor" &&
            !existingDoctorUserIds.includes(user.User_id)
        );
        console.log("✅ Available doctor users:", availableDoctorUsers);
        setAvailableUsers(availableDoctorUsers);
      } else if (registrationTab === "pharmacist") {
        // Filter out users who already have pharmacist profiles
        const existingPharmacistUserIds = pharmacists.map(
          (pharmacist) => pharmacist.User_id
        );
        const availablePharmacistUsers = allUsers.filter(
          (user) =>
            user.User_Type === "Pharmacist" &&
            !existingPharmacistUserIds.includes(user.User_id)
        );
        setAvailableUsers(availablePharmacistUsers);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
      toast.error("Failed to load available users");
    }
  };

  const handleCreateUser = async () => {
    try {
      if (
        !newUser.First_Name ||
        !newUser.Last_Name ||
        !newUser.Email ||
        !newUser.User_Type ||
        !newUser.Gender
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Check if user with this email already exists
      if (isEmailTaken(newUser.Email)) {
        toast.error(
          `A user with email ${newUser.Email} already exists. Please use a different email or select the existing user.`
        );
        return;
      }

      // Step 1: Create user account
      const userData = {
        First_Name: newUser.First_Name,
        Last_Name: newUser.Last_Name,
        Email: newUser.Email,
        Phone_Number: newUser.Phone_Number,
        Date_of_Birth: newUser.Date_Of_Birth,
        Gender: newUser.Gender as "Male" | "Female" | "Other",
        Password: newUser.Password || "TempPass123!", // Default password
        User_Type: newUser.User_Type as "Doctor" | "Pharmacist",
      };

      const createdUser = await userApi.create(userData);
      toast.success(
        "User account created successfully! Now proceeding to step 2..."
      );

      // Store the created user ID and move to step 2
      const userId = createdUser.user?.User_id;
      setCreatedUserId(userId);
      setRegistrationStep(2);

      // Set the selected user for the next step
      if (createdUser.user) {
        setSelectedUser(createdUser.user);
      }

      // Reset user form but keep User_Type for context
      setNewUser({
        First_Name: "",
        Last_Name: "",
        Email: "",
        Phone_Number: "",
        Date_Of_Birth: "",
        Gender: "",
        Address: "",
        User_Type: newUser.User_Type,
        Password: "",
      });

      // Refresh data
      await fetchAllData();
      await fetchAvailableUsers();

      return createdUser;
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Handle specific error cases
      if (error?.response?.status === 409) {
        toast.error(
          `A user with this email already exists. Please use a different email address.`
        );
      } else if (error?.response?.status === 400) {
        toast.error(
          `Invalid user data. Please check all fields and try again.`
        );
      } else if (error?.response?.data?.message) {
        toast.error(`Failed to create user: ${error.response.data.message}`);
      } else {
        toast.error("Failed to create user account. Please try again.");
      }
    }
  };

  const handleRegisterDoctor = async () => {
    try {
      if (!selectedUser && !createdUserId) {
        toast.error("Please select a user first or create a new user");
        return;
      }

      // Validate required doctor fields
      if (
        !newDoctor.License_number ||
        !newDoctor.Specialization ||
        !newDoctor.Qualification
      ) {
        toast.error(
          "Please fill in all required doctor fields (License Number, Specialization, Qualification)"
        );
        return;
      }

      // Get the user data - either from selectedUser or find the newly created one
      let userData = selectedUser;
      if (!userData && createdUserId) {
        userData = users.find((user) => user.User_id === createdUserId) || null;
      }

      if (!userData) {
        toast.error("Could not find user data. Please try again.");
        return;
      }

      // Validate required fields before sending
      if (!userData.Email || !userData.First_Name || !userData.Last_Name) {
        toast.error(
          "User information is incomplete. Please select a valid user."
        );
        return;
      }

      if (
        !newDoctor.License_number ||
        !newDoctor.Specialization ||
        !newDoctor.Password
      ) {
        toast.error(
          "License number, specialization, and password are required."
        );
        return;
      }

      // Since the backend creates both user and doctor together, we need to use the single-step approach
      // but provide the user data we already have
      const doctorData = {
        // User fields required by the backend
        Email: userData.Email,
        Password: newDoctor.Password, // Use the password from the form
        Phone_Number: userData.Phone_Number || "",
        First_Name: userData.First_Name || "",
        Last_Name: userData.Last_Name || "",
        Date_of_Birth: userData.Date_of_Birth || "",
        Gender: userData.Gender || "Other",

        // Doctor-specific fields
        License_number: newDoctor.License_number,
        Specialization: newDoctor.Specialization || "",
        Qualification: newDoctor.Qualification || "",
        Experience_Years: Number(newDoctor.Experience_Years) || 0,
        Department: newDoctor.Department || "",
        Bio: newDoctor.Bio || "",
        Languages_Spoken: newDoctor.Languages_Spoken || "",
        Is_Available_Online: Boolean(newDoctor.Is_Available_Online),
        Rating: Number(newDoctor.Rating) || 0,
        Reviews: newDoctor.Reviews || "",
      };

      console.log("🏥 Creating doctor with registration data:", doctorData);

      // If we have a user that was already created (either selected or newly created),
      // we need to delete it first since the doctor API will create a new user
      if (userData.User_id) {
        try {
          await userApi.deleteAccount(userData.User_id.toString());
          console.log("✅ Deleted existing user before doctor creation");
        } catch (deleteError) {
          console.warn("Could not delete existing user:", deleteError);
          // Continue anyway - the backend might handle duplicates
        }
      }

      // Create the doctor (which will create both user and doctor)
      await doctorApi.create(doctorData);
      toast.success("Doctor registered successfully!");

      // Reset form and states
      setSelectedUser(null);
      setCreatedUserId(null);
      setRegistrationStep(1);
      setNewDoctor({
        User_id: "",
        License_number: "",
        Password: "",
        Specialization: "",
        Qualification: "",
        Experience_Years: 0,
        Department: "",
        Bio: "",
        Languages_Spoken: "",
        Is_Available_Online: false,
        Rating: 0,
        Reviews: "",
      });

      setIsRegistrationSheetOpen(false);

      // Refresh data
      await fetchAllData();
      await fetchAvailableUsers();
    } catch (error: any) {
      console.error("Error registering doctor:", error);

      let errorMessage = "Failed to register doctor";

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.details) {
          errorMessage = error.response.data.details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`Registration failed: ${errorMessage}`);
    }
  };

  const handleRegisterPharmacist = async () => {
    try {
      if (!selectedUser) {
        toast.error("Please select a user first");
        return;
      }

      const pharmacistData: any = {
        User_id: selectedUser.User_id,
        Pharmacy_Name: newPharmacist.Pharmacy_Name,
        License_Number: newPharmacist.License_Number,
        Phone_Number: selectedUser.Phone_Number,
        Email: selectedUser.Email,
        Opening_Time: newPharmacist.Opening_Time,
        Closing_Time: newPharmacist.Closing_Time,
        Delivery_Available: newPharmacist.Delivery_Available,
        Is_Verified: newPharmacist.Is_Verified,
        Rating: Number(newPharmacist.Rating),
      };

      await pharmacistApi.create(pharmacistData);
      toast.success("Pharmacist registered successfully!");

      // Reset form
      setSelectedUser(null);
      setNewPharmacist({
        User_id: "",
        Pharmacy_Name: "",
        License_Number: "",
        Phone_Number: "",
        Email: "",
        Opening_Time: "",
        Closing_Time: "",
        Delivery_Available: false,
        Is_Verified: false,
        Rating: 0,
      });

      setIsRegistrationSheetOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error registering pharmacist:", error);
      toast.error("Failed to register pharmacist");
    }
  };

  // User management operations
  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await userApi.deleteAccount(userId.toString());
      toast.success("User deleted successfully!");
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number, suspend: boolean) => {
    try {
      setLoading(true);
      await userApi.updateProfile(userId.toString(), {
        Account_Status: suspend ? "InActive" : "Active",
      });
      toast.success(
        `User ${suspend ? "suspended" : "activated"} successfully!`
      );
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 border-purple-100 card-purple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {users.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 border-purple-100 card-purple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {doctors.length}
            </div>
            <p className="text-xs text-muted-foreground">Registered doctors</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 border-purple-100 card-purple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pharmacists</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {pharmacists.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered pharmacists
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 border-purple-100 card-purple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {patients.length}
            </div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Section */}
      <Card className="border-purple-200/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Professional Registration
          </CardTitle>
          <CardDescription className="text-purple-700">
            Register doctors and pharmacists after creating their user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Sheet
              open={isRegistrationSheetOpen}
              onOpenChange={setIsRegistrationSheetOpen}
            >
              <SheetTrigger asChild>
                <Button
                  className="bg-purple-500 hover:bg-purple-700 text-white btn-purple-glow"
                  onClick={handleOpenRegistrationSheet}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register Professionals
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-2xl bg-gradient-to-br from-white to-purple-50 border-purple-300/50 sheet-glow sheet-content overflow-y-auto max-h-screen">
                <div className="h-full flex flex-col">
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle className="text-purple-900">
                      Professional Registration
                    </SheetTitle>
                    <SheetDescription className="text-purple-700">
                      Create user accounts and register them as doctors or
                      pharmacists
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto min-h-0 pt-6">
                    <Tabs
                      value={registrationTab}
                      onValueChange={(value) =>
                        setRegistrationTab(value as RegistrationTabType)
                      }
                      className="h-full flex flex-col"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-purple-100 dark:bg-gray-800 flex-shrink-0">
                        <TabsTrigger
                          value="doctor"
                          className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-purple-200 dark:border-gray-600 text-purple-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-200 data-[state=active]:to-purple-100 dark:data-[state=active]:from-purple-600 dark:data-[state=active]:to-purple-500 data-[state=active]:text-purple-800 dark:data-[state=active]:text-white data-[state=active]:border-purple-300 dark:data-[state=active]:border-purple-400"
                        >
                          Doctor Registration
                        </TabsTrigger>
                        <TabsTrigger
                          value="pharmacist"
                          className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-purple-200 dark:border-gray-600 text-purple-700 dark:text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-200 data-[state=active]:to-purple-100 dark:data-[state=active]:from-purple-600 dark:data-[state=active]:to-purple-500 data-[state=active]:text-purple-800 dark:data-[state=active]:text-white data-[state=active]:border-purple-300 dark:data-[state=active]:border-purple-400"
                        >
                          Pharmacist Registration
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto min-h-0 pt-4">
                        <TabsContent
                          value="doctor"
                          className="space-y-4 h-full m-0"
                        >
                          <div className="pb-6">
                            {renderDoctorRegistrationForm()}
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="pharmacist"
                          className="space-y-4 h-full m-0"
                        >
                          <div className="pb-6">
                            {renderPharmacistRegistrationForm()}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-purple-200/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Activity className="h-5 w-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  No recent notifications
                </span>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => {
                const getIcon = (type: string) => {
                  switch (type) {
                    case "appointment":
                      return <Calendar className="h-4 w-4 text-blue-500" />;
                    case "prescription":
                      return <Pill className="h-4 w-4 text-green-500" />;
                    case "billing":
                      return <CreditCard className="h-4 w-4 text-orange-500" />;
                    default:
                      return <Bell className="h-4 w-4 text-purple-500" />;
                  }
                };

                const getBgColor = (type: string) => {
                  switch (type) {
                    case "appointment":
                      return "bg-blue-50 border-blue-200";
                    case "prescription":
                      return "bg-green-50 border-green-200";
                    case "billing":
                      return "bg-orange-50 border-orange-200";
                    default:
                      return "bg-purple-50 border-purple-200";
                  }
                };

                const getTextColor = (type: string) => {
                  switch (type) {
                    case "appointment":
                      return "text-blue-800";
                    case "prescription":
                      return "text-green-800";
                    case "billing":
                      return "text-orange-800";
                    default:
                      return "text-purple-800";
                  }
                };

                return (
                  <div
                    key={notification.Notification_id}
                    className={`flex items-start gap-3 p-3 border rounded-lg ${getBgColor(
                      notification.Type
                    )}`}
                  >
                    {getIcon(notification.Type)}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${getTextColor(
                          notification.Type
                        )}`}
                      >
                        {notification.Title}
                      </p>
                      <p
                        className={`text-xs ${getTextColor(
                          notification.Type
                        )} opacity-80 mt-1`}
                      >
                        {notification.Message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.Created_at).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.Created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {notification.Status === "unread" && (
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                    )}
                  </div>
                );
              })
            )}

            {/* System status */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-800">
                System operational - all services running
              </span>
            </div>

            {/* Show link to view all notifications if there are more than 5 */}
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-800"
                >
                  View all {notifications.length} notifications
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserCreationForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Step 1: Create User Account</CardTitle>
        <CardDescription>
          Create a basic user account first, then register as professional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={newUser.First_Name}
              onChange={(e) =>
                setNewUser({ ...newUser, First_Name: e.target.value })
              }
              placeholder="John"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={newUser.Last_Name}
              onChange={(e) =>
                setNewUser({ ...newUser, Last_Name: e.target.value })
              }
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.Email}
              onChange={(e) => {
                setNewUser({ ...newUser, Email: e.target.value });
              }}
              placeholder="john.doe@email.com"
              className={
                isEmailTaken(newUser.Email)
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {isEmailTaken(newUser.Email) && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ This email is already registered. Please use a different
                email.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={newUser.Phone_Number}
              onChange={(e) =>
                setNewUser({ ...newUser, Phone_Number: e.target.value })
              }
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userType">User Type *</Label>
            <Select
              value={newUser.User_Type}
              onValueChange={(value) =>
                setNewUser({
                  ...newUser,
                  User_Type: value as "Doctor" | "Pharmacist",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Pharmacist">Pharmacist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={newUser.Gender}
              onValueChange={(value) =>
                setNewUser({
                  ...newUser,
                  Gender: value as "Male" | "Female" | "Other",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={newUser.Date_Of_Birth}
            onChange={(e) =>
              setNewUser({ ...newUser, Date_Of_Birth: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={newUser.Address}
            onChange={(e) =>
              setNewUser({ ...newUser, Address: e.target.value })
            }
            placeholder="123 Main St, City, State"
          />
        </div>

        <Button
          onClick={handleCreateUser}
          className="w-full"
          disabled={
            !newUser.First_Name ||
            !newUser.Last_Name ||
            !newUser.Email ||
            !newUser.User_Type ||
            !newUser.Gender ||
            isEmailTaken(newUser.Email)
          }
        >
          Create User Account
        </Button>

        {newUser.User_Type && getAvailableUsersCount() > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">💡 Information:</p>
            <p className="text-sm text-blue-700 mt-1">
              There are {getAvailableUsersCount()} existing{" "}
              {newUser.User_Type.toLowerCase()} user(s) without professional
              profiles. You can proceed with either approach:
            </p>
            <div className="mt-2 space-y-1 text-sm text-blue-700">
              <p>
                • <strong>Option 1:</strong> Create a new user account above,
                then complete the professional registration
              </p>
              <p>
                • <strong>Option 2:</strong> Skip to step 2 to register an
                existing user (system will recreate the account with
                professional details)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRegistrationStep(2)}
              className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Skip to Step 2 →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDoctorRegistrationForm = () => {
    // Debug logging
    console.log("🔄 Rendering doctor registration form");
    console.log("  • Registration Step:", registrationStep);
    console.log("  • Created User ID:", createdUserId);
    console.log("  • Selected User:", selectedUser);
    console.log("  • Available Users:", availableUsers.length);
    console.log("  • Show form fields?", !!(selectedUser || createdUserId));

    return (
      <div className="space-y-6">
        {/* Add debug info at the top */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <strong>🔍 Registration State:</strong>
          <br />• Step: {registrationStep} | Created: {createdUserId || "None"}{" "}
          | Selected: {selectedUser?.Email || "None"}
          <br />• Available: {availableUsers.length} | Will show form:{" "}
          {!!(selectedUser || createdUserId) ? "Yes" : "No"}
        </div>

        {registrationStep === 1 && renderUserCreationForm()}

        {registrationStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Register as Doctor</CardTitle>
              <CardDescription>
                {createdUserId
                  ? "Complete the doctor profile for the newly created user"
                  : "Select an existing doctor user and complete their professional profile"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!createdUserId && (
                <div>
                  <Label htmlFor="doctorUser">Select Doctor User *</Label>
                  <Select
                    value={selectedUser?.User_id.toString() || ""}
                    onValueChange={(value) => {
                      console.log("🔄 User selection changed to:", value);
                      const user = availableUsers.find(
                        (u) => u.User_id.toString() === value
                      );
                      console.log("🔄 Found user:", user);
                      setSelectedUser(user || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor user account" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          No available doctor users found - please create a user
                          first in Step 1
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem
                            key={user.User_id}
                            value={user.User_id.toString()}
                          >
                            {user.First_Name} {user.Last_Name} ({user.Email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {availableUsers.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>No available doctor users found.</strong>{" "}
                        Please go back to Step 1 to create a new user account
                        first, or ensure there are existing Doctor-type users
                        without doctor profiles.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRegistrationStep(1)}
                          className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                        >
                          ← Go Back to Step 1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRegistrationStep(1);
                            setNewUser((prev) => ({
                              ...prev,
                              User_Type: "Doctor",
                            }));
                          }}
                          className="text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                          🏥 Create Doctor User
                        </Button>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                        <strong>Debug Info:</strong>
                        <br />• Total users: {users.length}
                        <br />• Doctor-type users:{" "}
                        {users.filter((u) => u.User_Type === "Doctor").length}
                        <br />• Existing doctor profiles: {doctors.length}
                        <br />• Available for registration:{" "}
                        {availableUsers.length}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(selectedUser || createdUserId) && (
                <>
                  {/* Debug section to show current state */}
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Ready to complete doctor registration
                    </p>
                    <div className="text-xs text-green-700 mt-1">
                      {createdUserId && (
                        <p>• Using newly created user (ID: {createdUserId})</p>
                      )}
                      {selectedUser && (
                        <p>
                          • Selected user: {selectedUser.First_Name}{" "}
                          {selectedUser.Last_Name} ({selectedUser.Email})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={newDoctor.License_number}
                        onChange={(e) =>
                          setNewDoctor((prev) => ({
                            ...prev,
                            License_number: e.target.value,
                          }))
                        }
                        placeholder="Enter medical license number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Input
                        id="specialization"
                        value={newDoctor.Specialization}
                        onChange={(e) =>
                          setNewDoctor((prev) => ({
                            ...prev,
                            Specialization: e.target.value,
                          }))
                        }
                        placeholder="e.g., Cardiology, Dermatology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label htmlFor="doctorPassword">Password *</Label>
                      <Input
                        id="doctorPassword"
                        type="password"
                        value={newDoctor.Password}
                        onChange={(e) =>
                          setNewDoctor((prev) => ({
                            ...prev,
                            Password: e.target.value,
                          }))
                        }
                        placeholder="Enter password for doctor login"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This password will be used by the doctor to log into
                        their account
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qualification">Qualification *</Label>
                      <Input
                        id="qualification"
                        value={newDoctor.Qualification}
                        onChange={(e) =>
                          setNewDoctor((prev) => ({
                            ...prev,
                            Qualification: e.target.value,
                          }))
                        }
                        placeholder="e.g., MBBS, MD"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={newDoctor.Experience_Years}
                        onChange={(e) =>
                          setNewDoctor((prev) => ({
                            ...prev,
                            Experience_Years: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="Years of practice"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newDoctor.Department}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({
                          ...prev,
                          Department: e.target.value,
                        }))
                      }
                      placeholder="Hospital department"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={newDoctor.Bio}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({
                          ...prev,
                          Bio: e.target.value,
                        }))
                      }
                      placeholder="Professional bio and achievements"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input
                      id="languages"
                      value={newDoctor.Languages_Spoken}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({
                          ...prev,
                          Languages_Spoken: e.target.value,
                        }))
                      }
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="onlineAvailable"
                      checked={newDoctor.Is_Available_Online}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({
                          ...prev,
                          Is_Available_Online: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-purple-600"
                    />
                    <Label htmlFor="onlineAvailable">
                      Available for online consultations
                    </Label>
                  </div>

                  <Button
                    onClick={handleRegisterDoctor}
                    className="w-full"
                    // disabled={
                    //   !newDoctor.License_number ||
                    //   !newDoctor.Specialization ||
                    //   !newDoctor.Password
                    // }
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Complete Doctor Registration
                  </Button>
                </>
              )}

              {!createdUserId && !selectedUser && availableUsers.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    👆 Please select a doctor user from the dropdown above to
                    continue with the registration.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    The Complete Doctor Registration button will appear once you
                    select a user.
                  </p>
                  <div className="mt-2 p-2 bg-white border border-blue-300 rounded text-xs">
                    <strong>Current State:</strong>
                    <br />• Created User ID: {createdUserId || "None"}
                    <br />• Selected User:{" "}
                    {selectedUser && (selectedUser as User).First_Name
                      ? `${(selectedUser as User).First_Name} ${(selectedUser as User).Last_Name}`
                      : "None"}
                    <br />• Available Users: {availableUsers.length}
                    <br />• Registration Step: {registrationStep}
                  </div>
                </div>
              )}

              {!createdUserId &&
                !selectedUser &&
                availableUsers.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ No available doctor users found for registration.
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      All doctor-type users already have doctor profiles, or no
                      doctor users exist.
                    </p>
                    <div className="mt-2 p-2 bg-white border border-yellow-300 rounded text-xs">
                      <strong>Current State:</strong>
                      <br />• Total Users: {users.length}
                      <br />• Doctor-type Users:{" "}
                      {users.filter((u) => u.User_Type === "Doctor").length}
                      <br />• Existing Doctor Profiles: {doctors.length}
                      <br />• Available for Registration:{" "}
                      {availableUsers.length}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRegistrationStep(1)}
                      className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      ← Go Back to Step 1 to Create New User
                    </Button>
                  </div>
                )}

              {/* Debug: Always visible button for testing */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-800 font-medium mb-2">
                  🔧 Debug Section (Always Visible)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>Created User ID: {createdUserId || "None"}</div>
                  <div>Selected User: {selectedUser?.First_Name || "None"}</div>
                  <div>Available Users: {availableUsers.length}</div>
                  <div>Registration Step: {registrationStep}</div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      // Create a temporary mock user for testing
                      const mockUser = {
                        User_id: 999,
                        First_Name: "Test",
                        Last_Name: "Doctor",
                        Email: "test.doctor@example.com",
                        Phone_Number: "1234567890",
                        Date_of_Birth: "1990-01-01",
                        Gender: "Male" as "Male" | "Female" | "Other",
                        User_Type: "Doctor" as "Doctor" | "Pharmacist",
                        Account_Status: "Active" as "Active",
                        Password: "",
                        Address: "",
                        Created_at: new Date(), 
                        Created_At: new Date(),
                        Updated_At: new Date(),
                      };
                      setSelectedUser(mockUser);
                      console.log(
                        "🔧 Mock user selected for testing:",
                        mockUser
                      );
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    🔧 Select Mock User for Testing
                  </Button>
                  <Button
                    onClick={handleRegisterDoctor}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                    size="sm"
                  >
                    🔧 Force Doctor Registration (With Current Data)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPharmacistRegistrationForm = () => (
    <div className="space-y-6">
      {registrationStep === 1 && renderUserCreationForm()}

      {registrationStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Register as Pharmacist</CardTitle>
            <CardDescription>
              {createdUserId
                ? "Complete the pharmacist profile for the newly created user"
                : "Select an existing pharmacist user and complete their professional profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!createdUserId && (
              <div>
                <Label htmlFor="pharmacistUser">Select Pharmacist User *</Label>
                <Select
                  value={selectedUser?.User_id.toString() || ""}
                  onValueChange={(value) => {
                    const user = availableUsers.find(
                      (u: User) => u.User_id.toString() === value
                    );
                    setSelectedUser(user || null);
                    if (user) {
                      setNewPharmacist({
                        ...newPharmacist,
                        Phone_Number: user.Phone_Number,
                        Email: user.Email,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pharmacist user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        No available pharmacist users found
                      </SelectItem>
                    ) : (
                      availableUsers.map((user: User) => (
                        <SelectItem
                          key={user.User_id}
                          value={user.User_id.toString()}
                        >
                          {user.First_Name} {user.Last_Name} ({user.Email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedUser || createdUserId) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                    <Input
                      id="pharmacyName"
                      value={newPharmacist.Pharmacy_Name}
                      onChange={(e) =>
                        setNewPharmacist({
                          ...newPharmacist,
                          Pharmacy_Name: e.target.value,
                        })
                      }
                      placeholder="HealthPlus Pharmacy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pharmacyLicense">License Number *</Label>
                    <Input
                      id="pharmacyLicense"
                      value={newPharmacist.License_Number}
                      onChange={(e) =>
                        setNewPharmacist({
                          ...newPharmacist,
                          License_Number: e.target.value,
                        })
                      }
                      placeholder="PH12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openingTime">Opening Time *</Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={newPharmacist.Opening_Time}
                      onChange={(e) =>
                        setNewPharmacist({
                          ...newPharmacist,
                          Opening_Time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="closingTime">Closing Time *</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={newPharmacist.Closing_Time}
                      onChange={(e) =>
                        setNewPharmacist({
                          ...newPharmacist,
                          Closing_Time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deliveryAvailable"
                    checked={newPharmacist.Delivery_Available}
                    onChange={(e) =>
                      setNewPharmacist({
                        ...newPharmacist,
                        Delivery_Available: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="deliveryAvailable">
                    Delivery service available
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={newPharmacist.Is_Verified}
                    onChange={(e) =>
                      setNewPharmacist({
                        ...newPharmacist,
                        Is_Verified: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isVerified">Pharmacy is verified</Label>
                </div>

                <Button
                  onClick={handleRegisterPharmacist}
                  className="w-full"
                  disabled={
                    !newPharmacist.Pharmacy_Name ||
                    !newPharmacist.License_Number
                  }
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Complete Pharmacist Registration
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Manage all registered users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.User_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold">
                  {user.First_Name} {user.Last_Name}
                </h3>
                <p className="text-sm text-muted-foreground">{user.Email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{user.User_Type}</Badge>
                  <Badge
                    variant={
                      user.Account_Status === "Active"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {user.Account_Status || "Active"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground mr-4">
                  ID: {user.User_id}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSuspendUser(
                        user.User_id,
                        user.Account_Status !== "InActive"
                      )
                    }
                    disabled={loading}
                  >
                    {user.Account_Status === "InActive"
                      ? "Activate"
                      : "Suspend"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.User_id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDoctors = () => (
    <Card>
      <CardHeader>
        <CardTitle>Registered Doctors</CardTitle>
        <CardDescription>All doctors registered in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doctors.map((doctor) => {
            // Find the corresponding user
            const doctorUser = users.find((u) => u.User_id === doctor.User_id);
            return (
              <div
                key={doctor.Doctor_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">
                    Dr. {doctorUser?.First_Name || "Unknown"}{" "}
                    {doctorUser?.Last_Name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor.Specialization}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.Department}
                  </p>
                  <Badge variant="outline">
                    {doctor.Experience_Years} years experience
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  License: {doctor.License_number}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderPharmacists = () => (
    <Card>
      <CardHeader>
        <CardTitle>Registered Pharmacists</CardTitle>
        <CardDescription>
          All pharmacists registered in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pharmacists.map((pharmacist) => (
            <div
              key={pharmacist.Pharmacy_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{pharmacist.Pharmacy_Name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pharmacist.Email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pharmacist.Opening_Time} - {pharmacist.Closing_Time}
                </p>
                <div className="flex gap-2">
                  <Badge
                    variant={pharmacist.Is_Verified ? "default" : "secondary"}
                  >
                    {pharmacist.Is_Verified ? "Verified" : "Pending"}
                  </Badge>
                  {pharmacist.Delivery_Available && (
                    <Badge variant="outline">Delivery Available</Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                License: {pharmacist.License_Number}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUsers();
      case "doctors":
        return renderDoctors();
      case "pharmacists":
        return renderPharmacists();
      case "patients":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registered Patients</CardTitle>
              <CardDescription>All patients in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => {
                  // Find the corresponding user
                  const patientUser = users.find(
                    (u) => u.User_id === patient.User_id
                  );
                  return (
                    <div
                      key={patient.Patient_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {patientUser?.First_Name ||
                            patient.First_Name ||
                            "Unknown"}{" "}
                          {patientUser?.Last_Name ||
                            patient.Last_Name ||
                            "User"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Blood Group: {patient.Blood_Group}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Emergency Contact: {patient.Emergency_Contact_Name}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {patient.Patient_id}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      case "activity":
        return (
          <div className="space-y-6">
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {analyticsData.revenueData[
                      analyticsData.revenueData.length - 1
                    ]?.revenue.toLocaleString() || "22,300"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Doctors
                  </CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{doctors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +5.4% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Appointments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.revenueData[
                      analyticsData.revenueData.length - 1
                    ]?.appointments || 201}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of users by type across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip
                          formatter={(value: any) => [value, "Users"]}
                          labelFormatter={(name: any) => `${name}`}
                        />
                        <Pie
                          data={analyticsData.userDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {analyticsData.userDistribution.map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {analyticsData.userDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Registrations Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Registrations
                  </CardTitle>
                  <CardDescription>
                    New user registrations by type per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.monthlyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="doctors"
                          stackId="a"
                          fill="#8B5CF6"
                          name="Doctors"
                        />
                        <Bar
                          dataKey="patients"
                          stackId="a"
                          fill="#06B6D4"
                          name="Patients"
                        />
                        <Bar
                          dataKey="pharmacists"
                          stackId="a"
                          fill="#10B981"
                          name="Pharmacists"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Monthly revenue trends and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="revenue" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
                    <TabsTrigger value="services">Service Metrics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="revenue" className="space-y-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: any, name: string) => [
                              name === "revenue"
                                ? `$${value.toLocaleString()}`
                                : value,
                              name === "revenue" ? "Revenue" : name,
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8B5CF6"
                            fill="#8B5CF6"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="appointments"
                            stroke="#06B6D4"
                            strokeWidth={2}
                            name="Appointments"
                          />
                          <Line
                            type="monotone"
                            dataKey="prescriptions"
                            stroke="#10B981"
                            strokeWidth={2}
                            name="Prescriptions"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>
                  Latest system activities and logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      System operational - all services running
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Just now
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {doctors.length} doctors and {patients.length} patients
                      active
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      2 min ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      Database backup completed successfully
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      5 min ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      Monthly revenue target achieved: $22,300
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      1 hour ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 purple-pattern-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 purple-spinner mx-auto mb-4"></div>
          <div className="text-purple-600 font-medium">
            Loading admin dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-auto">
      {/* Background blur overlay when sheet is open */}
      {isRegistrationSheetOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-20 transition-all duration-300" />
      )}

      <div className="relative z-10 space-y-6 p-6 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, registrations, and system overview
            </p>
          </div>

          {/* Debug Section */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={fetchAllData} variant="outline" disabled={loading}>
              {loading ? "Loading..." : "🔄 Refresh Data"}
            </Button>
            <Badge variant={users.length > 0 ? "default" : "destructive"}>
              Users: {users.length}
            </Badge>
            <Badge variant={doctors.length > 0 ? "default" : "destructive"}>
              Doctors: {doctors.length}
            </Badge>
            <Badge variant={pharmacists.length > 0 ? "default" : "destructive"}>
              Pharmacists: {pharmacists.length}
            </Badge>
            <Badge variant={patients.length > 0 ? "default" : "destructive"}>
              Patients: {patients.length}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b overflow-x-auto">
          <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "doctors", label: "Doctors", icon: Stethoscope },
              { id: "pharmacists", label: "Pharmacists", icon: ShoppingBag },
              { id: "patients", label: "Patients", icon: Users },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTabType)}
                  className={`transition-all duration-300 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-700 bg-gradient-to-b from-purple-50 to-purple-25 nav-tab-active"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gradient-to-b hover:from-purple-25 hover:to-purple-10"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
