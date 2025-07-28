import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  Shield,
  CheckCircle,
  X,
  FileText,
  ShoppingCart,
  Calendar,
  DollarSign,
} from "lucide-react";
import { PaystackButton } from "react-paystack";
import { paymentApi } from "@/api/payment";
import { format } from "date-fns";

interface PaymentItem {
  id: string;
  type: "bill" | "medicine_order";
  description: string;
  amount: number;
  date: string | Date;
  status: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaymentItem[];
  patientEmail: string;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  patientEmail,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "paystack_popup" | "paystack_redirect"
  >("paystack_popup");

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const [reference] = useState(
    () => `ref-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  // Paystack popup configuration
  const paystackProps = {
    email: patientEmail,
    amount: Math.round(totalAmount * 100), // Convert to kobo
    reference: reference,
    publicKey: publicKey || "",
    text: `Pay ${formatCurrency(totalAmount)}`,
    onSuccess: async (response: any) => {
      console.log("Payment Success! Reference:", response.reference);
      setIsProcessing(true);

      try {
        // Verify payment with backend
        const verification = await paymentApi.verifyPaymentByReference(
          response.reference
        );

        if (verification.status && verification.data.status === "success") {
          toast.success("Payment verified successfully!");
          onPaymentSuccess();
          onClose();
        } else {
          toast.error("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(
          "Failed to verify payment. Please contact support with reference: " +
            response.reference
        );
      } finally {
        setIsProcessing(false);
      }
    },
    onClose: () => {
      console.log("Payment window closed");
      toast.info("Payment window was closed. You can try again when ready.");
    },
  };

  const handlePaystackRedirect = async () => {
    try {
      setIsProcessing(true);

      // Initialize payment
      const initResponse = await paymentApi.initializePayment({
        email: patientEmail,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        reference: reference,
        callback_url: window.location.origin + "/payment/success",
        metadata: {
          custom_fields: [
            {
              display_name: "Service",
              variable_name: "service",
              value: "Healthcare Services",
            },
            {
              display_name: "Items",
              variable_name: "items",
              value: items.map((item) => `${item.type}:${item.id}`).join(","),
            },
          ],
        },
      });

      if (initResponse.status && initResponse.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = initResponse.data.authorization_url;
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!publicKey) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Payment Configuration Error
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">
              Payment system is not properly configured. Please contact support.
            </p>
            <Button onClick={onClose} className="w-full mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Payment
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "medicine_order" ? (
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.date)}
                          <Badge variant="secondary" className="text-xs">
                            {item.type === "medicine_order" ? "Order" : "Bill"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-semibold">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack_popup"
                    checked={paymentMethod === "paystack_popup"}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Quick Pay (Recommended)</p>
                    <p className="text-sm text-gray-500">
                      Pay instantly with popup window
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack_redirect"
                    checked={paymentMethod === "paystack_redirect"}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Paystack Portal</p>
                    <p className="text-sm text-gray-500">
                      Redirect to secure payment page
                    </p>
                  </div>
                  <Shield className="h-4 w-4 text-blue-500" />
                </label>
              </div>

              {/* Security Features */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Secure Payment Features
                </h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Support for cards, bank transfer, USSD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Buttons */}
          <div className="space-y-3">
            {paymentMethod === "paystack_popup" ? (
              <PaystackButton
                {...paystackProps}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              />
            ) : (
              <Button
                onClick={handlePaystackRedirect}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                disabled={isProcessing}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isProcessing ? "Redirecting..." : "Proceed to Paystack"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>

          {/* Payment Reference */}
          <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
            <p>
              <strong>Payment Reference:</strong> {reference}
            </p>
            <p>Keep this reference for your records</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
