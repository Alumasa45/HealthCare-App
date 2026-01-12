import { useState } from "react";
import { PaystackButton } from "react-paystack";
import { paymentApi } from "@/api/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard, Shield, CheckCircle } from "lucide-react";

interface PayProps {
  email: string;
  amount: number; // In KES
  onSuccess: () => void;
  billId?: number;
}

const PayWithPaystack = ({ email, amount, onSuccess, billId }: PayProps) => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const [ref] = useState(
    () => `ref-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );
  const [isProcessing, setIsProcessing] = useState(false);


  const componentProps = {
    email,
    amount: Math.round(amount * 100), // Convert to kobo
    reference: ref,
    publicKey,
    text: `Pay KES ${amount.toLocaleString()}`,
    onSuccess: async (reference: any) => {
      console.log("Payment Success! Reference:", reference);
      setIsProcessing(true);

      try {
        // Verify payment with backend
        const verification = await paymentApi.verifyPaymentByReference(
          reference.reference
        );

        if (verification.status && verification.data.status === "success") {
          toast.success("Payment verified successfully!");
          onSuccess();
        } else {
          toast.error("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(
          "Failed to verify payment. Please contact support with reference: " +
            reference.reference
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

  const handleManualPayment = async () => {
    try {
      setIsProcessing(true);

      if (billId) {
        // Initialize payment for specific bill
        const initResponse = await paymentApi.initializeBillPayment(billId, {
          patientEmail: email,
          callbackUrl: window.location.origin + "/payment/success",
        });

        if (initResponse.status && initResponse.data.authorization_url) {
          // Redirect to Paystack payment page
          window.location.href = initResponse.data.authorization_url;
        } else {
          toast.error("Failed to initialize payment");
        }
      } else {
        // General payment initialization
        const initResponse = await paymentApi.initializePayment({
          email,
          amount: Math.round(amount * 100), // Convert to kobo
          reference: ref,
          callback_url: window.location.origin + "/payment/success",
          metadata: {
            custom_fields: [
              {
                display_name: "Service",
                variable_name: "service",
                value: "Healthcare Services",
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Payment Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Payment system is not properly configured. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            KES {amount.toLocaleString()}
          </p>
          <p className="text-gray-600">Total Amount</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Secure payment with Paystack
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Support for cards, bank transfer, USSD
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Instant payment confirmation
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Paystack Button Integration */}
          <PaystackButton
            {...componentProps}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          />

          {/* Alternative Manual Payment */}
          <Button
            onClick={handleManualPayment}
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay via Paystack Portal"}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Reference: {ref}</p>
          <p>Your payment is secured by Paystack</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayWithPaystack;
