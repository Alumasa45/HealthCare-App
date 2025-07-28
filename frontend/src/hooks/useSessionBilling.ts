import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface SessionItem {
  type: "consultation" | "medicine_order" | "prescription";
  id: number;
  amount: number;
  description: string;
  details?: any;
}

export interface SessionBilling {
  items: SessionItem[];
  totalAmount: number;
  breakdown: {
    consultationFee: number;
    medicineOrdersTotal: number;
    prescriptionsTotal: number;
    taxAmount: number;
  };
}

export const useSessionBilling = () => {
  const { user } = useAuth();
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);

  const getSessionKey = () => {
    if (!user?.User_id) return "healthcare-session-guest";
    return `healthcare-session-${user.User_id}`;
  };

  useEffect(() => {
    const sessionKey = getSessionKey();
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSessionItems(parsedSession);
      } catch (error) {
        console.error("Error loading session from localStorage:", error);
      }
    }
  }, [user?.User_id]);


  useEffect(() => {
    const sessionKey = getSessionKey();
    localStorage.setItem(sessionKey, JSON.stringify(sessionItems));
  }, [sessionItems, user?.User_id]);

  useEffect(() => {
    if (!user?.User_id) {
      setSessionItems([]);
    }
  }, [user?.User_id]);

  const addSessionItem = (item: SessionItem) => {
    setSessionItems((prev) => {
      const existingIndex = prev.findIndex(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      );

      if (existingIndex >= 0) {

        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      } else {
        // Add new item
        return [...prev, item];
      }
    });
  };

  const removeSessionItem = (type: string, id: number) => {
    setSessionItems((prev) =>
      prev.filter((item) => !(item.type === type && item.id === id))
    );
  };

  const clearSession = () => {
    setSessionItems([]);
    const sessionKey = getSessionKey();
    localStorage.removeItem(sessionKey);
  };

  const calculateTotals = (): SessionBilling => {
    const consultationFee = sessionItems
      .filter((item) => item.type === "consultation")
      .reduce((sum, item) => sum + item.amount, 0);

    const medicineOrdersTotal = sessionItems
      .filter((item) => item.type === "medicine_order")
      .reduce((sum, item) => sum + item.amount, 0);

    const prescriptionsTotal = sessionItems
      .filter((item) => item.type === "prescription")
      .reduce((sum, item) => sum + item.amount, 0);

    const subtotal = consultationFee + medicineOrdersTotal + prescriptionsTotal;
    const taxAmount = subtotal * 0.16; // 16% VAT
    const totalAmount = subtotal + taxAmount;

    return {
      items: sessionItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      breakdown: {
        consultationFee,
        medicineOrdersTotal,
        prescriptionsTotal,
        taxAmount: Math.round(taxAmount * 100) / 100,
      },
    };
  };

  const hasItems = () => sessionItems.length > 0;

  return {
    sessionItems,
    addSessionItem,
    removeSessionItem,
    clearSession,
    calculateTotals,
    hasItems,
  };
};
