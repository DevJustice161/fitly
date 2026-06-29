import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.jsx";

const WishlistContext = createContext(undefined);
const API_URL = "http://localhost:5000/api/wishlists";

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const fetchWishlists = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wishlists");
      }

      setItems(data || []);
    } catch (error) {
      console.error("Fetch wishlists error:", error);
      toast.error(error.message || "Failed to load wishlists");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  const isWishlisted = useCallback(
    (productId) =>
      items.some((item) => String(item.product_id) === String(productId)),
    [items],
  );

  const addToWishlist = useCallback(
    async (product) => {
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
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add to cart");
        }

        await fetchWishlists();
        toast.success(`${product.name} added to wishlists`);
      } catch (error) {
        console.error("Add to wishlist error:", error);
        toast.error(error.message || "Failed to add to wishlists");
      }
    },
    [user?.id, fetchWishlists],
  );

  const removeFromWishlist = useCallback(
    async (wishlistItemId) => {
      try {
        const response = await fetch(`${API_URL}/remove/${wishlistItemId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to remove item");
        }

        await fetchWishlists();
        toast.success("Item removed from wishlists");
      } catch (error) {
        console.error("Remove wishlists item error:", error);
        toast.error(error.message || "Failed to remove item");
      }
    },
    [fetchWishlists],
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!user?.id) {
        toast.error("Please login first");
        return;
      }
      const existingItem = items.find(
        (item) => String(item.product_id) === String(product.id),
      );
      if (existingItem) {
        await removeFromWishlist(existingItem.wishlist_id);
      } else {
        await addToWishlist(product);
      }
    },
    [user?.id, items, addToWishlist, removeFromWishlist],
  );
  const clearWishlist = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clear/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear items");
      }

      await fetchWishlists();
      toast.success("Wishlist cleared successfully");
    } catch (error) {
      console.error("Clear wishlist error:", error);
      toast.error(error.message || "Failed to clear wishlist");
    }
  }, [fetchWishlists, user?.id]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        totalWishlists: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
