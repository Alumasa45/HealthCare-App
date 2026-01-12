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
import { pharmacistApi } from "../api/pharmacists";
import { pharmacyApi, type Pharmacy } from "../api/pharmacies";
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
  Building2,
  CheckCircle,
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
import { useCart } from "@/contexts/CartContext";
import { CartModal } from "@/components/modals/CartModal";

const Pharmacies = () => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [currentPharmacy, setCurrentPharmacy] = useState<Pharmacy | null>(null);
  const [currentPharmacyId, setCurrentPharmacyId] = useState<number | null>(
    null
  );
  const [showPharmacyList, setShowPharmacyList] = useState(true);
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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const transformMedicinesToProducts = (
    medicines: Medicine[],
    inventory: PharmacyInventory[]
  ): Product[] => {
    return medicines
      .map((medicine: Medicine) => {
        const inventoryItem = inventory.find(
          (inv: PharmacyInventory) => inv.Medicine_id === medicine.Medicine_id
        );

        if (!inventoryItem || inventoryItem.Stock_Quantity <= 0) return null;

        return {
          Product_id: medicine.Medicine_id || 0,
          Product_name: medicine.Medicine_Name,
          Category: medicine.Category,
          Price: inventoryItem?.Unit_Price ?? 0,
          OriginalPrice: inventoryItem?.Unit_Price ?? 0,
          DiscountPrice: (inventoryItem?.Unit_Price ?? 0) * 0.9,
          Rating: 4.5,
          Image_url:
            medicine.Image_url ||
            `https://via.placeholder.com/300x200?text=${encodeURIComponent(
              medicine.Medicine_Name
            )}`,
          Brand: medicine.Brand_Name,
          Description: medicine.Description || "",
        };
      })
      .filter((product) => product !== null) as Product[];
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
    Image_url: "",
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

  // Add states for editing and viewing
  const [isEditMedicineOpen, setIsEditMedicineOpen] = useState(false);
  const [isViewMedicineOpen, setIsViewMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);

  const [newInventoryItem, setNewInventoryItem] =
    useState<CreatePharmacyInventoryDto>({
      Pharmacy_id: currentPharmacyId || 1,
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

  // Fetch all pharmacies on component mount
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        console.log("Loading all pharmacies for selection...");
        const pharmacyData = await pharmacyApi.findAll();
        console.log("Pharmacies loaded:", pharmacyData);
        setPharmacies(pharmacyData);

        // If no pharmacies exist, we'll let the user know instead of auto-creating
        if (pharmacyData.length === 0) {
          console.log("No pharmacies found in database");
        }
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        toast.error("Failed to load pharmacies");
      }
    };

    fetchPharmacies();
  }, []);

  // Fetch current pharmacy information for pharmacist users
  useEffect(() => {
    const fetchCurrentPharmacy = async () => {
      if (!user?.User_id || user.User_Type !== "Pharmacist") return;

      try {
        const pharmacy = await pharmacistApi.getByUserId(user.User_id);
        setCurrentPharmacy(pharmacy);
        setCurrentPharmacyId(pharmacy.Pharmacy_id);
      } catch (error) {
        console.error("Error fetching current pharmacy:", error);
        toast.error("Failed to load pharmacy information");
      }
    };

    fetchCurrentPharmacy();
  }, [user]);

  // Update newInventoryItem when currentPharmacyId changes
  useEffect(() => {
    if (currentPharmacyId) {
      setNewInventoryItem((prev) => ({
        ...prev,
        Pharmacy_id: currentPharmacyId,
      }));
    }
  }, [currentPharmacyId]);

  useEffect(() => {
    if (user) {
      const userRole =
        (user as any).role || (user as any).Role || (user as any).user_type;
      if (userRole === "Pharmacist" || userRole === "pharmacist") {
        setIsPharmacist(true);
        setActiveView("pharmacist");
        setShowPharmacyList(false); // Pharmacists don't need to select a pharmacy
      } else {
        setIsPharmacist(false);
        setActiveView("customer");
        setShowPharmacyList(true); // Customers start with pharmacy selection
      }
    }
  }, [user]);

  //refresh functions.
  const refreshData = async () => {
    try {
      setLoading(true);

      // For pharmacists, fetch pharmacy-specific inventory. For customers, fetch all.
      const inventoryPromise =
        user?.User_Type === "Pharmacist" && currentPharmacyId
          ? pharmacyInventoryApi.findByPharmacy(currentPharmacyId)
          : pharmacyInventoryApi.findAll();

      const [medicineData, inventoryData] = await Promise.all([
        medicineApi.findAll(),
        inventoryPromise,
      ]);

      const transformedProducts = transformMedicinesToProducts(
        medicineData,
        inventoryData
      );

      setProducts(transformedProducts);
      setMedicines(medicineData);
      setInventory(inventoryData);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!products.length) setLoading(true);
        await refreshData();
      } catch (error) {
        console.error("Error fetching products", error);
        toast.error("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    // For pharmacists, wait for pharmacy info to load. For customers, don't load until pharmacy is selected.
    if (user?.User_Type === "Pharmacist") {
      if (currentPharmacyId) {
        fetchProducts();
      }
    } else if (!showPharmacyList && currentPharmacyId) {
      // Only load products for customers after they've selected a pharmacy
      fetchProducts();
    }
  }, [currentPharmacyId, user, showPharmacyList]);

  // Handle pharmacy selection for customers
  const handlePharmacySelect = async (pharmacy: Pharmacy) => {
    try {
      console.log("Pharmacy selected:", pharmacy);
      setCurrentPharmacy(pharmacy);
      setCurrentPharmacyId(pharmacy.Pharmacy_id);
      setShowPharmacyList(false);

      // Load pharmacy-specific inventory
      setLoading(true);
      const [medicineData, inventoryData] = await Promise.all([
        medicineApi.findAll(),
        pharmacyInventoryApi.findByPharmacy(pharmacy.Pharmacy_id),
      ]);

      const transformedProducts = transformMedicinesToProducts(
        medicineData,
        inventoryData
      );

      setProducts(transformedProducts);
      setMedicines(medicineData);
      setInventory(inventoryData);

      console.log(
        `Loaded ${transformedProducts.length} products from ${pharmacy.Pharmacy_Name}`
      );
      toast.success(`Welcome to ${pharmacy.Pharmacy_Name}!`);
    } catch (error) {
      console.error("Error loading pharmacy data:", error);
      toast.error("Failed to load pharmacy data");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPharmacies = () => {
    console.log("Navigating back to pharmacy list");
    setShowPharmacyList(true);
    setCurrentPharmacy(null);
    setCurrentPharmacyId(null);
    setProducts([]);
    setInventory([]);
  };

  // Edit and delete handlers.
  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsEditMedicineOpen(true);
  };

  const handleDeleteMedicine = async (medicineId: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    try {
      setLoading(true);
      await medicineApi.delete(medicineId.toLocaleString());
      toast.success("Medicine deleted successfully!");
      await refreshData();
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast.error("Failed to delete medicine.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMedicine = (medicine: Medicine) => {
    setViewingMedicine(medicine);
    setIsViewMedicineOpen(true);
  };

  const handleEditInventory = (inventoryItem: PharmacyInventory) => {
    // Handle inventory editing logic here
    console.log('Editing inventory item:', inventoryItem);
    setIsAddInventoryOpen(true);
  };

  const handleDeleteInventory = async (inventoryId: number) => {
    if (!confirm("Are you sure you want to remove this item from inventory?"))
      return;

    try {
      setLoading(true);
      await pharmacyInventoryApi.delete(inventoryId.toLocaleString());
      toast.success("Item removed from inventory successfully!");
      await refreshData();
    } catch (error) {
      console.error("Error removing inventory item:", error);
      toast.error("Failed to remove inventory item.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;

    try {
      setLoading(true);
      await medicineApi.update(
        editingMedicine.Medicine_id!.toLocaleString(),
        editingMedicine
      );
      toast.success("Medicine updated successfully!");
      setIsEditMedicineOpen(false);
      setEditingMedicine(null);
      await refreshData();
    } catch (error) {
      console.error("Error updating medicine:", error);
      toast.error("Failed to update medicine.");
    } finally {
      setLoading(false);
    }
  };

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
        Image_url: "",
      });

      await refreshData();
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
        Pharmacy_id: currentPharmacyId || 1,
        Medicine_id: 0,
        Batch_Number: "",
        Expiry_Date: "",
        Stock_Quantity: 0,
        Unit_Price: 0,
        Wholesale_Price: 0,
        Supplier_Name: "",
        Last_Restocked: new Date().toISOString().split("T")[0],
      });

      await refreshData();
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

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart clicked for product:", product);
    console.log("Current user:", user);
    console.log("User type:", user?.User_Type);

    if (!user || user.User_Type === "Pharmacist") {
      toast.error("Please login as a patient to add items to cart");
      return;
    }

    const inventoryItem = inventory.find(
      (inv) => inv.Medicine_id === product.Product_id
    );
    console.log("Found inventory item:", inventoryItem);

    if (!inventoryItem) {
      toast.error("Product not available in inventory");
      return;
    }

    if (inventoryItem.Stock_Quantity <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    const fullMedicine = medicines.find(
      (m) => m.Medicine_id === product.Product_id
    );

    const cartInventoryItem = {
      Inventory_id: inventoryItem.Inventory_id,
      Pharmacy_id: inventoryItem.Pharmacy_id,
      Medicine_id: inventoryItem.Medicine_id,
      Batch_Number: inventoryItem.Batch_Number,
      Expiry_Date: inventoryItem.Expiry_Date,
      Stock_Quantity: inventoryItem.Stock_Quantity,
      Unit_Price: inventoryItem.Unit_Price,
      Supplier_Name: inventoryItem.Supplier_Name,
      Last_Restocked: inventoryItem.Last_Restocked,
      Created_at: inventoryItem.Created_at,
      Updated_at: inventoryItem.Updated_at,
      medicine: fullMedicine
        ? {
            Medicine_id: fullMedicine.Medicine_id!,
            Medicine_Name: fullMedicine.Medicine_Name,
            Brand_Name: fullMedicine.Brand_Name,
            Manufacturer: fullMedicine.Manufacturer || "",
            Category: fullMedicine.Category,
            Dosage: fullMedicine.Dosage,
            Strength: fullMedicine.Strength || "",
            Description: fullMedicine.Description || "",
            Side_Effects: fullMedicine.Side_Effects || "",
            Storage_Instructions: fullMedicine.Storage_Instructions || "",
            Image_url: fullMedicine.Image_url,
          }
        : inventoryItem.medicine
        ? {
            Medicine_id: inventoryItem.medicine.Medicine_id,
            Medicine_Name: inventoryItem.medicine.Medicine_Name,
            Brand_Name: inventoryItem.medicine.Brand_Name,
            Category: inventoryItem.medicine.Category,
            Dosage: inventoryItem.medicine.Dosage,
            Image_url: inventoryItem.medicine.Image_url,
          }
        : undefined,
    };

    console.log("Cart inventory item to add:", cartInventoryItem);
    console.log("Calling addToCart with quantity 1");
    addToCart(cartInventoryItem, 1);
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
          Pharmacy_id: currentPharmacyId || 1,
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

      await refreshData();
    } catch (error) {
      console.error("Error adding medicine to shop:", error);
      toast.error("Failed to add medicine to shop.");
    } finally {
      setLoading(false);
    }
  };
  //filters.
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const selectedCategories = categories
      .filter((cat) => cat.checked)
      .map((cat) => cat.name);
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.Category);

    const selectedBrands = brands
      .filter((brand) => brand.checked)
      .map((brand) => brand.name);
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(product.Brand);

    const matchesPrice =
      !selectedPriceRange ||
      (() => {
        const price = product.Price;
        switch (selectedPriceRange) {
          case "Under KES 500":
            return price < 500;
          case "KES 500 - KES 1000":
            return price >= 500 && price <= 1000;
          case "Above KES.1000.00":
            return price > 1000;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return a.Price - b.Price;
      case "Price: High to Low":
        return b.Price - a.Price;
      case "Name: A to Z":
        return a.Product_name.localeCompare(b.Product_name);
      case "Name: Z to A":
        return b.Product_name.localeCompare(a.Product_name);
      case "Rating":
        return b.Rating - a.Rating;
      case "Best Seller":
      default:
        return b.Rating - a.Rating;
    }
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {!showPharmacyList && !isPharmacist && currentPharmacy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToPharmacies}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Pharmacies</span>
                </Button>
              )}
              <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {!showPharmacyList && currentPharmacy
                  ? currentPharmacy.Pharmacy_Name
                  : isPharmacist
                  ? "Pharmacy Management"
                  : "Select Pharmacy"}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder={
                    isPharmacist && activeView === "pharmacist"
                      ? "Search medicines..."
                      : "Search medicines..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <nav className="flex items-center space-x-8">
              {!isPharmacist && (
                <>
                  <a
                    href="/healthblog"
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Health Blog
                  </a>
                </>
              )}
              <User className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
              {!isPharmacist && (
                <div className="relative">
                  <ShoppingCart
                    className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => setIsCartModalOpen(true)}
                  />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 dark:bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
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
          onEditMedicine={handleEditMedicine}
          onDeleteMedicine={handleDeleteMedicine}
          onViewMedicine={handleViewMedicine}
          onEditInventory={handleEditInventory}
          onDeleteInventory={handleDeleteInventory}
        />
      ) : showPharmacyList && !isPharmacist ? (
        <PharmacyListView
          pharmacies={pharmacies}
          onPharmacySelect={handlePharmacySelect}
          loading={loading}
        />
      ) : (
        <CustomerView
          products={sortedProducts}
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
          handleAddToCart={handleAddToCart}
          user={user}
          isCartModalOpen={isCartModalOpen}
          setIsCartModalOpen={setIsCartModalOpen}
        />
      )}

      {/* Edit and View Modals */}
      <EditMedicineModal
        isOpen={isEditMedicineOpen}
        onClose={() => {
          setIsEditMedicineOpen(false);
          setEditingMedicine(null);
        }}
        medicine={editingMedicine}
        onSave={handleUpdateMedicine}
        setMedicine={setEditingMedicine}
        loading={loading}
      />

      <ViewMedicineModal
        isOpen={isViewMedicineOpen}
        onClose={() => {
          setIsViewMedicineOpen(false);
          setViewingMedicine(null);
        }}
        medicine={viewingMedicine}
      />
    </div>
  );
};

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
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (medicineId: number) => void;
  onViewMedicine: (medicine: Medicine) => void;
  onEditInventory: (inventory: PharmacyInventory) => void;
  onDeleteInventory: (inventoryId: number) => void;
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
  onEditMedicine,
  onDeleteMedicine,
  onViewMedicine,
  onEditInventory,
  onDeleteInventory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pharmacy Inventory Management
          </h2>
          <div className="flex items-center space-x-4">
            <Sheet open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
              <SheetTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
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
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      value={newMedicine.Image_url || ""}
                      onChange={(e) =>
                        setNewMedicine({
                          ...newMedicine,
                          Image_url: e.target.value,
                        })
                      }
                      placeholder="https://example.com/medicine-image.jpg"
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
                <Button
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
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
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="medicines"
            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
          >
            Medicines Database
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
          >
            My Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicines" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Medicines Database
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 dark:border-purple-400 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading medicines...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Manufacturer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {medicines.map((medicine) => (
                        <tr
                          key={medicine.Medicine_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {medicine.Medicine_Name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {medicine.Brand_Name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={
                                  medicine.Image_url ||
                                  `https://via.placeholder.com/64x64?text=${encodeURIComponent(
                                    medicine.Medicine_Name
                                  )}`
                                }
                                alt={medicine.Medicine_Name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://via.placeholder.com/64x64?text=${encodeURIComponent(
                                    medicine.Medicine_Name
                                  )}`;
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {medicine.Category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {medicine.Dosage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {medicine.Manufacturer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => onViewMedicine(medicine)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => onEditMedicine(medicine)}
                                title="Edit Medicine"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-900"
                                onClick={() =>
                                  onDeleteMedicine(medicine.Medicine_id!)
                                }
                                title="Delete Medicine"
                              >
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

        <TabsContent value="inventory" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Pharmacy Inventory
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 dark:border-purple-400 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading inventory...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {inventory.map((item) => (
                        <tr
                          key={item.Inventory_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.medicine?.Medicine_Name ||
                                  "Unknown Medicine"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.medicine?.Brand_Name || "Unknown Brand"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.medicine?.Category || "Unknown Category"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={
                                  item.medicine?.Image_url ||
                                  `https://via.placeholder.com/64x64?text=${encodeURIComponent(
                                    item.medicine?.Medicine_Name || "Med"
                                  )}`
                                }
                                alt={item.medicine?.Medicine_Name || "Medicine"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://via.placeholder.com/64x64?text=${encodeURIComponent(
                                    item.medicine?.Medicine_Name || "Med"
                                  )}`;
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {item.Batch_Number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.Stock_Quantity > 50
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : item.Stock_Quantity > 20
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {item.Stock_Quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            KES {item.Unit_Price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {new Date(item.Expiry_Date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => onEditInventory(item)}
                                title="Edit Inventory"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-900"
                                onClick={() =>
                                  onDeleteInventory(item.Inventory_id!)
                                }
                                title="Remove from Inventory"
                              >
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

// Add Edit Medicine Modal
const EditMedicineModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSave: (e: React.FormEvent) => void;
  setMedicine: (medicine: Medicine) => void;
  loading: boolean;
}> = ({ isOpen, onClose, medicine, onSave, setMedicine, loading }) => {
  if (!medicine) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Medicine</SheetTitle>
          <SheetDescription>Update the medicine information.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSave} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="editMedicineName">Medicine Name</Label>
            <Input
              id="editMedicineName"
              value={medicine.Medicine_Name}
              onChange={(e) =>
                setMedicine({ ...medicine, Medicine_Name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editBrandName">Brand Name</Label>
            <Input
              id="editBrandName"
              value={medicine.Brand_Name}
              onChange={(e) =>
                setMedicine({ ...medicine, Brand_Name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editManufacturer">Manufacturer</Label>
            <Input
              id="editManufacturer"
              value={medicine.Manufacturer || ""}
              onChange={(e) =>
                setMedicine({ ...medicine, Manufacturer: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCategory">Category</Label>
            <Select
              value={medicine.Category}
              onValueChange={(value) =>
                setMedicine({ ...medicine, Category: value })
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
            <Label htmlFor="editDosage">Dosage</Label>
            <Input
              id="editDosage"
              value={medicine.Dosage}
              onChange={(e) =>
                setMedicine({ ...medicine, Dosage: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDescription">Description</Label>
            <Textarea
              id="editDescription"
              value={medicine.Description || ""}
              onChange={(e) =>
                setMedicine({ ...medicine, Description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editImageUrl">Image URL</Label>
            <Input
              id="editImageUrl"
              value={medicine.Image_url || ""}
              onChange={(e) =>
                setMedicine({ ...medicine, Image_url: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Medicine"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// Add View Medicine Modal
const ViewMedicineModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}> = ({ isOpen, onClose, medicine }) => {
  if (!medicine) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Medicine Details</SheetTitle>
          <SheetDescription>
            View detailed information about this medicine.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {medicine.Image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={medicine.Image_url}
                alt={medicine.Medicine_Name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(
                    medicine.Medicine_Name
                  )}`;
                }}
              />
            </div>
          )}
          <div className="space-y-3">
            <div>
              <Label className="font-semibold">Medicine Name</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Medicine_Name}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Brand Name</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Brand_Name}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Manufacturer</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Manufacturer || "N/A"}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Category</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Category}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Dosage</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Dosage}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Strength</Label>
              <p className="text-gray-700 dark:text-gray-300">
                {medicine.Strength || "N/A"}
              </p>
            </div>
            {medicine.Description && (
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="text-gray-700 dark:text-gray-300">
                  {medicine.Description}
                </p>
              </div>
            )}
            {medicine.Side_Effects && (
              <div>
                <Label className="font-semibold">Side Effects</Label>
                <p className="text-gray-700 dark:text-gray-300">
                  {medicine.Side_Effects}
                </p>
              </div>
            )}
            {medicine.Storage_Instructions && (
              <div>
                <Label className="font-semibold">Storage Instructions</Label>
                <p className="text-gray-700 dark:text-gray-300">
                  {medicine.Storage_Instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

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
  handleAddToCart: (product: Product) => void;
  user: any; // Add user prop
  isCartModalOpen: boolean;
  setIsCartModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  handleAddToCart,
  user,
  isCartModalOpen,
  setIsCartModalOpen,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-8">
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900 dark:text-gray-100">Medicines</span>
      </nav>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Filter By
            </h3>
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                Categories
              </h4>
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
                      className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                Price Range
              </h4>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range} className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range}
                      onChange={() => setSelectedPriceRange(range)}
                      className="text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {range}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                Medicine brand
              </h4>
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
                      className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-purple-600 dark:bg-purple-700 text-white py-2 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Cold & Flu Medicines
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {products.length} products found
              </p>
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
                      <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                      <Input
                        id="imageUrl"
                        value={shopMedicine.Image_url}
                        onChange={(e) =>
                          setShopMedicine({
                            ...shopMedicine,
                            Image_url: e.target.value,
                          })
                        }
                        placeholder="https://example.com/medicine-image.jpg"
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

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
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
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 dark:border-purple-400 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading products...
              </p>
            </div>
          ) : (
            <>
              {Array.isArray(products) && products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {products.map((product) => (
                      <div
                        key={product.Product_id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="relative">
                          <img
                            src={product.Image_url}
                            alt={product.Product_name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                                product.Product_name
                              )}`;
                            }}
                          />
                          <span className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                            {product.Category}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {product.Product_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {product.Description}
                          </p>

                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {renderStars(product.Rating)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                KES.{product.OriginalPrice}
                              </span>
                              {product.DiscountPrice && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                                  KES.{product.DiscountPrice}
                                </span>
                              )}
                            </div>
                            <button
                              className="bg-purple-600 dark:bg-purple-700 text-white p-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleAddToCart(product)}
                              disabled={
                                !user || user.User_Type === "Pharmacist"
                              }
                            >
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

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </div>
  );
};

// PharmacyListView Component
const PharmacyListView = ({
  pharmacies,
  onPharmacySelect,
  loading,
}: {
  pharmacies: Pharmacy[];
  onPharmacySelect: (pharmacy: Pharmacy) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading pharmacies...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Select a Pharmacy
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from our verified pharmacy partners to browse their available
          medications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.Pharmacy_id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onPharmacySelect(pharmacy)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {pharmacy.Pharmacy_Name}
                    </h3>
                    {pharmacy.Is_Verified && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pharmacy.Rating}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="w-16">Email:</span>
                  <span>{pharmacy.Email}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">Phone:</span>
                  <span>{pharmacy.Phone_Number}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">Hours:</span>
                  <span>
                    {pharmacy.Opening_Time} - {pharmacy.Closing_Time}
                  </span>
                </div>
                {pharmacy.Delivery_Available && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Delivery Available</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <Button className="w-full" variant="default">
                  Browse Medications
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pharmacies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No pharmacies available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please check back later for available pharmacy partners.
          </p>
        </div>
      )}
    </div>
  );
};

export default Pharmacies;
