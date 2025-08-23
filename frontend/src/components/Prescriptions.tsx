import type { Prescription } from "@/api/interfaces/prescription";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { prescriptionapi } from "@/api/prescriptions";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTableSkeleton } from "./ui/table-skeleton";

interface TableRowActionsProps {
  prescription: Prescription;
  onEdit: (prescription: Prescription) => void;
  onDelete: (Prescription: Prescription) => void;
  onView: (Prescription: Prescription) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  prescription,
  onEdit,
  onDelete,
  onView,
}) => {
  //state management.
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Three dots to trigger the button. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700"
        aria-label="Actions"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Dropdown Menu. */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={() => handleAction(() => onView(prescription))}
            className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>View</span>
          </button>

          <button
            onClick={() => handleAction(() => onEdit(prescription))}
            className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit</span>
          </button>

          <button
            onClick={() => handleAction(() => onDelete(prescription))}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

const Prescriptions = () => {
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: prescriptionapi.findAll,
  });
  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={10}
          rowCount={10}
          filterCount={0}
          optionsCount={0}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "120px",
            "200px",
            "180px",
            "180px",
            "120px",
            "140px",
            "140px",
            "40px",
          ]}
        />
      </div>
    );
  }
  // if (error) return <div>Error loading prescriptions</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow overflow-visible relative">
        <Table>
          <TableCaption>Your Prescriptions have been listed here.</TableCaption>
          <TableHeader className="text bg-purple-300 rounded-lg">
            <TableRow>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Prescribed Amount in grams</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Validity period</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Notes</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-center">Pharmacy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions?.map((prescription) => (
              <TableRow key={prescription.Prescription_id}>
                <TableCell className="font-medium">
                  {prescription.Medicine_Name}
                </TableCell>
                <TableCell>{prescription.Prescription_Number}</TableCell>
                <TableCell>
                  {prescription.Issue_Date instanceof Date
                    ? prescription.Issue_Date.toLocaleDateString()
                    : String(prescription.Issue_Date)}
                </TableCell>
                <TableCell className="text-right">
                  {prescription.Validity_Period instanceof Date
                    ? prescription.Validity_Period.toLocaleDateString()
                    : String(prescription.Validity_Period)}
                </TableCell>
                <TableCell className="text-right">
                  {prescription.Total_Amount}
                </TableCell>
                <TableCell className="text-right">
                  {prescription.Status}
                </TableCell>
                <TableCell className="text-right">
                  {prescription.Notes}
                </TableCell>
                <TableCell className="text-center">
                  <TableRowActions
                    prescription={prescription}
                    onEdit={() => {
                      /* TODO: implement edit functionality */
                    }}
                    onDelete={() => {
                      /* TODO: implement delete functionality */
                    }}
                    onView={() => {
                      /* TODO: implement view functionality */
                    }}
                  />
                </TableCell>
                <TableCell className="text-center">
                  {prescription.Status === "Active" ? (
                    <Link to="/pharmacies" className="inline-block">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Go to Pharmacy
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {prescription.Status === "Completed"
                        ? "Completed"
                        : "Expired"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Prescriptions;
