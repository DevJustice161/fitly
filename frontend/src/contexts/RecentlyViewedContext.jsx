import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const RecentlyViewedContext = createContext();

export const RecentlyViewedProvider = ({ children }) => {
  const { user } = useAuth();

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentlyViewed = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/recently-viewed/${user.id}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch recently viewed products",
        );
      }

      setRecentlyViewed(data);
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to load recently viewed products");
    } finally {
      setLoading(false);
    }
  };

  const addRecentlyViewed = async (productId) => {
    if (!user?.id || !productId) return;

    try {
      const res = await fetch("http://localhost:5000/api/recently-viewed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to save recently viewed product",
        );
      }

      await fetchRecentlyViewed();
    } catch (error) {
      console.error(error);
    }
  };

  const removeRecentlyViewed = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/recently-viewed/item/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove product");
      }

      setRecentlyViewed((prev) => prev.filter((item) => item.id !== id));

      toast.success("Removed from recently viewed");
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to remove product");
    }
  };

  const clearRecentlyViewed = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/recently-viewed/clear/${user.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to clear recently viewed");
      }

      setRecentlyViewed([]);

      toast.success("Recently viewed cleared");
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to clear recently viewed");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecentlyViewed();
    } else {
      setRecentlyViewed([]);
    }
  }, [user]);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        loading,
        fetchRecentlyViewed,
        addRecentlyViewed,
        removeRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);

  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider",
    );
  }

  return context;
};
