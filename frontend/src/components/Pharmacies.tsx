import type { Product } from "@/api/interfaces/pharmacy";
import type {
  Medicine,
  CreateMedicineDto,
  Strength,
} from "@/api/interfaces/medicine";
import type {
  PharmacyInventory,
  CreatePharmacyInventoryDto,
} from "@/api/interfaces/pharmacyInventory";
import { medicineApi } from "../api/medicines";
import { pharmacyInventoryApi } from "../api/pharmacyInventory";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  User,
  ShoppingCart,
  Package,
  Edit,
  Trash2,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Pharmacies = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inventory, setInventory] = useState<PharmacyInventory[]>([]);
  const [sortBy, setSortBy] = useState("Best Seller");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPharmacist, setIsPharmacist] = useState(false);
  const [activeView, setActiveView] = useState<"customer" | "pharmacist">(
    "customer"
  );

  const transformMedicinesToProducts = (
    medicines: Medicine[],
    inventory: PharmacyInventory[]
  ): Product[]  => {
    return medicines
      .map((medicine: Medicine) => {
        const inventoryItem = inventory.find(
          (inv: PharmacyInventory) => inv.Medicine_id === medicine.Medicine_id
        );

        // if (!inventoryItem) return null;

        return {
          Product_id: medicine.Medicine_id || 0,
          Product_name: medicine.Medicine_Name,
          Category: medicine.Category,
          Price: inventoryItem?.Unit_Price ?? 0,
          OriginalPrice: inventoryItem?.Wholesale_Price ?? 0,
          DiscountPrice: (inventoryItem?.Unit_Price ?? 0) * 0.9, 
          Rating: 4.5, 
          Image_url:
            "https://via.placeholder.com/300x200?text=" +
            encodeURIComponent(medicine.Medicine_Name),
          Brand: medicine.Brand_Name,
          Description: medicine.Description,
        };
      })
      // .filter((product):  Product => product !== null);
  };

  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isRequestMedicineOpen, setIsRequestMedicineOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState<CreateMedicineDto>({
    Medicine_Name: "",
    Brand_Name: "",
    Manufacturer: "",
    Category: "",
    Dosage: "",
    Strength: "Average" as Strength,
    Description: "",
    Side_Effects: "",
    Storage_Instructions: "",
  });

  const [medicineRequest, setMedicineRequest] = useState({
    Medicine_name: "",
    Brand_name: "",
    Description: "",
    Dosage: "",
    Category: "",
    urgency: "Normal",
    contactInfo: "",
    notes: "",
  });

  const [isAddToShopOpen, setIsAddToShopOpen] = useState(false);
  const [shopMedicine, setShopMedicine] = useState({
    Medicine_Name: "",
    Brand_Name: "",
    Manufacturer: "",
    Category: "",
    Dosage: "",
    Stock_Quantity: 0,
    Unit_Price: 0.0,
    Strength: "Average",
    Description: "",
    Side_Effects: "",
    Storage_Instructions: "",
    OriginalPrice: 0,
    DiscountPrice: 0,
    Batch_Number: "",
    Expiry_Date: "",
    Image_url: "",
    Supplier_Name: "",
  });

  const [newInventoryItem, setNewInventoryItem] =
    useState<CreatePharmacyInventoryDto>({
      Pharmacy_id: 1,
      Medicine_id: 0,
      Batch_Number: "",
      Expiry_Date: "",
      Stock_Quantity: 0,
      Unit_Price: 0,
      Wholesale_Price: 0,
      Supplier_Name: "",
      Last_Restocked: new Date().toISOString().split("T")[0],
    });

  const [categories, setCategories] = useState([
    { name: "Cold & Flu", checked: false },
    { name: "Pain Relief", checked: false },
    { name: "Allergy", checked: false },
    { name: "Digestive Health", checked: false },
    { name: "Vitamins & Supplements", checked: false },
  ]);
  const [priceRanges] = useState([
    "Under KES 500",
    "KES 500 - KES 1000",
    "Above KES.1000.00",
  ]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [brands, setBrands] = useState([
    { name: "Brand A", checked: false },
    { name: "Brand B", checked: false },
    { name: "Brand C", checked: false },
  ]);

  useEffect(() => {
    if (user) {
      const userRole =
        (user as any).role || (user as any).Role || (user as any).user_type;
      if (userRole === "Pharmacist" || userRole === "pharmacist") {
        setIsPharmacist(true);
        setActiveView("pharmacist");
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!products) setLoading(true);
        const medicineData = await medicineApi.findAll();
        const inventoryData = await pharmacyInventoryApi.findAll();

        // Transform medicines and inventory into products
        const transformedProducts = transformMedicinesToProducts(
          medicineData,
          inventoryData
        );

        setProducts(transformedProducts);
        setMedicines(medicineData);
      } catch (error) {
        console.error("Error fetching products", error);
        toast.error("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isPharmacist) {
      const fetchInventory = async () => {
        try {
          setLoading(true);
          const inventoryData = await pharmacyInventoryApi.findAll();
          setInventory(inventoryData);
        } catch (error) {
          console.error("Error fetching inventory:", error);
          toast.error("Failed to fetch inventory.");
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
    }
  }, [isPharmacist]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await medicineApi.create(newMedicine);
      toast.success("Medicine added successfully!");
      setIsAddMedicineOpen(false);
      setNewMedicine({
        Medicine_Name: "",
        Brand_Name: "",
        Manufacturer: "",
        Category: "",
        Dosage: "",
        Strength: "Average" as Strength,
        Description: "",
        Side_Effects: "",
        Storage_Instructions: "",
      });

      const medicineData = await medicineApi.findAll();
      setMedicines(medicineData);
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Failed to add medicine.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await pharmacyInventoryApi.create(newInventoryItem);
      toast.success("Medicine added to inventory successfully!");
      setIsAddInventoryOpen(false);
      setNewInventoryItem({
        Pharmacy_id: 1,
        Medicine_id: 0,
        Batch_Number: "",
        Expiry_Date: "",
        Stock_Quantity: 0,
        Unit_Price: 0,
        Wholesale_Price: 0,
        Supplier_Name: "",
        Last_Restocked: new Date().toISOString().split("T")[0],
      });

      // refresh inventory.
      const inventoryData = await pharmacyInventoryApi.findAll();
      setInventory(inventoryData);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast.error("Failed to add medicine to inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Medicine request submitted:", medicineRequest);
      toast.success(
        "Medicine request submitted successfully! We'll notify you when it's available."
      );
      setIsRequestMedicineOpen(false);
      setMedicineRequest({
        Medicine_name: "",
        Brand_name: "",
        Description: "",
        Dosage: "",
        Category: "",
        urgency: "Normal",
        contactInfo: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting medicine request:", error);
      toast.error("Failed to submit medicine request.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const newMedicineData: CreateMedicineDto = {
        Medicine_Name: shopMedicine.Medicine_Name,
        Brand_Name: shopMedicine.Brand_Name,
        Manufacturer: shopMedicine.Manufacturer,
        Category: shopMedicine.Category,
        Dosage: shopMedicine.Dosage,
        Strength: shopMedicine.Strength as Strength,
        Description: shopMedicine.Description,
        Side_Effects: shopMedicine.Side_Effects,
        Storage_Instructions: shopMedicine.Storage_Instructions,
      };

      const createdMedicine = await medicineApi.create(newMedicineData);

      if (createdMedicine && createdMedicine.Medicine_id) {
        const inventoryData: CreatePharmacyInventoryDto = {
          Pharmacy_id: 1,
          Medicine_id: createdMedicine.Medicine_id,
          Batch_Number: shopMedicine.Batch_Number || "BATCH-001",
          Expiry_Date: shopMedicine.Expiry_Date || "",
          Stock_Quantity: shopMedicine.Stock_Quantity,
          Unit_Price: shopMedicine.Unit_Price,
          Wholesale_Price: shopMedicine.OriginalPrice,
          Supplier_Name: shopMedicine.Supplier_Name || "Unknown Supplier",
          Last_Restocked: new Date().toISOString().split("T")[0],
        };

        await pharmacyInventoryApi.create(inventoryData);
      }

      toast.success(
        "Medicine added to shop successfully! It's now available for customers."
      );
      setIsAddToShopOpen(false);
      setShopMedicine({
        Medicine_Name: "",
        Brand_Name: "",
        Manufacturer: "",
        Category: "",
        Dosage: "",
        Strength: "Average",
        Description: "",
        Side_Effects: "",
        Storage_Instructions: "",
        Unit_Price: 0,
        OriginalPrice: 0,
        DiscountPrice: 0,
        Stock_Quantity: 0,
        Batch_Number: "",
        Expiry_Date: "",
        Image_url: "",
        Supplier_Name: "",
      });

      const medicineData = await medicineApi.findAll();
      const inventoryData = await pharmacyInventoryApi.findAll();

      // Transform medicines and inventory into products
      const transformedProducts = transformMedicinesToProducts(
        medicineData,
        inventoryData
      );

      setProducts(transformedProducts);
      setMedicines(medicineData);

      if (isPharmacist) {
        const updatedInventoryData = await pharmacyInventoryApi.findAll();
        setInventory(updatedInventoryData);
      }
    } catch (error) {
      console.error("Error adding medicine to shop:", error);
      toast.error("Failed to add medicine to shop.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.Product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.Medicine_Name?.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) || medicine.Brand_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-purple-600">
                {isPharmacist ? "Pharmacy Management" : "Medishop"}
              </h1>
              {isPharmacist && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant={activeView === "customer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveView("customer")}
                  >
                    Customer View
                  </Button>
                  <Button
                    variant={
                      activeView === "pharmacist" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveView("pharmacist")}
                  >
                    Manage Inventory
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={
                    isPharmacist && activeView === "pharmacist"
                      ? "Search medicines..."
                      : "Search medicines..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <nav className="flex items-center space-x-8">
              {!isPharmacist && (
                <>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Prescriptions
                  </a>
                  <a
                    href="/healthblog"
                    className="text-gray-600 hover:text-purple-600"
                  >
                    Health Blog
                  </a>
                </>
              )}
              <User className="w-6 h-6 text-gray-600 cursor-pointer" />
              {!isPharmacist && (
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-600 cursor-pointer" />
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {activeView === "pharmacist" && isPharmacist ? (
        <PharmacistView
          medicines={filteredMedicines}
          inventory={inventory}
          loading={loading}
          onAddMedicine={handleAddMedicine}
          onAddInventoryItem={handleAddInventoryItem}
          newMedicine={newMedicine}
          setNewMedicine={setNewMedicine}
          newInventoryItem={newInventoryItem}
          setNewInventoryItem={setNewInventoryItem}
          isAddMedicineOpen={isAddMedicineOpen}
          setIsAddMedicineOpen={setIsAddMedicineOpen}
          isAddInventoryOpen={isAddInventoryOpen}
          setIsAddInventoryOpen={setIsAddInventoryOpen}
        />
      ) : (
        <CustomerView
          products={filteredProducts}
          categories={categories}
          setCategories={setCategories}
          priceRanges={priceRanges}
          brands={brands}
          setBrands={setBrands}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          loading={loading}
          renderStars={renderStars}
          onRequestMedicine={handleMedicineRequest}
          medicineRequest={medicineRequest}
          setMedicineRequest={setMedicineRequest}
          isRequestMedicineOpen={isRequestMedicineOpen}
          setIsRequestMedicineOpen={setIsRequestMedicineOpen}
          onAddToShop={handleAddToShop}
          shopMedicine={shopMedicine}
          setShopMedicine={setShopMedicine}
          isAddToShopOpen={isAddToShopOpen}
          setIsAddToShopOpen={setIsAddToShopOpen}
        />
      )}
    </div>
  );
};

// Pharmacist View Component
interface PharmacistViewProps {
  medicines: Medicine[];
  inventory: PharmacyInventory[];
  loading: boolean;
  onAddMedicine: (e: React.FormEvent) => void;
  onAddInventoryItem: (e: React.FormEvent) => void;
  newMedicine: CreateMedicineDto;
  setNewMedicine: React.Dispatch<React.SetStateAction<CreateMedicineDto>>;
  newInventoryItem: CreatePharmacyInventoryDto;
  setNewInventoryItem: React.Dispatch<
    React.SetStateAction<CreatePharmacyInventoryDto>
  >;
  isAddMedicineOpen: boolean;
  setIsAddMedicineOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddInventoryOpen: boolean;
  setIsAddInventoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PharmacistView: React.FC<PharmacistViewProps> = ({
  medicines,
  inventory,
  loading,
  onAddMedicine,
  onAddInventoryItem,
  newMedicine,
  setNewMedicine,
  newInventoryItem,
  setNewInventoryItem,
  isAddMedicineOpen,
  setIsAddMedicineOpen,
  isAddInventoryOpen,
  setIsAddInventoryOpen,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Pharmacy Inventory Management
          </h2>
          <div className="flex items-center space-x-4">
            <Sheet open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
              <SheetTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Medicine
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full md:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Add New Medicine</SheetTitle>
                  <SheetDescription>
                    Add a new medicine to the system database.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={onAddMedicine} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="medicineName">Medicine Name</Label>
                    <Input
                      id="medicineName"
                      value={newMedicine.Medicine_Name}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Medicine_Name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={newMedicine.Brand_Name}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Brand_Name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={newMedicine.Manufacturer}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Manufacturer: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newMedicine.Category}
                      onValueChange={(value) =>
                        setNewMedicine({ ...newMedicine, Category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                        <SelectItem value="Cold & Flu">Cold & Flu</SelectItem>
                        <SelectItem value="Allergy">Allergy</SelectItem>
                        <SelectItem value="Digestive Health">
                          Digestive Health
                        </SelectItem>
                        <SelectItem value="Vitamins & Supplements">
                          Vitamins & Supplements
                        </SelectItem>
                        <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                        <SelectItem value="Heart & Blood Pressure">
                          Heart & Blood Pressure
                        </SelectItem>
                        <SelectItem value="Diabetes">Diabetes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={newMedicine.Dosage}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Dosage: e.target.value,
                        })
                      }
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strength">Strength</Label>
                    <Select
                      value={newMedicine.Strength}
                      onValueChange={(value) =>
                        setNewMedicine({
                          ...newMedicine,
                          Strength: value as Strength,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select strength" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Very Strong">Very Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMedicine.Description}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Description: e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sideEffects">Side Effects</Label>
                    <Textarea
                      id="sideEffects"
                      value={newMedicine.Side_Effects}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Side_Effects: e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storageInstructions">
                      Storage Instructions
                    </Label>
                    <Textarea
                      id="storageInstructions"
                      value={newMedicine.Storage_Instructions}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Storage_Instructions: e.target.value,
                        })
                      }
                      rows={2}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Adding..." : "Add Medicine"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            <Sheet
              open={isAddInventoryOpen}
              onOpenChange={setIsAddInventoryOpen}
            >
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Add to Inventory
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full md:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Add Medicine to Inventory</SheetTitle>
                  <SheetDescription>
                    Add an existing medicine to your pharmacy inventory.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={onAddInventoryItem} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="medicineSelect">Select Medicine</Label>
                    <Select
                      value={newInventoryItem.Medicine_id.toString()}
                      onValueChange={(value) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Medicine_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines.map((medicine) => (
                          <SelectItem
                            key={medicine.Medicine_id}
                            value={medicine.Medicine_id!.toString()}
                          >
                            {medicine.Medicine_Name} - {medicine.Brand_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={newInventoryItem.Batch_Number}
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Batch_Number: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={
                        typeof newInventoryItem.Expiry_Date === "string"
                          ? newInventoryItem.Expiry_Date
                          : newInventoryItem.Expiry_Date.toISOString().split(
                              "T"
                            )[0]
                      }
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Expiry_Date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={newInventoryItem.Stock_Quantity}
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Stock_Quantity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price (KES)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInventoryItem.Unit_Price}
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Unit_Price: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">
                      Wholesale Price (KES)
                    </Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInventoryItem.Wholesale_Price}
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Wholesale_Price: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={newInventoryItem.Supplier_Name}
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Supplier_Name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastRestocked">Last Restocked</Label>
                    <Input
                      id="lastRestocked"
                      type="date"
                      value={
                        typeof newInventoryItem.Last_Restocked === "string"
                          ? newInventoryItem.Last_Restocked
                          : newInventoryItem.Last_Restocked.toISOString().split(
                              "T"
                            )[0]
                      }
                      onChange={(e) =>
                        setNewInventoryItem({
                          ...newInventoryItem,
                          Last_Restocked: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Adding..." : "Add to Inventory"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <Tabs defaultValue="medicines" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="medicines">Medicines Database</TabsTrigger>
          <TabsTrigger value="inventory">My Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="medicines" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Medicines Database</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading medicines...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manufacturer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medicines.map((medicine) => (
                        <tr key={medicine.Medicine_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {medicine.Medicine_Name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {medicine.Brand_Name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {medicine.Category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {medicine.Dosage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {medicine.Manufacturer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pharmacy Inventory</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading inventory...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item.Inventory_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.medicine?.Medicine_Name ||
                                  "Unknown Medicine"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.medicine?.Brand_Name || "Unknown Brand"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.Batch_Number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.Stock_Quantity > 50
                                  ? "bg-green-100 text-green-800"
                                  : item.Stock_Quantity > 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.Stock_Quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            KES {item.Unit_Price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.Expiry_Date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Customer View Component
interface CustomerViewProps {
  products: Product[];
  categories: { name: string; checked: boolean }[];
  setCategories: React.Dispatch<
    React.SetStateAction<{ name: string; checked: boolean }[]>
  >;
  priceRanges: string[];
  brands: { name: string; checked: boolean }[];
  setBrands: React.Dispatch<
    React.SetStateAction<{ name: string; checked: boolean }[]>
  >;
  selectedPriceRange: string;
  setSelectedPriceRange: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  renderStars: (rating: number) => React.ReactElement[];
  onRequestMedicine: (e: React.FormEvent) => void;
  medicineRequest: {
    Medicine_name: string;
    Brand_name: string;
    Description: string;
    Dosage: string;
    Category: string;
    urgency: string;
    contactInfo: string;
    notes: string;
  };
  setMedicineRequest: React.Dispatch<
    React.SetStateAction<{
      Medicine_name: string;
      Brand_name: string;
      Description: string;
      Dosage: string;
      Category: string;
      urgency: string;
      contactInfo: string;
      notes: string;
    }>
  >;
  isRequestMedicineOpen: boolean;
  setIsRequestMedicineOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAddToShop: (e: React.FormEvent) => void;
  shopMedicine: {
    Medicine_Name: string;
    Brand_Name: string;
    Manufacturer: string;
    Category: string;
    Dosage: string;
    Strength: string;
    Description: string;
    Side_Effects: string;
    Storage_Instructions: string;
    Unit_Price: number;
    OriginalPrice: number;
    DiscountPrice: number;
    Stock_Quantity: number;
    Batch_Number: string;
    Expiry_Date: string;
    Image_url: string;
    Supplier_Name: string;
  };
  setShopMedicine: React.Dispatch<
    React.SetStateAction<{
      Medicine_Name: string;
      Brand_Name: string;
      Manufacturer: string;
      Category: string;
      Dosage: string;
      Strength: string;
      Description: string;
      Side_Effects: string;
      Storage_Instructions: string;
      Unit_Price: number;
      OriginalPrice: number;
      DiscountPrice: number;
      Stock_Quantity: number;
      Batch_Number: string;
      Expiry_Date: string;
      Image_url: string;
      Supplier_Name: string;
    }>
  >;
  isAddToShopOpen: boolean;
  setIsAddToShopOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerView: React.FC<CustomerViewProps> = ({
  products,
  categories,
  setCategories,
  priceRanges,
  brands,
  setBrands,
  selectedPriceRange,
  setSelectedPriceRange,
  sortBy,
  setSortBy,
  loading,
  renderStars,
  onRequestMedicine,
  medicineRequest,
  setMedicineRequest,
  isRequestMedicineOpen,
  setIsRequestMedicineOpen,
  onAddToShop,
  shopMedicine,
  setShopMedicine,
  isAddToShopOpen,
  setIsAddToShopOpen,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex text-sm text-gray-500 mb-8">
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">Medicines</span>
      </nav>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Filter By</h3>
            <div className="mb-6">
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={category.checked}
                      onChange={(e) => {
                        setCategories(
                          categories.map((cat) =>
                            cat.name === category.name
                              ? { ...cat, checked: e.target.checked }
                              : cat
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range} className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range}
                      onChange={() => setSelectedPriceRange(range)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Medicine brand</h4>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label key={brand.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brand.checked}
                      onChange={(e) => {
                        setBrands(
                          brands.map((b) =>
                            b.name === brand.name
                              ? { ...b, checked: e.target.checked }
                              : b
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cold & Flu Medicines
              </h2>
              <p className="text-gray-600">{products.length} products found</p>
            </div>
            <div className="flex items-center space-x-4">
              <Sheet
                open={isRequestMedicineOpen}
                onOpenChange={setIsRequestMedicineOpen}
              >
                <SheetTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Request Medicine
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full md:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Request a Medicine</SheetTitle>
                    <SheetDescription>
                      Can't find the medicine you need? Request it and we'll
                      notify you when it's available.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={onRequestMedicine} className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="medicineName">Medicine Name *</Label>
                      <Input
                        id="medicineName"
                        value={medicineRequest.Medicine_name}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            Medicine_name: e.target.value,
                          })
                        }
                        placeholder="Enter medicine name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand Name (Optional)</Label>
                      <Input
                        id="brandName"
                        value={medicineRequest.Brand_name}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            Brand_name: e.target.value,
                          })
                        }
                        placeholder="Preferred brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={medicineRequest.Category}
                        onValueChange={(value) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            Category: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pain Relief">
                            Pain Relief
                          </SelectItem>
                          <SelectItem value="Cold & Flu">Cold & Flu</SelectItem>
                          <SelectItem value="Allergy">Allergy</SelectItem>
                          <SelectItem value="Digestive Health">
                            Digestive Health
                          </SelectItem>
                          <SelectItem value="Vitamins & Supplements">
                            Vitamins & Supplements
                          </SelectItem>
                          <SelectItem value="Antibiotics">
                            Antibiotics
                          </SelectItem>
                          <SelectItem value="Heart & Blood Pressure">
                            Heart & Blood Pressure
                          </SelectItem>
                          <SelectItem value="Diabetes">Diabetes</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage/Strength</Label>
                      <Input
                        id="dosage"
                        value={medicineRequest.Dosage}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            Dosage: e.target.value,
                          })
                        }
                        placeholder="e.g., 500mg, 10ml"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select
                        value={medicineRequest.urgency}
                        onValueChange={(value) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            urgency: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">
                            Low - Can wait 1-2 weeks
                          </SelectItem>
                          <SelectItem value="Normal">
                            Normal - Need within a week
                          </SelectItem>
                          <SelectItem value="High">
                            High - Need within 2-3 days
                          </SelectItem>
                          <SelectItem value="Urgent">
                            Urgent - Need immediately
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information *</Label>
                      <Input
                        id="contactInfo"
                        value={medicineRequest.contactInfo}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            contactInfo: e.target.value,
                          })
                        }
                        placeholder="Phone number or email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description & Notes</Label>
                      <Textarea
                        id="description"
                        value={medicineRequest.Description}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            Description: e.target.value,
                          })
                        }
                        placeholder="Any additional details about the medicine you need..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={medicineRequest.notes}
                        onChange={(e) =>
                          setMedicineRequest({
                            ...medicineRequest,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Any other information..."
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>

              <Sheet open={isAddToShopOpen} onOpenChange={setIsAddToShopOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-purple-500 text-white hover:bg-green-600 border-green-500"
                  >
                    Add to Shop
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:max-w-2xl overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Add Medicine to Shop</SheetTitle>
                    <SheetDescription>
                      Add a new medicine to your pharmacy inventory for
                      customers to purchase.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={onAddToShop} className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medicineName">Medicine Name *</Label>
                        <Input
                          id="medicineName"
                          value={shopMedicine.Medicine_Name}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Medicine_Name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          value={shopMedicine.Brand_Name}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Brand_Name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Input
                          id="manufacturer"
                          value={shopMedicine.Manufacturer}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Manufacturer: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={shopMedicine.Dosage}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Dosage: e.target.value,
                            })
                          }
                          placeholder="e.g., 500mg tablet"
                        />
                      </div>
                      <div>
                        <Label htmlFor="strength">Strength</Label>
                        <Input
                          id="strength"
                          value={shopMedicine.Strength}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Strength: e.target.value,
                            })
                          }
                          placeholder="e.g., 500mg"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={shopMedicine.Description}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Description: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Medicine description and usage information..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="sideEffects">Side Effects</Label>
                      <Textarea
                        id="sideEffects"
                        value={shopMedicine.Side_Effects}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Side_Effects: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Known side effects and warnings..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="unitPrice">Unit Price (KES) *</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          value={shopMedicine.Unit_Price}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Unit_Price: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">
                          Original Price (KES)
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={shopMedicine.OriginalPrice}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              OriginalPrice: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="discountPrice">
                          Discount Price (KES)
                        </Label>
                        <Input
                          id="discountPrice"
                          type="number"
                          step="0.01"
                          value={shopMedicine.DiscountPrice}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              DiscountPrice: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={shopMedicine.Stock_Quantity}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Stock_Quantity: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                          id="batchNumber"
                          value={shopMedicine.Batch_Number}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Batch_Number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={shopMedicine.Expiry_Date}
                          onChange={(e) =>
                            setShopMedicine({
                              ...shopMedicine,
                              Expiry_Date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={shopMedicine.Category}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Category: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Category</option>
                        <option value="prescription">Prescription</option>
                        <option value="over-the-counter">
                          Over the Counter
                        </option>
                        <option value="ayurvedic">Ayurvedic</option>
                        <option value="homeopathic">Homeopathic</option>
                        <option value="supplement">Supplement</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="storageInstructions">
                        Storage Instructions
                      </Label>
                      <Textarea
                        id="storageInstructions"
                        value={shopMedicine.Storage_Instructions}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Storage_Instructions: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Storage conditions and instructions..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="supplierName">Supplier Name</Label>
                      <Input
                        id="supplierName"
                        value={shopMedicine.Supplier_Name}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Supplier_Name: e.target.value,
                          })
                        }
                        placeholder="Enter supplier name..."
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Adding..." : "Add Medicine to Shop"}
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>

              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>Best Selling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Reviews</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              {Array.isArray(products) && products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {products.map((product) => (
                      <div
                        key={product.Product_id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={product.Image_url}
                            alt={product.Product_name}
                            className="w-full h-48 object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {product.Category}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {product.Product_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.Description}
                          </p>

                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {renderStars(product.Rating)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                KES.{product.OriginalPrice}
                              </span>
                              {product.DiscountPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  KES.{product.DiscountPrice}
                                </span>
                              )}
                            </div>
                            <button className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <button className="p-2 rounded hover:bg-gray-100">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="px-3 py-2 bg-purple-600 text-white rounded">
                      1
                    </button>
                    <button className="px-3 py-2 hover:bg-gray-100 rounded">
                      2
                    </button>
                    <button className="px-3 py-2 hover:bg-gray-100 rounded">
                      3
                    </button>
                    <span className="px-3 py-2 text-gray-500">...</span>
                    <button className="px-3 py-2 hover:bg-gray-100 rounded">
                      8
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No medicines found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We don't have the medicines you're looking for in stock
                    right now. You can request them and we'll notify you when
                    they become available.
                  </p>
                  <Sheet
                    open={isRequestMedicineOpen}
                    onOpenChange={setIsRequestMedicineOpen}
                  >
                    <SheetTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Request Medicine
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full md:max-w-md overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Request a Medicine</SheetTitle>
                        <SheetDescription>
                          Can't find the medicine you need? Request it and we'll
                          notify you when it's available.
                        </SheetDescription>
                      </SheetHeader>
                      <form
                        onSubmit={onRequestMedicine}
                        className="space-y-4 mt-6"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="medicineName">Medicine Name *</Label>
                          <Input
                            id="medicineName"
                            value={medicineRequest.Medicine_name}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                Medicine_name: e.target.value,
                              })
                            }
                            placeholder="Enter medicine name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brandName">
                            Brand Name (Optional)
                          </Label>
                          <Input
                            id="brandName"
                            value={medicineRequest.Brand_name}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                Brand_name: e.target.value,
                              })
                            }
                            placeholder="Preferred brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={medicineRequest.Category}
                            onValueChange={(value) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                Category: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pain Relief">
                                Pain Relief
                              </SelectItem>
                              <SelectItem value="Cold & Flu">
                                Cold & Flu
                              </SelectItem>
                              <SelectItem value="Allergy">Allergy</SelectItem>
                              <SelectItem value="Digestive Health">
                                Digestive Health
                              </SelectItem>
                              <SelectItem value="Vitamins & Supplements">
                                Vitamins & Supplements
                              </SelectItem>
                              <SelectItem value="Antibiotics">
                                Antibiotics
                              </SelectItem>
                              <SelectItem value="Heart & Blood Pressure">
                                Heart & Blood Pressure
                              </SelectItem>
                              <SelectItem value="Diabetes">Diabetes</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dosage">Dosage/Strength</Label>
                          <Input
                            id="dosage"
                            value={medicineRequest.Dosage}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                Dosage: e.target.value,
                              })
                            }
                            placeholder="e.g., 500mg, 10ml"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="urgency">Urgency</Label>
                          <Select
                            value={medicineRequest.urgency}
                            onValueChange={(value) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                urgency: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">
                                Low - Can wait 1-2 weeks
                              </SelectItem>
                              <SelectItem value="Normal">
                                Normal - Need within a week
                              </SelectItem>
                              <SelectItem value="High">
                                High - Need within 2-3 days
                              </SelectItem>
                              <SelectItem value="Urgent">
                                Urgent - Need immediately
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactInfo">
                            Contact Information *
                          </Label>
                          <Input
                            id="contactInfo"
                            value={medicineRequest.contactInfo}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                contactInfo: e.target.value,
                              })
                            }
                            placeholder="Phone number or email"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Description & Notes
                          </Label>
                          <Textarea
                            id="description"
                            value={medicineRequest.Description}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                Description: e.target.value,
                              })
                            }
                            placeholder="Any additional details about the medicine you need..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            value={medicineRequest.notes}
                            onChange={(e) =>
                              setMedicineRequest({
                                ...medicineRequest,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Any other information..."
                            rows={2}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pharmacies;
