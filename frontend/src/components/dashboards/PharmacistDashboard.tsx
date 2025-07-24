import type{ Pharmacist } from "@/api/interfaces/pharmacist";
import type{ Order } from "@/api/interfaces/Order";
import type{ PharmacyInventory } from "@/api/interfaces/pharmacyInventory";
import type{ Medicine, Strength } from "@/api/interfaces/medicine";
import { pharmacistApi } from "@/api/pharmacists";
import { orderApi } from "@/api/orders";
import { pharmacyInventoryApi } from "@/api/pharmacyInventory";
import { medicineApi } from "@/api/medicines";
import { Activity, Package, Building2, ShoppingCart, Plus, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";


type TabType = "Activity" | "Inventory" | "Orders" | "Pharmacies";

const PharmacistDashBoard= () => {
  //state management.
    const [activeTab, setActiveTab] = useState<TabType>("Activity");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pharmacies, setPharmacies] = useState<Pharmacist[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isMedicineSheetOpen, setIsMedicineSheetOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [activityLoading, setActivityLoading] = useState(false);
    const [orderStats, setOrderStats] = useState<{name: string, value: number}[]>([]);
    const [inventory, setInventory] = useState<PharmacyInventory[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [medicinesLoading, setMedicinesLoading] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
      Medicine_Name: '',
      Brand_Name: '',
      Manufacturer: '',
      Category: '',
      Dosage: '',
      Strength: 'Average' as Strength,
      Description: '',
      Side_Effects: '',
      Storage_Instructions: ''
    });
    ////
    const [mockInventory] = useState([
      { id: 1, name: "Aspirin 100mg", stock: 150, minStock: 50, price: 0.85, expiry: "2025-06-15", supplier: "PharmaCorp" },
      { id: 2, name: "Metformin 500mg", stock: 25, minStock: 30, price: 0.75, expiry: "2024-12-20", supplier: "MediSupply" },
      { id: 3, name: "Lisinopril 10mg", stock: 200, minStock: 75, price: 0.36, expiry: "2025-03-10", supplier: "HealthDist" }
    ]);
    ////
    const [newPharmacy, setNewPharmacy] = useState({
      User_id: '',
      Pharmacy_Name: '',
      License_Number: '',
      Phone_Number: '',
      Email: '',
      Opening_Time: '',
      Closing_Time: '',
      Delivery_Available: false,
      Is_Verified: false,
      Rating: 0
    });

    useEffect(() => {
        const fetchPharmacies = async()=> {
            try {
                setLoading(true);
                setError(null);
                const pharmacyData = await pharmacistApi.getAll();
                setPharmacies(pharmacyData);
            } catch (error: any) {
                setError(error instanceof Error ? error.message : 'Failed to fetch pharmacies');
                console.error('Error fetching pharmacies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPharmacies();
    }, []);
    
    useEffect(() => {
        const fetchOrders = async() => {
            try {
                setOrdersLoading(true);
                setOrdersError(null);
                const orderData = await orderApi.findAll();
                setOrders(orderData);
            } catch (error: any) {
                setOrdersError(error instanceof Error ? error.message : 'Failed to fetch orders');
                console.error('Error fetching orders:', error);
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, []);
    
    useEffect(() => {
        const fetchInventory = async() => {
            try {
                setInventoryLoading(true);
                setInventoryError(null);
                const inventoryData = await pharmacyInventoryApi.findAll();
                setInventory(inventoryData);
            } catch (error: any) {
                setInventoryError(error instanceof Error ? error.message : 'Failed to fetch inventory');
                console.error('Error fetching inventory:', error);
            } finally {
                setInventoryLoading(false);
            }
        };
        fetchInventory();
    }, []);
    
    useEffect(() => {
        const fetchMedicines = async() => {
            try {
                setMedicinesLoading(true);
                const medicineData = await medicineApi.findAll();
                setMedicines(medicineData);
            } catch (error: any) {
                console.error('Error fetching medicines:', error);
            } finally {
                setMedicinesLoading(false);
            }
        };
        fetchMedicines();
    }, []);
    
    useEffect(() => {
        if (orders.length > 0) {
            // Calculate order statistics
            const statusCounts: Record<string, number> = {};
            orders.forEach(order => {
                const status = order.Order_Status;
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            const orderStatsData = Object.entries(statusCounts).map(([name, value]) => ({
                name,
                value
            }));
            
            setOrderStats(orderStatsData);
        }
    }, [orders]);
    
    const handleAddMedicine = async () => {
        try {
            await medicineApi.create(newMedicine);
            toast.success("Medicine added successfully");
            setIsMedicineSheetOpen(false);
            const medicineData = await medicineApi.findAll();
            setMedicines(medicineData);
        } catch (error) {
            toast.error("Failed to add medicine");
            console.error("Error adding medicine:", error);
        }
    };

  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
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
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} >
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
                  <Label htmlFor="pharmacy-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="pharmacy-name"
                    value={newPharmacy.Pharmacy_Name}
                    onChange={(e) => setNewPharmacy({...newPharmacy, Pharmacy_Name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="license" className="text-right">
                    License
                  </Label>
                  <Input
                    id="license"
                    value={newPharmacy.License_Number}
                    onChange={(e) => setNewPharmacy({...newPharmacy, License_Number: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newPharmacy.Phone_Number}
                    onChange={(e) => setNewPharmacy({...newPharmacy, Phone_Number: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPharmacy.Email}
                    onChange={(e) => setNewPharmacy({...newPharmacy, Email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <Button onClick={() => {
                  console.log('Creating pharmacy:', newPharmacy);
                  toast("Adding pharmacy...")
                  setIsSheetOpen(false);
                }} className="mt-4 bg-purple-500 hover:bg-purple-700">
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
          <div className="text-center py-8 text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.Order_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Order #{order.Order_Number}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Type: {order.Order_Type}</span>
                      <span>Patient ID: {order.Patient_id}</span>
                      <span className="font-medium">${order.Total_Amount}</span>
                      <span>{new Date(order.Order_Date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.Order_Status === "Placed" && <Clock className="w-4 h-4 text-yellow-500" />}
                    {order.Order_Status === "Delivered" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {(order.Order_Status === "Preparing" || order.Order_Status === "Ready") && <Package className="w-4 h-4 text-blue-500" />}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.Order_Status === "Placed" ? "bg-yellow-100 text-yellow-800" :
                      order.Order_Status === "Delivered" ? "bg-green-100 text-green-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
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
    
    const displayInventory = inventory.length > 0 ? inventory : mockInventory;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Inventory ({displayInventory.length})
          </h2>
          <Sheet open={isMedicineSheetOpen} onOpenChange={setIsMedicineSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full rounded-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add New Medicine</SheetTitle>
                <SheetDescription>
                  Fill in the details to add a new medicine to the system.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="medicine-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="medicine-name"
                    value={newMedicine.Medicine_Name}
                    onChange={(e) => setNewMedicine({...newMedicine, Medicine_Name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand-name" className="text-right">
                    Brand
                  </Label>
                  <Input
                    id="brand-name"
                    value={newMedicine.Brand_Name}
                    onChange={(e) => setNewMedicine({...newMedicine, Brand_Name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manufacturer" className="text-right">
                    Manufacturer
                  </Label>
                  <Input
                    id="manufacturer"
                    value={newMedicine.Manufacturer}
                    onChange={(e) => setNewMedicine({...newMedicine, Manufacturer: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newMedicine.Category}
                    onChange={(e) => setNewMedicine({...newMedicine, Category: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dosage" className="text-right">
                    Dosage
                  </Label>
                  <Input
                    id="dosage"
                    value={newMedicine.Dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, Dosage: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newMedicine.Description}
                    onChange={(e) => setNewMedicine({...newMedicine, Description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="side-effects" className="text-right">
                    Side Effects
                  </Label>
                  <Input
                    id="side-effects"
                    value={newMedicine.Side_Effects}
                    onChange={(e) => setNewMedicine({...newMedicine, Side_Effects: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="storage" className="text-right">
                    Storage
                  </Label>
                  <Input
                    id="storage"
                    value={newMedicine.Storage_Instructions}
                    onChange={(e) => setNewMedicine({...newMedicine, Storage_Instructions: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <Button 
                  onClick={handleAddMedicine} 
                  className="mt-4 bg-purple-500 hover:bg-purple-700"
                  disabled={medicinesLoading}
                >
                  {medicinesLoading ? "Adding..." : "Add Medicine"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {displayInventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inventory items found.
          </div>
        ) : (
          <div className="grid gap-4">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.Inventory_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                        {item.medicine?.Medicine_Name || `Medicine ID: ${item.Medicine_id}`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>Stock: {item.Stock_Quantity}</span>
                        <span>Batch: {item.Batch_Number}</span>
                        <span>${item.Unit_Price}/unit</span>
                        <span>Expires: {new Date(item.Expiry_Date).toLocaleDateString()}</span>
                        <span>Supplier: {item.Supplier_Name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (

              ///
              mockInventory.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>Stock: {item.stock}</span>
                        <span>Min: {item.minStock}</span>
                        <span>${item.price}/unit</span>
                        <span>Expires: {item.expiry}</span>
                        <span>Supplier: {item.supplier}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.stock < item.minStock && <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.stock < item.minStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.stock < item.minStock ? "Low Stock" : "In Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
              ////
            )}
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const stockData = mockInventory.map(item => ({
      name: item.name,
      current: item.stock,
      minimum: item.minStock
    }));

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pharmacies</h3>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pharmacies.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total registered pharmacies</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Orders</h3>
              <ShoppingCart className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{orders.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total orders processed</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Inventory</h3>
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{inventory.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products in inventory</div>
          </div>
        </div>

        {/* Charrt. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Status</h3>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Levels Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock Levels</h3>
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
                  <Bar dataKey="minimum" fill="#8884d8" name="Minimum Required" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = ()=> {
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
  }

  return (
    <div>
      <div className="mb-8">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "Activity", label: "Activity", icon: <Activity className="w-5 h-5" />},
            { id: "Inventory", label: "Inventory", icon: <Package className="w-5 h-5" />},
            { id: "Pharmacies", label: "Pharmacies", icon: <Building2 className="w-5 h-5" />},
            { id: "Orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" />},
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