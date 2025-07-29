import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { medicineApi } from "@/api/medicines";
import { pharmacyInventoryApi } from "@/api/pharmacy";
import type { CreateMedicineDto } from "@/api/interfaces/medicine";
import { Strength } from "@/api/interfaces/medicine";
import type { CreatePharmacyInventoryDto } from "@/api/interfaces/pharmacy";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineAdded: () => void;
  pharmacyId?: number;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onMedicineAdded,
  pharmacyId = 1,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"medicine" | "inventory">("medicine");
  const [createdMedicineId, setCreatedMedicineId] = useState<number | null>(
    null
  );

  const [medicineData, setMedicineData] = useState<CreateMedicineDto>({
    Medicine_Name: "",
    Brand_Name: "",
    Manufacturer: "",
    Category: "",
    Dosage: "",
    Strength: Strength.Average,
    Description: "",
    Side_Effects: "",
    Storage_Instructions: "",
  });

  const [inventoryData, setInventoryData] = useState<
    Omit<CreatePharmacyInventoryDto, "Medicine_id">
  >({
    Pharmacy_id: pharmacyId,
    Batch_Number: "",
    Expiry_Date: "",
    Stock_Quantity: 0,
    Unit_Price: 0,
    Supplier_Name: "",
    Purchase_Date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setMedicineData({
      Medicine_Name: "",
      Brand_Name: "",
      Manufacturer: "",
      Category: "",
      Dosage: "",
      Strength: Strength.Average,
      Description: "",
      Side_Effects: "",
      Storage_Instructions: "",
    });
    setInventoryData({
      Pharmacy_id: pharmacyId,
      Batch_Number: "",
      Expiry_Date: "",
      Stock_Quantity: 0,
      Unit_Price: 0,
      Supplier_Name: "",
      Purchase_Date: new Date().toISOString().split("T")[0],
    });
    setStep("medicine");
    setCreatedMedicineId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const createdMedicine = await medicineApi.create(medicineData);
      setCreatedMedicineId(createdMedicine.Medicine_id);
      setStep("inventory");
      toast.success(
        "Medicine created successfully! Now add inventory details."
      );
    } catch (error) {
      console.error("Error creating medicine:", error);
      toast.error("Failed to create medicine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdMedicineId) return;

    setIsLoading(true);

    try {
      const inventoryPayload: CreatePharmacyInventoryDto = {
        ...inventoryData,
        Medicine_id: createdMedicineId,
      };

      await pharmacyInventoryApi.create(inventoryPayload);
      toast.success("Medicine and inventory added successfully!");
      onMedicineAdded();
      handleClose();
    } catch (error) {
      console.error("Error creating inventory:", error);
      toast.error("Failed to create inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Pain Relief",
    "Cold & Flu",
    "Allergy",
    "Digestive Health",
    "Antibiotics",
    "Vitamins & Supplements",
    "Heart & Blood Pressure",
    "Diabetes",
    "Mental Health",
    "Skin Care",
    "Eye Care",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Medicine {step === "inventory" && "- Inventory Details"}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {step === "medicine" ? (
          <form onSubmit={handleMedicineSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicine_name">Medicine Name *</Label>
                <Input
                  id="medicine_name"
                  value={medicineData.Medicine_Name}
                  onChange={(e) =>
                    setMedicineData((prev) => ({
                      ...prev,
                      Medicine_Name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="brand_name">Brand Name *</Label>
                <Input
                  id="brand_name"
                  value={medicineData.Brand_Name}
                  onChange={(e) =>
                    setMedicineData((prev) => ({
                      ...prev,
                      Brand_Name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  value={medicineData.Manufacturer}
                  onChange={(e) =>
                    setMedicineData((prev) => ({
                      ...prev,
                      Manufacturer: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={medicineData.Category}
                  onValueChange={(value) =>
                    setMedicineData((prev) => ({ ...prev, Category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 500mg, 10ml"
                  value={medicineData.Dosage}
                  onChange={(e) =>
                    setMedicineData((prev) => ({
                      ...prev,
                      Dosage: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="strength">Strength *</Label>
                <Select
                  value={medicineData.Strength}
                  onValueChange={(value) =>
                    setMedicineData((prev) => ({
                      ...prev,
                      Strength: value as Strength,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Strength.Average}>Average</SelectItem>
                    <SelectItem value={Strength.Very_Strong}>
                      Very Strong
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={medicineData.Description}
                onChange={(e) =>
                  setMedicineData((prev) => ({
                    ...prev,
                    Description: e.target.value,
                  }))
                }
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="side_effects">Side Effects</Label>
              <Textarea
                id="side_effects"
                value={medicineData.Side_Effects}
                onChange={(e) =>
                  setMedicineData((prev) => ({
                    ...prev,
                    Side_Effects: e.target.value,
                  }))
                }
                rows={3}
                placeholder="List potential side effects..."
              />
            </div>

            <div>
              <Label htmlFor="storage">Storage Instructions</Label>
              <Textarea
                id="storage"
                value={medicineData.Storage_Instructions}
                onChange={(e) =>
                  setMedicineData((prev) => ({
                    ...prev,
                    Storage_Instructions: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Storage temperature, conditions, etc..."
              />
            </div>

            <div>
              <Label htmlFor="image_url">Medicine Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={medicineData.Image_url || ""}
                onChange={(e) =>
                  setMedicineData((prev) => ({
                    ...prev,
                    Image_url: e.target.value,
                  }))
                }
                placeholder="https://example.com/medicine-image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a direct link to the medicine image
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Next: Add Inventory"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleInventorySubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">
                ✅ Medicine created successfully! Now add inventory details for
                your pharmacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batch_number">Batch Number *</Label>
                <Input
                  id="batch_number"
                  value={inventoryData.Batch_Number}
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Batch_Number: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={
                    typeof inventoryData.Expiry_Date === "string"
                      ? inventoryData.Expiry_Date
                      : inventoryData.Expiry_Date.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Expiry_Date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="1"
                  value={inventoryData.Stock_Quantity}
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Stock_Quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit_price">Unit Price (KES) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventoryData.Unit_Price}
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Unit_Price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="supplier_name">Supplier Name *</Label>
                <Input
                  id="supplier_name"
                  value={inventoryData.Supplier_Name}
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Supplier_Name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="purchase_date">Purchase Date *</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={
                    typeof inventoryData.Purchase_Date === "string"
                      ? inventoryData.Purchase_Date
                      : inventoryData.Purchase_Date.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setInventoryData((prev) => ({
                      ...prev,
                      Purchase_Date: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("medicine")}
              >
                Back
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Complete"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
