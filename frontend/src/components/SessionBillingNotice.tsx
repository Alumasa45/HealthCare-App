import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useSessionBilling } from "@/hooks/useSessionBilling";
import { useRouter } from "@tanstack/react-router";

export function SessionBillingNotice() {
  const { sessionItems, calculateTotals } = useSessionBilling();
  const router = useRouter();

  const billingSummary = calculateTotals();

  if (!sessionItems || sessionItems.length === 0) {
    return null;
  }

  const handleGoToBilling = () => {
    router.navigate({ to: "/billing" });
  };

  return (
    <Card className="bg-orange-50 border-orange-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p>You have {sessionItems.length} unpaid item(s)</p>
              <p className="text-sm text-orange-600">
                Total amount due: KES{" "}
                {billingSummary.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleGoToBilling}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
