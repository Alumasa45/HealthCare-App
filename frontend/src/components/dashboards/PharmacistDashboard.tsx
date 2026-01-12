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
} from "lucide-react";
import {
  Tooltip,
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

  const handleCreatePharmacy = async () => {
    if (!selectedPharmacist) {
      toast.error("Please select a pharmacist");
      return;
    }

    if (!newPharmacy.Pharmacy_Name || !newPharmacy.License_Number) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await pharmacyApi.create({
        ...newPharmacy,
        User_id: selectedPharmacist.User_id,
      });

      toast.success("Pharmacy created successfully");
      setIsSheetOpen(false);
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
      setSelectedPharmacist(null);

      // Refresh pharmacies list
      const updatedPharmacies = await pharmacistApi.getAll();
      setPharmacies(updatedPharmacies);
    } catch (error) {
      console.error("Error creating pharmacy:", error);
      toast.error("Failed to create pharmacy");
    }
  };

  const renderActivity = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orders.length}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Inventory Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventory.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Total Pharmacies
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pharmacies.length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {orderStats.length > 0 && (
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"][index % 4]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => {
    if (inventoryLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading Inventory...</div>
        </div>
      );
    }

    if (inventoryError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {inventoryError}</div>
        </div>
      );
    }

    if (inventory.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">No inventory items found</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Medicine Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {inventory.map((item) => (
                <tr
                  key={item.Inventory_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {item.Medicine_id}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {item.Stock_Quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {new Date(item.Expiry_Date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    if (ordersLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading Orders...</div>
        </div>
      );
    }

    if (ordersError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {ordersError}</div>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">No orders found</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Order ID
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Order Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {orders.map((order) => (
                <tr
                  key={order.Order_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {order.Order_id}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.Order_Status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.Order_Status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.Order_Status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {new Date(order.Order_Date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.Pharmacy_id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {pharmacy.Pharmacy_Name}
              </h3>
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>License:</strong> {pharmacy.License_Number}
              </p>
              <p>
                <strong>Phone:</strong> {pharmacy.Phone_Number}
              </p>
              <p>
                <strong>Email:</strong> {pharmacy.Email}
              </p>
              <p>
                <strong>Hours:</strong> {formatTime(pharmacy.Opening_Time)} -{" "}
                {formatTime(pharmacy.Closing_Time)}
              </p>
              <p>
                <strong>Delivery:</strong>{" "}
                {pharmacy.Delivery_Available ? "Available" : "Not Available"}
              </p>
              <p>
                <strong>Rating:</strong> {pharmacy.Rating}/5
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "Activity" as TabType, label: "Activity", icon: Activity },
    { id: "Inventory" as TabType, label: "Inventory", icon: Package },
    { id: "Orders" as TabType, label: "Orders", icon: ShoppingCart },
    { id: "Pharmacies" as TabType, label: "Pharmacies", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pharmacist Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your pharmacy operations and inventory
            </p>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Pharmacy
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Create New Pharmacy</SheetTitle>
                <SheetDescription>
                  Add a new pharmacy to the system
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="pharmacist">Select Pharmacist</Label>
                  <Select
                    value={selectedPharmacist?.User_id.toString() || ""}
                    onValueChange={(value) => {
                      const pharmacist = availablePharmacists.find(
                        (p) => p.User_id.toString() === value
                      );
                      setSelectedPharmacist(pharmacist || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pharmacist" />
                    </SelectTrigger>
                    <SelectContent>
                      {pharmacistsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading pharmacists...
                        </SelectItem>
                      ) : availablePharmacists.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No available pharmacists
                        </SelectItem>
                      ) : (
                        availablePharmacists.map((pharmacist) => (
                          <SelectItem
                            key={pharmacist.User_id}
                            value={pharmacist.User_id.toString()}
                          >
                            {pharmacist.First_Name} {pharmacist.Last_Name} (
                            {pharmacist.Email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pharmacy_name">Pharmacy Name</Label>
                  <Input
                    id="pharmacy_name"
                    value={newPharmacy.Pharmacy_Name}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Pharmacy_Name: e.target.value,
                      })
                    }
                    placeholder="Enter pharmacy name"
                  />
                </div>

                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={newPharmacy.License_Number}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        License_Number: e.target.value,
                      })
                    }
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={newPharmacy.Phone_Number}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Phone_Number: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPharmacy.Email}
                    onChange={(e) =>
                      setNewPharmacy({ ...newPharmacy, Email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opening_time">Opening Time</Label>
                    <Input
                      id="opening_time"
                      type="time"
                      value={newPharmacy.Opening_Time}
                      onChange={(e) =>
                        setNewPharmacy({
                          ...newPharmacy,
                          Opening_Time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="closing_time">Closing Time</Label>
                    <Input
                      id="closing_time"
                      type="time"
                      value={newPharmacy.Closing_Time}
                      onChange={(e) =>
                        setNewPharmacy({
                          ...newPharmacy,
                          Closing_Time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="delivery_available"
                    checked={newPharmacy.Delivery_Available}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        Delivery_Available: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="delivery_available">Delivery Available</Label>
                </div>

                <Button onClick={handleCreatePharmacy} className="w-full">
                  Create Pharmacy
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "Activity" && renderActivity()}
            {activeTab === "Inventory" && renderInventory()}
            {activeTab === "Orders" && renderOrders()}
            {activeTab === "Pharmacies" && renderPharmacies()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashBoard;
