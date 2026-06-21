/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.jsx";

const CartContext = createContext(undefined);

const API_URL = "http://localhost:5000/api/cart";

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH CART (SOURCE OF TRUTH)
  // =========================
  const fetchCart = useCallback(async () => {
    if (!user?.id) return;

    try {
      //setLoading(true);

      const response = await fetch(`${API_URL}/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      setItems(data || []);
    } catch (error) {
      console.error("Fetch cart error:", error);
      toast.error(error.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = useCallback(
    async (product, size = null, color = null, quantity = 1) => {
      if (!user?.id) {
        toast.error("Please login first");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
            quantity,
            size,
            color,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add to cart");
        }

        await fetchCart();
        toast.success(`${product.name} added to cart`);
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error(error.message || "Failed to add to cart");
      }
    },
    [user?.id, fetchCart],
  );

  // =========================
  // REMOVE FROM CART
  // =========================
  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        const response = await fetch(`${API_URL}/remove/${cartItemId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to remove item");
        }

        await fetchCart();
        toast.success("Item removed from cart");
      } catch (error) {
        console.error("Remove cart item error:", error);
        toast.error(error.message || "Failed to remove item");
      }
    },
    [fetchCart],
  );

  // =========================
  // UPDATE QUANTITY
  // =========================
  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        if (quantity <= 0) {
          await removeFromCart(cartItemId);
          return;
        }

        const response = await fetch(`${API_URL}/update/${cartItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update quantity");
        }

        await fetchCart();
      } catch (error) {
        console.error("Update quantity error:", error);
        toast.error(error.message || "Failed to update quantity");
      }
    },
    [removeFromCart, fetchCart],
  );

  const updateVariant = useCallback(async (cartItemId, size, color) => {
    try {
      const response = await fetch(`${API_URL}/variant/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ size, color }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartItemId ? { ...item, size, color } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update variant");
    }
  }, []);

  // =========================
  // CLEAR CART
  // =========================
  const clearCart = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}/clear/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      setItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error(error.message || "Failed to clear cart");
    }
  }, [user?.id]);

  // =========================
  // TOTALS
  // =========================
  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.discount_price || item.price),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        fetchCart,
        updateVariant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
