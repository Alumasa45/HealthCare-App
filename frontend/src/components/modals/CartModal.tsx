import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionBilling } from "@/hooks/useSessionBilling";
import { medicineOrderApi } from "@/api/medicineOrders";
import { patientApi } from "@/api/patients";
import type { CreateMedicineOrderDto } from "@/api/interfaces/orders";
import { toast } from "sonner";
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { DialogTitle } from "../ui/dialog";
import { useRouter } from "@tanstack/react-router";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { addSessionItem } = useSessionBilling();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!user || user.User_Type !== "Patient") {
      toast.error("Please login as a patient to place orders");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      // First, get the patient data to get the correct Patient_id
      console.log("Looking up patient for user ID:", user.User_id);
      const patientData = await patientApi.getByUserId(user.User_id);
      if (!patientData?.Patient_id) {
        throw new Error(
          "Unable to find patient information. Please complete your patient profile first."
        );
      }

      console.log("Patient data found:", patientData);

      const itemsByPharmacy = cart.items.reduce((acc, item) => {
        const pharmacyId = item.inventory.Pharmacy_id;
        if (!acc[pharmacyId]) {
          acc[pharmacyId] = [];
        }
        acc[pharmacyId].push(item);
        return acc;
      }, {} as Record<number, typeof cart.items>);

      // Add all cart items to session billing FIRST, before creating orders
      console.log("Adding all items to session billing...");
      Object.entries(itemsByPharmacy).forEach(([pharmacyId, items]) => {
        const totalAmount = items.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );

        console.log("Adding session item with amount:", totalAmount);
        addSessionItem({
          type: "medicine_order",
          id: Date.now() + Math.random(),
          description: `Medicine Order from Pharmacy ${pharmacyId}`,
          amount: totalAmount,
          details: {
            pharmacy_id: parseInt(pharmacyId),
            order_date: new Date().toISOString(),
            item_count: items.length,
          },
        });
      });

      const orderPromises = Object.entries(itemsByPharmacy).map(
        async ([pharmacyId, items]) => {
          const totalAmount = items.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          );

          const orderData: CreateMedicineOrderDto = {
            Patient_id: patientData.Patient_id!, // Use the correct Patient_id (non-null assertion since we checked above)
            Pharmacy_id: parseInt(pharmacyId),
            Total_Amount: Number(totalAmount),
            Order_Status: "Pending",
            Payment_Status: "Pending",
            Payment_Method: paymentMethod,
            Delivery_Address: deliveryAddress,
            Notes: notes,
            orderItems: items.map((item) => ({
              Medicine_id: Number(item.inventory.Medicine_id),
              Quantity: Number(item.quantity),
              Unit_Price: Number(item.inventory.Unit_Price),
              Total_Price: Number(item.totalPrice),
            })),
          };

          console.log("Sending order data:", orderData);
          const order = await medicineOrderApi.create(orderData);
          console.log("Order created successfully:", order);

          return order;
        }
      );

      await Promise.all(orderPromises);

      toast.success(
        `${Object.keys(itemsByPharmacy).length} order(s) placed successfully!`
      );
      clearCart();
      onClose();
      setShowCheckout(false);
      setDeliveryAddress("");
      setNotes("");

      router.navigate({ to: "/billing", search: { tab: "billing" } });
    } catch (error: any) {
      console.error("Error placing order:", error);

      let errorMessage = "Unknown error";

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        // Handle specific error cases
        if (
          error.response.status === 404 ||
          (error.response.data &&
            error.response.data.code === "PATIENT_NOT_FOUND")
        ) {
          errorMessage =
            "Please complete your patient profile before placing orders. Go to Profile → Patient Information.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        console.error("Request:", error.request);
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = error.message;
      }

      toast.error(`Failed to place order: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price}`;
  };

  if (showCheckout) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Checkout
            </DialogTitle>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>{cart.totalItems}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="delivery_address">Delivery Address *</Label>
              <Textarea
                id="delivery_address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special delivery instructions..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
              >
                Back to Cart
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !deliveryAddress.trim()}
                className="flex-1"
              >
                {isProcessing
                  ? "Processing..."
                  : `Place Order - ${formatPrice(cart.totalAmount)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cart.totalItems} items)
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some medicines to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.inventory.medicine?.Medicine_Name ||
                          "Unknown Medicine"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.inventory.medicine?.Brand_Name} •{" "}
                        {item.inventory.medicine?.Category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Batch: {item.inventory.Batch_Number}
                      </p>
                      <p className="text-sm font-medium text-purple-600">
                        {formatPrice(item.inventory.Unit_Price)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={
                          item.quantity >= item.inventory.Stock_Quantity
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.totalPrice)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatPrice(cart.totalAmount)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
