import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionBilling } from "@/hooks/useSessionBilling";
import { billingApi } from "@/api/billing";
import { patientApi } from "@/api/patients";
import { medicineOrderApi } from "@/api/medicineOrders";
import PaymentModal from "@/components/modals/PaymentModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import type { Bill } from "@/api/interfaces/billing";
import type { MedicineOrder } from "@/api/interfaces/orders";

const Billing: React.FC = () => {
  const { user } = useAuth();
  const { sessionItems, calculateTotals } = useSessionBilling();
  const [bills, setBills] = useState<Bill[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<MedicineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [payingAllPending, setPayingAllPending] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentItems, setPaymentItems] = useState<any[]>([]);

  const sessionTotals = calculateTotals();

  useEffect(() => {
    if (user?.User_Type === "Patient" && user?.User_id) {
      fetchPatientAndBills();
    }
  }, [user]);

  const fetchPatientAndBills = async () => {
    try {
      setLoading(true);

      console.log("Fetching patient data for User_id:", user?.User_id);

      // First, get the patient record using User_id
      const patientData = await patientApi.getByUserId(user?.User_id!);
      console.log("Patient data retrieved:", patientData);
      setCurrentPatient(patientData);

      // Then, fetch bills and medicine orders using Patient_id
      if (patientData?.Patient_id) {
        console.log("Fetching bills for Patient_id:", patientData.Patient_id);
        const billsData = await billingApi.findAll(patientData.Patient_id);
        console.log("Bills data retrieved:", billsData);
        setBills(Array.isArray(billsData) ? billsData : []);

        console.log(
          "Fetching medicine orders for Patient_id:",
          patientData.Patient_id
        );
        const ordersData = await medicineOrderApi.findByPatient(
          patientData.Patient_id
        );
        console.log("Medicine orders data retrieved:", ordersData);
        setMedicineOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        console.warn("Patient_id not found in patient data:", patientData);
        setBills([]);
        setMedicineOrders([]);
        toast.warning(
          "Patient profile not found. Please complete your profile setup."
        );
      }
    } catch (error) {
      console.error("Error fetching patient and bills:", error);
      if (error instanceof Error) {
        if (error.message.includes("Patient not found")) {
          toast.error(
            "Patient profile not found. Please complete your profile setup first."
          );
        } else {
          toast.error(`Failed to load billing information: ${error.message}`);
        }
      } else {
        toast.error("Failed to load billing information");
      }
      setBills([]);
      setMedicineOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    if (!currentPatient?.Patient_id) {
      console.warn("No Patient_id available for fetching bills");
      return;
    }

    try {
      setLoading(true);
      const data = await billingApi.findAll(currentPatient.Patient_id);
      setBills(Array.isArray(data) ? data : []);

      const ordersData = await medicineOrderApi.findByPatient(
        currentPatient.Patient_id
      );
      setMedicineOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (
    itemId: string,
    itemType: "bill" | "medicine_order"
  ) => {
    // Find the item to pay
    const allItems = getCombinedBillingItems();
    const itemToPay = allItems.find(
      (item) => item.id === itemId && item.type === itemType
    );

    if (!itemToPay) {
      toast.error("Item not found");
      return;
    }

    // Prepare payment items for the modal
    const paymentItemsData = [
      {
        id: itemToPay.id,
        type: itemToPay.type,
        description: itemToPay.description,
        amount: itemToPay.amount,
        date: itemToPay.date,
        status: itemToPay.status,
      },
    ];

    setPaymentItems(paymentItemsData);
    setShowPaymentModal(true);
  };

  const handlePayAllPending = async () => {
    const allItems = getCombinedBillingItems();
    const pendingItems = allItems.filter((item) => item.status === "Pending");

    if (pendingItems.length === 0) {
      toast.info("No pending items to pay");
      return;
    }

    // Prepare payment items for the modal
    const paymentItemsData = pendingItems.map((item) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      amount: item.amount,
      date: item.date,
      status: item.status,
    }));

    setPaymentItems(paymentItemsData);
    setShowPaymentModal(true);
  };

  const handlePaySessionItems = async () => {
    try {
      setPayingAllPending(true);
      // Here you would typically create bills for session items and then pay them
      // For now, we'll simulate this process
      toast.success("Session items payment processed successfully!");
      // You might want to clear session items here or refresh the data
    } catch (error) {
      console.error("Error processing session payment:", error);
      toast.error("Failed to process session payment");
    } finally {
      setPayingAllPending(false);
    }
  };

  const filterBillsByStatus = (status: string) => {
    const allItems = getCombinedBillingItems();
    switch (status) {
      case "all":
        return allItems;
      case "pending":
        return allItems.filter((item) => item.status === "Pending");
      case "paid":
        return allItems.filter((item) => item.status === "Paid");
      case "overdue":
        return allItems.filter((item) => item.status === "Overdue");
      default:
        return allItems;
    }
  };

  const getTabCount = (status: string) => {
    const filteredItems = filterBillsByStatus(status);
    return filteredItems.length;
  };

  const getTabAmount = (status: string) => {
    const filteredItems = filterBillsByStatus(status);
    return filteredItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

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

  // Combine bills and medicine orders for display
  const getCombinedBillingItems = () => {
    const billItems = bills.map((bill) => ({
      id: bill.Bill_id?.toString() || "",
      type: "bill" as const,
      date: bill.Bill_Date,
      dueDate: bill.Due_Date,
      description: bill.Description,
      amount: bill.Total_Amount,
      status: bill.Payment_Status,
      paymentMethod: bill.Payment_Method,
      paymentDate: bill.Payment_Date,
      originalItem: bill,
    }));

    const orderItems = medicineOrders.map((order) => ({
      id: order.Order_id?.toString() || "",
      type: "medicine_order" as const,
      date: order.Order_Date,
      dueDate: order.Order_Date, // Use order date as due date for now
      description: `Medicine Order #${order.Order_id}`,
      amount: order.Total_Amount,
      status: order.Payment_Status,
      paymentMethod: order.Payment_Method,
      paymentDate: undefined, // Medicine orders don't have payment date in current structure
      originalItem: order,
    }));

    return [...billItems, ...orderItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const calculateSummary = () => {
    const allItems = getCombinedBillingItems();
    const totalAmount = allItems.reduce((sum, item) => sum + item.amount, 0);
    const paidAmount = allItems
      .filter((item) => item.status === "Paid")
      .reduce((sum, item) => sum + item.amount, 0);
    const pendingAmount = allItems
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.amount, 0);
    const overdueAmount = allItems
      .filter((item) => item.status === "Overdue")
      .reduce((sum, item) => sum + item.amount, 0);

    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update the payment status for the paid items
      for (const item of paymentItems) {
        if (item.type === "bill") {
          await billingApi.payBill(item.id, "Card");
          // Update local state
          setBills((prevBills) =>
            prevBills.map((bill) =>
              bill.Bill_id?.toString() === item.id
                ? { ...bill, Payment_Status: "Paid", Payment_Method: "Card" }
                : bill
            )
          );
        } else if (item.type === "medicine_order") {
          await medicineOrderApi.update(item.id, {
            Payment_Status: "Paid",
            Payment_Method: "Card",
          });
          // Update local state
          setMedicineOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.Order_id?.toString() === item.id
                ? { ...order, Payment_Status: "Paid", Payment_Method: "Card" }
                : order
            )
          );
        }
      }

      toast.success(`Successfully paid ${paymentItems.length} item(s)!`);

      // Refresh data to ensure consistency
      await fetchBills();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(
        "Payment successful but failed to update records. Please refresh the page."
      );
    }
  };

  if (user?.User_Type !== "Patient") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              Billing information is only available for patients.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading your billing information...
          </p>
        </div>
      </div>
    );
  }

  // Show message if no patient profile found
  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Patient Profile Required
            </CardTitle>
            <CardDescription>
              You need to complete your patient profile before viewing billing
              information. Please visit your profile settings to complete your
              registration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Billing & Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your bills, payments, and billing history
          </p>
        </div>
      </div>

      {/* Session Billing Notice */}
      {sessionItems.length > 0 && (
        <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <ShoppingCart className="h-5 w-5" />
              Current Session - Unpaid Items
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              You have {sessionItems.length} unpaid item(s) from your current
              session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                  Total Amount Due: KES{" "}
                  {sessionTotals.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Includes consultations, medicines, and applicable taxes
                </p>
              </div>
              <Button
                onClick={handlePaySessionItems}
                disabled={payingAllPending}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {payingAllPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bills & Orders
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTabCount("all")} item{getTabCount("all") !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTabCount("paid")} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTabCount("pending")} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTabCount("overdue")} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Bills & Orders</CardTitle>
          <CardDescription>
            Manage your bills, medicine orders, and make payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                <FileText className="h-4 w-4" />
                All Items ({getTabCount("all")})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                <Clock className="h-4 w-4" />
                Pending ({getTabCount("pending")})
              </TabsTrigger>
              <TabsTrigger
                value="paid"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                <CheckCircle className="h-4 w-4" />
                Paid ({getTabCount("paid")})
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                <AlertCircle className="h-4 w-4" />
                Overdue ({getTabCount("overdue")})
              </TabsTrigger>
            </TabsList>

            {["all", "pending", "paid", "overdue"].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {status === "all" ? "All Items" : `${status} Items`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total Amount: {formatCurrency(getTabAmount(status))}
                      </p>
                    </div>
                    {status === "pending" && getTabCount("pending") > 0 && (
                      <Button
                        onClick={handlePayAllPending}
                        disabled={payingAllPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {payingAllPending ? "Processing..." : "Pay All Pending"}
                      </Button>
                    )}
                  </div>
                </div>

                {filterBillsByStatus(status).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No {status === "all" ? "" : status} items found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {status === "all"
                        ? "You don't have any bills or orders at the moment."
                        : `You don't have any ${status} items.`}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterBillsByStatus(status).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(item.date)}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(item.dueDate)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              <div className="flex items-center gap-2">
                                {item.type === "medicine_order" ? (
                                  <div className="flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                      Order
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs bg-gray-100 text-gray-800 px-1 rounded">
                                      Bill
                                    </span>
                                  </div>
                                )}
                                <span>{item.description}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(item.status)}
                                  {item.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.paymentMethod ? (
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-gray-400" />
                                  {item.paymentMethod}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.status === "Pending" ||
                              item.status === "Overdue" ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setPayingBillId(item.id);
                                      handlePayNow(item.id, item.type);
                                    }}
                                    disabled={payingBillId === item.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {payingBillId === item.id
                                      ? "Processing..."
                                      : "Pay Now"}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  {item.status === "Paid" && item.paymentDate
                                    ? `Paid on ${formatDate(item.paymentDate)}`
                                    : item.status}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        items={paymentItems}
        patientEmail={currentPatient?.Email || user?.Email || ""}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Billing;
