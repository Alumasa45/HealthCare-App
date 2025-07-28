import React, { createContext, useContext, useReducer, useEffect } from "react";
import type {
  CartItem,
  Cart,
  PharmacyInventory,
} from "@/api/interfaces/pharmacy";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

//medicine and pharmacy Inventory interfaces.
interface FlexiblePharmacyInventory {
  Inventory_id?: number;
  Pharmacy_id: number;
  Medicine_id: number;
  Batch_Number: string;
  Expiry_Date: Date | string;
  Stock_Quantity: number;
  Unit_Price: number;
  Supplier_Name: string;
  Purchase_Date?: Date | string;
  Last_Restocked?: Date | string;
  Wholesale_Price?: number;
  Created_at?: Date | string;
  Updated_at?: Date | string;
  medicine?: {
    Medicine_id: number;
    Medicine_Name: string;
    Brand_Name: string;
    Manufacturer?: string;
    Category: string;
    Dosage: string;
    Strength?: string;
    Description?: string;
    Side_Effects?: string;
    Storage_Instructions?: string;
  };
}

interface CartContextType {
  cart: Cart;
  addToCart: (inventory: FlexiblePharmacyInventory, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: { inventory: PharmacyInventory; quantity: number };
    }
  | { type: "REMOVE_FROM_CART"; payload: { itemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: Cart };

const initialCartState: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { inventory, quantity } = action.payload;

      const existingItemIndex = state.items.findIndex(
        (item) => item.inventory.Inventory_id === inventory.Inventory_id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item.
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + quantity;
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * inventory.Unit_Price,
            };
          }
          return item;
        });
      } else {
        //new medicine addition.
        const newItem: CartItem = {
          id: `${inventory.Inventory_id}-${Date.now()}`,
          inventory,
          quantity,
          totalPrice: quantity * inventory.Unit_Price,
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      const newState = {
        items: newItems,
        totalItems,
        totalAmount,
      };

      return newState;
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case "UPDATE_QUANTITY": {
      const { itemId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { itemId },
        });
      }

      const newItems = state.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.inventory.Unit_Price,
          };
        }
        return item;
      });

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case "CLEAR_CART":
      return initialCartState;

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const { user } = useAuth();

  // Create user-specific cart key
  const getCartKey = () => {
    if (!user?.User_id) return "healthcare-cart-guest";
    return `healthcare-cart-${user.User_id}`;
  };

  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsedCart });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, [user?.User_id]);

  //save the cart to localStorage when a change occurs.
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, user?.User_id]);

  // Clear cart when user logs out or switches accounts
  useEffect(() => {
    if (!user?.User_id) {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user?.User_id]);

  const addToCart = (
    inventory: FlexiblePharmacyInventory,
    quantity: number = 1
  ) => {
    //stock(Medicine) availability.
    if (quantity > inventory.Stock_Quantity) {
      toast.error(`Only ${inventory.Stock_Quantity} items available in stock`);
      return;
    }

    const existingItem = cart.items.find(
      (item) => item.inventory.Inventory_id === inventory.Inventory_id
    );
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + quantity > inventory.Stock_Quantity) {
      toast.error(
        `Cannot add ${quantity} items. Only ${
          inventory.Stock_Quantity - currentQuantity
        } more available`
      );
      return;
    }

    const cartInventory: PharmacyInventory = {
      Inventory_id: inventory.Inventory_id,
      Pharmacy_id: inventory.Pharmacy_id,
      Medicine_id: inventory.Medicine_id,
      Batch_Number: inventory.Batch_Number,
      Expiry_Date: inventory.Expiry_Date,
      Stock_Quantity: inventory.Stock_Quantity,
      Unit_Price: inventory.Unit_Price,
      Supplier_Name: inventory.Supplier_Name,
      Purchase_Date:
        inventory.Purchase_Date ||
        inventory.Last_Restocked ||
        new Date().toISOString(),
      Created_at: inventory.Created_at,
      Updated_at: inventory.Updated_at,
      medicine: inventory.medicine
        ? {
            Medicine_id: inventory.medicine.Medicine_id,
            Medicine_Name: inventory.medicine.Medicine_Name,
            Brand_Name: inventory.medicine.Brand_Name,
            Manufacturer: inventory.medicine.Manufacturer || "",
            Category: inventory.medicine.Category,
            Dosage: inventory.medicine.Dosage,
            Strength: inventory.medicine.Strength || "",
            Description: inventory.medicine.Description || "",
            Side_Effects: inventory.medicine.Side_Effects || "",
            Storage_Instructions: inventory.medicine.Storage_Instructions || "",
          }
        : undefined,
    };

    dispatch({
      type: "ADD_TO_CART",
      payload: { inventory: cartInventory, quantity },
    });
    toast.success(
      `${inventory.medicine?.Medicine_Name || "Medicine"} added to cart`
    );
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { itemId } });
    toast.success("Item removed from cart");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = cart.items.find((item) => item.id === itemId);
    if (item && quantity > item.inventory.Stock_Quantity) {
      toast.error(
        `Only ${item.inventory.Stock_Quantity} items available in stock`
      );
      return;
    }

    dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared");
  };

  const getTotalItems = () => cart.totalItems;
  const getTotalAmount = () => cart.totalAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
