import type { Pharmacist } from "@/api/interfaces/pharmacist";
import type { MedicineOrder } from "@/api/interfaces/orders";
import type { PharmacyInventory } from "@/api/interfaces/pharmacyInventory";
import type { User } from "@/api/interfaces/user";
import { pharmacistApi } from "@/api/pharmacists";
import { pharmacyApi } from "@/api/pharmacies";
import { pharmacyInventoryApi } from "@/api/pharmacyInventory";
import { medicineOrderApi } from "@/api/medicineOrders";
import { userApi } from "@/api/users";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Package,
  Building2,
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type TabType = "Activity" | "Inventory" | "Orders" | "Pharmacies";

const PharmacistDashBoard = () => {
  //state management.
  const { user } = useAuth();
  const [currentPharmacyId, setCurrentPharmacyId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabType>("Activity");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacist[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState<
    { name: string; value: number }[]
  >([]);
  const [inventory, setInventory] = useState<PharmacyInventory[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [availablePharmacists, setAvailablePharmacists] = useState<User[]>([]);
  const [pharmacistsLoading, setPharmacistsLoading] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<User | null>(
    null
  );
  const [newPharmacy, setNewPharmacy] = useState({
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

  useEffect(() => {
    const fetchCurrentPharmacy = async () => {
      if (!user?.User_id || user.User_Type !== "Pharmacist") {
        console.log("User is not a pharmacist or not logged in:", user);
        return;
      }

      try {
        console.log(`Fetching pharmacy for user ID: ${user.User_id}`);
        const pharmacy = await pharmacistApi.getByUserId(user.User_id);
        console.log("Pharmacy found:", pharmacy);
        setCurrentPharmacyId(pharmacy.Pharmacy_id);
      } catch (error) {
        console.error("Error fetching current pharmacy:", error);
        toast.error("Failed to load pharmacy information");
      }
    };

    fetchCurrentPharmacy();
  }, [user]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);
        const pharmacyData = await pharmacistApi.getAll();
        setPharmacies(pharmacyData);
      } catch (error: any) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch pharmacies"
        );
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentPharmacyId) return;

      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const orderData = await medicineOrderApi.findByPharmacy(
          currentPharmacyId
        );
        setOrders(orderData);
      } catch (error: any) {
        setOrdersError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        );
        console.error("Error fetching orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [currentPharmacyId]);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!currentPharmacyId) {
        console.log("No pharmacy ID available for inventory fetch");
        return;
      }

      try {
        console.log(`Fetching inventory for pharmacy ID: ${currentPharmacyId}`);
        setInventoryLoading(true);
        setInventoryError(null);
        const inventoryData = await pharmacyInventoryApi.findByPharmacy(
          currentPharmacyId
        );
        console.log("Inventory data received:", inventoryData);
        setInventory(inventoryData);
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch inventory";
        console.error("Error fetching inventory:", error);
        setInventoryError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setInventoryLoading(false);
      }
    };
    fetchInventory();
  }, [currentPharmacyId]);

  useEffect(() => {
    if (orders.length > 0) {
      //order statistics.
      const statusCounts: Record<string, number> = {};
      orders.forEach((order) => {
        const status = order.Order_Status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const orderStatsData = Object.entries(statusCounts).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      setOrderStats(orderStatsData);
    }
  }, [orders]);

  // Fetch available pharmacists when sheet opens
  useEffect(() => {
    const fetchAvailablePharmacists = async () => {
      if (!isSheetOpen) return;

      try {
        setPharmacistsLoading(true);
        console.log("Fetching all users...");

        // Get all users
        const allUsers = await userApi.listUsers();
        console.log("All users fetched:", allUsers);

        // Filter for pharmacist users
        const pharmacistUsers = allUsers.filter(
          (user) => user.User_Type === "Pharmacist"
        );
        console.log("Pharmacist users:", pharmacistUsers);

        // Get existing pharmacies to filter out users who already have pharmacies
        const existingPharmacies = await pharmacistApi.getAll();
        const existingPharmacistIds = existingPharmacies.map(
          (pharmacy) => pharmacy.User_id
        );
        console.log("Existing pharmacist IDs:", existingPharmacistIds);

        // Filter out pharmacists who already have pharmacies
        const availablePharmacistUsers = pharmacistUsers.filter(
          (user) => !existingPharmacistIds.includes(user.User_id)
        );
        console.log("Available pharmacist users:", availablePharmacistUsers);

        setAvailablePharmacists(availablePharmacistUsers);
      } catch (error) {
        console.error("Error fetching available pharmacists:", error);
        toast.error("Failed to load available pharmacists");
      } finally {
        setPharmacistsLoading(false);
      }
    };

    fetchAvailablePharmacists();
  }, [isSheetOpen]);

  const formatTime = (date: Date | string) => {
    if (typeof date === "string") {
      if (date.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return date.slice(0, 5);
      }

      const dateObj = new Date(date);
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPharmacies = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading Pharmacies...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Pharmacies ({pharmacies.length})
          </h2>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add new Pharmacy
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full rounded-lg">
              <SheetHeader>
                <SheetTitle>Add New Pharmacy</SheetTitle>
                <SheetDescription>
                  Fill in the details to register a new pharmacy.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 text-gray-700">
                  <Label htmlFor="pharmacist-select" className="text-right">
                    Select Pharmacist *
                  </Label>
                  <div className="col-span-3">
                    {pharmacistsLoading ? (
                      <div className="text-gray-500">
                        Loading pharmacists...
                      </div>
                    ) : (
                      <Select
                        value={selectedPharmacist?.User_id.toString() || ""}
                        onValueChange={(value) => {
                          const selected = availablePharmacists.find(
                            (user) => user.User_id.toString() === value
                          );
                          setSelectedPharmacist(selected || null);
                          setNewPharmacy({
                            ...newPharmacy,
                            User_id: value,
                            Email: selected?.Email || "",
                            Phone_Number: selected?.Phone_Number || "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a pharmacist user" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePharmacists.length === 0 ? (
                            <SelectItem value="no-users" disabled>
                              No available pharmacist users found
                            </SelectItem>
                          ) : (
                            availablePharmacists.map((user) => (
                              <SelectItem
                                key={user.User_id}
                                value={user.User_id.toString()}
                              >
                                {user.First_Name} {user.Last_Name} ({user.Email}
                                )
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedPharmacist && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {selectedPharmacist.First_Name}{" "}
                        {selectedPharmacist.Last_Name}
                        <br />
                        User ID: {selectedPharmacist.User_id}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4 text-gray-700">
                  <Label htmlFor="pharmacy-name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="pharmacy-name"
                    value={newPharmacy.Pharmacy_Name}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Pharmacy_Name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Pharmacy name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="license" className="text-right">
                    License *
                  </Label>
                  <Input
                    id="license"
                    value={newPharmacy.License_Number}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        License_Number: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="License number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={newPharmacy.Phone_Number}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Phone_Number: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Phone number"
                    readOnly={!!selectedPharmacist}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPharmacy.Email}
                    onChange={(e) =>
                      setNewPharmacy({ ...newPharmacy, Email: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Email address"
                    readOnly={!!selectedPharmacist}
                  />
                  {selectedPharmacist && (
                    <div className="col-span-3 col-start-2 text-xs text-gray-500">
                      Email and phone auto-filled from user profile
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opening-time" className="text-right">
                    Opening Time *
                  </Label>
                  <Input
                    id="opening-time"
                    type="time"
                    value={newPharmacy.Opening_Time}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Opening_Time: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="closing-time" className="text-right">
                    Closing Time *
                  </Label>
                  <Input
                    id="closing-time"
                    type="time"
                    value={newPharmacy.Closing_Time}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Closing_Time: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="delivery" className="text-right">
                    Delivery Available
                  </Label>
                  <Input
                    id="delivery"
                    type="checkbox"
                    checked={newPharmacy.Delivery_Available}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Delivery_Available: e.target.checked,
                      })
                    }
                    className="col-span-3 w-4 h-4"
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      console.log("Creating pharmacy:", newPharmacy);
                      toast("Adding pharmacy...");

                      // Validate required fields
                      if (
                        !selectedPharmacist ||
                        !newPharmacy.Pharmacy_Name ||
                        !newPharmacy.License_Number ||
                        !newPharmacy.Phone_Number ||
                        !newPharmacy.Email ||
                        !newPharmacy.Opening_Time ||
                        !newPharmacy.Closing_Time
                      ) {
                        toast.error(
                          "Please fill in all required fields (marked with *) and select a pharmacist"
                        );
                        return;
                      }

                      const pharmacyData = {
                        ...newPharmacy,
                        User_id: selectedPharmacist.User_id,
                        Rating: newPharmacy.Rating || 0,
                      };

                      await pharmacyApi.create(pharmacyData);
                      toast.success("Pharmacy created successfully!");

                      // Reset form
                      setSelectedPharmacist(null);
                      setNewPharmacy({
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

                      // Refresh pharmacies list
                      const updatedPharmacies = await pharmacistApi.getAll();
                      setPharmacies(updatedPharmacies);

                      setIsSheetOpen(false);
                    } catch (error) {
                      console.error("Error creating pharmacy:", error);
                      toast.error("Failed to create pharmacy");
                    }
                  }}
                  className="mt-4 bg-purple-500 hover:bg-purple-700"
                >
                  Create Pharmacy
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {pharmacies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No Pharmacies found.
          </div>
        ) : (
          <div className="grid gap-4">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.Pharmacy_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      User: {pharmacy.User_id}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Pharmacy Name:
                        </span>
                        {pharmacy.Pharmacy_Name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          License Number:
                        </span>
                        {pharmacy.License_Number}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs">
                        {pharmacy.Phone_Number}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Email: {pharmacy.Email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Closing Time: {formatTime(pharmacy.Closing_Time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Delivery Available: {pharmacy.Delivery_Available}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Verification: {pharmacy.Is_Verified}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Rating: {pharmacy.Rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => {
    if (!currentPharmacyId && user?.User_Type === "Pharmacist") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            No pharmacy found for your account. Please contact an administrator
            to set up your pharmacy.
          </div>
        </div>
      );
    }

    if (ordersLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading orders...</div>
        </div>
      );
    }

    if (ordersError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {ordersError}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Orders ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.Order_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Order #{order.Order_id}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Patient ID: {order.Patient_id}</span>
                      <span className="font-medium">${order.Total_Amount}</span>
                      <span>
                        {new Date(order.Order_Date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.Order_Status === "Pending" && (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                    {order.Order_Status === "Delivered" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {(order.Order_Status === "Processing" ||
                      order.Order_Status === "Shipped") && (
                      <Package className="w-4 h-4 text-blue-500" />
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.Order_Status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.Order_Status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.Order_Status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => {
    console.log("renderInventory called with:", {
      currentPharmacyId,
      userType: user?.User_Type,
      inventoryLoading,
      inventoryError,
      inventoryLength: inventory.length,
      inventory: inventory,
    });

    if (!currentPharmacyId && user?.User_Type === "Pharmacist") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            No pharmacy found for your account. Please contact an administrator
            to set up your pharmacy.
          </div>
        </div>
      );
    }

    if (inventoryLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading inventory...</div>
        </div>
      );
    }

    if (inventoryError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {inventoryError}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Inventory ({inventory.length})
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                if (currentPharmacyId) {
                  setInventoryLoading(true);
                  try {
                    const inventoryData =
                      await pharmacyInventoryApi.findByPharmacy(
                        currentPharmacyId
                      );
                    setInventory(inventoryData);
                    toast.success("Inventory refreshed");
                  } catch (error) {
                    toast.error("Failed to refresh inventory");
                  } finally {
                    setInventoryLoading(false);
                  }
                }
              }}
              variant="outline"
              size="sm"
              disabled={inventoryLoading}
            >
              {inventoryLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              No inventory items found for pharmacy ID: {currentPharmacyId}
            </div>
            <div className="text-sm text-gray-400 mb-4">
              Make sure products are added to the correct pharmacy.
            </div>
            <Button
              onClick={async () => {
                if (currentPharmacyId) {
                  console.log(
                    `Manually refreshing inventory for pharmacy ${currentPharmacyId}`
                  );
                  setInventoryLoading(true);
                  try {
                    const inventoryData =
                      await pharmacyInventoryApi.findByPharmacy(
                        currentPharmacyId
                      );
                    console.log("Manual refresh result:", inventoryData);
                    setInventory(inventoryData);
                    toast.success("Inventory refreshed");
                  } catch (error) {
                    console.error("Manual refresh error:", error);
                    toast.error("Failed to refresh inventory");
                  } finally {
                    setInventoryLoading(false);
                  }
                }
              }}
              variant="outline"
              size="sm"
            >
              Refresh Inventory
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {inventory.map((item) => (
              <div
                key={item.Inventory_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      {item.medicine?.Medicine_Name ||
                        `Medicine ID: ${item.Medicine_id}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Stock: {item.Stock_Quantity}</span>
                      <span>Batch: {item.Batch_Number}</span>
                      <span>${item.Unit_Price}/unit</span>
                      <span>
                        Expires:{" "}
                        {new Date(item.Expiry_Date).toLocaleDateString()}
                      </span>
                      <span>Supplier: {item.Supplier_Name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.Stock_Quantity < 10 && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.Stock_Quantity < 10
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.Stock_Quantity < 10 ? "Low Stock" : "In Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderActivity = () => {
    if (loading || ordersLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading activity data...</div>
        </div>
      );
    }

    if (error || ordersError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error || ordersError}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const COLORS = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884d8",
      "#82ca9d",
    ];

    // Create stock data from real inventory
    const stockData = inventory.map((item) => ({
      name: item.medicine?.Medicine_Name || `Med-${item.Medicine_id}`,
      current: item.Stock_Quantity,
      minimum: 10, // Default minimum stock level
    }));

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pharmacies
              </h3>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pharmacies.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total registered pharmacies
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Orders
              </h3>
              <ShoppingCart className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {orders.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total orders processed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Inventory
              </h3>
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {inventory.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Products in inventory
            </div>
          </div>
        </div>

        {/* Charrt. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Status
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {orderStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Levels Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Stock Levels
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#82ca9d" name="Current Stock" />
                  <Bar
                    dataKey="minimum"
                    fill="#8884d8"
                    name="Minimum Required"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Activity":
        return renderActivity();
      case "Pharmacies":
        return renderPharmacies();
      case "Orders":
        return renderOrders();
      case "Inventory":
        return renderInventory();
    }
  };

  return (
    <div>
      <div className="mb-8">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              id: "Activity",
              label: "Activity",
              icon: <Activity className="w-5 h-5" />,
            },
            {
              id: "Inventory",
              label: "Inventory",
              icon: <Package className="w-5 h-5" />,
            },
            {
              id: "Pharmacies",
              label: "Pharmacies",
              icon: <Building2 className="w-5 h-5" />,
            },
            {
              id: "Orders",
              label: "Orders",
              icon: <ShoppingCart className="w-5 h-5" />,
            },
          ].map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? "border-purple-500 bg-blue-50 text-purple-600 shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mb-8">{renderContent()}</div>
    </div>
  );
};

export default PharmacistDashBoard;
