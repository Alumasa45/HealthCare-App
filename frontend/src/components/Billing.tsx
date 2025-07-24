import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { billingApi } from "@/api/billing";
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
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { Bill } from "@/api/interfaces/billing";

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.User_Type === "Patient" && user?.User_id) {
      fetchBills();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billingApi.findAll(user?.User_id);
      setBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (Bill_id: string, paymentMethod: string) => {
    try {
      setPayingBillId(Bill_id);
      const updatedBill = await billingApi.payBill(Bill_id, paymentMethod);
      if (updatedBill) {
        setBills((prevBills) =>
          prevBills.map((bill) =>
            bill.Bill_id?.toString() === Bill_id ? updatedBill : bill
          )
        );
        toast.success("Payment processed successfully!");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setPayingBillId(null);
    }
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

  const calculateSummary = () => {
    const totalAmount = bills.reduce((sum, bill) => sum + bill.Total_Amount, 0);
    const paidAmount = bills
      .filter((bill) => bill.Payment_Status === "Paid")
      .reduce((sum, bill) => sum + bill.Total_Amount, 0);
    const pendingAmount = bills
      .filter((bill) => bill.Payment_Status === "Pending")
      .reduce((sum, bill) => sum + bill.Total_Amount, 0);
    const overdueAmount = bills
      .filter((bill) => bill.Payment_Status === "Overdue")
      .reduce((sum, bill) => sum + bill.Total_Amount, 0);

    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
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
            Loading billing information...
          </p>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bills.length} bill{bills.length !== 1 ? "s" : ""}
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
              {bills.filter((b) => b.Payment_Status === "Paid").length} paid
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
              {bills.filter((b) => b.Payment_Status === "Pending").length}{" "}
              pending
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
              {bills.filter((b) => b.Payment_Status === "Overdue").length}{" "}
              overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills table.*/}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>
            Your billing history and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No bills found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any bills at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
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
                  {bills.map((bill) => (
                    <TableRow key={bill.Bill_id}>
                      <TableCell className="font-medium">
                        {bill.Bill_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(bill.Bill_Date)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(bill.Due_Date)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {bill.Description}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(bill.Total_Amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.Payment_Status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(bill.Payment_Status)}
                            {bill.Payment_Status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.Payment_Method ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            {bill.Payment_Method}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {bill.Payment_Status === "Pending" ||
                        bill.Payment_Status === "Overdue" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handlePayBill(bill.Bill_id!.toString(), "Card")
                              }
                              disabled={
                                payingBillId === bill.Bill_id!.toString()
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {payingBillId === bill.Bill_id!.toString()
                                ? "Processing..."
                                : "Pay Now"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {bill.Payment_Status === "Paid" && bill.Payment_Date
                              ? `Paid on ${formatDate(bill.Payment_Date)}`
                              : bill.Payment_Status}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
