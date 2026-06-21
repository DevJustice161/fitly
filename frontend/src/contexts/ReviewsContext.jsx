import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockOrders } from "@/data/dashboardData";
//import { products } from "@/data/products";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.jsx";

const STORAGE_KEY = "fitly_reviews_v1";
const HELPFUL_KEY = "fitly_reviews_helpful_v1";

export const CURRENT_USER = () => {
  const { user } = useAuth();
  return { id: user.id, name: user.name, avatar: user.avatar };
};

// Seed reviews — tied to real product ids
const seedReviews = () => [
  {
    id: "r-seed-1",
    productId: "1",
    userId: "u-chiamaka",
    userName: "Chiamaka E.",
    userAvatar: null,
    orderItemId: "seed-o1",
    rating: 5,
    title: "Absolutely stunning gown",
    review:
      "The material is premium and delivery was fast. Got so many compliments at the wedding!",
    images: [],
    helpful: 23,
    verified: true,
    reply: {
      text: "Thank you so much! We are thrilled you loved it.",
      date: "2026-06-02",
    },
    createdAt: "2026-05-28",
    updatedAt: "2026-05-28",
  },
  {
    id: "r-seed-2",
    productId: "1",
    userId: "u-tunde",
    userName: "Tunde A.",
    userAvatar: null,
    orderItemId: "seed-o2",
    rating: 4,
    title: "Great quality, runs slightly large",
    review:
      "Beautiful gown. Sizing runs slightly large but still elegant. Vendor was responsive.",
    images: [],
    helpful: 8,
    verified: true,
    reply: null,
    createdAt: "2026-05-15",
    updatedAt: "2026-05-15",
  },
  {
    id: "r-seed-3",
    productId: "2",
    userId: "u-ade",
    userName: "Ade O.",
    userAvatar: null,
    orderItemId: "seed-o3",
    rating: 5,
    title: "Perfect Agbada",
    review: "Tailoring is on point. Worth every naira.",
    images: [],
    helpful: 14,
    verified: true,
    reply: null,
    createdAt: "2026-04-20",
    updatedAt: "2026-04-20",
  },
  {
    id: "r-seed-4",
    productId: "3",
    userId: "u-blessing",
    userName: "Blessing N.",
    userAvatar: null,
    orderItemId: "seed-o4",
    rating: 3,
    title: "Nice but smaller than expected",
    review: "Bag is cute but smaller than the photos suggest.",
    images: [],
    helpful: 4,
    verified: true,
    reply: null,
    createdAt: "2026-04-10",
    updatedAt: "2026-04-10",
  },
];

const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [helpfulVotes, setHelpfulVotes] = useState(() => {
    try {
      const raw = localStorage.getItem(HELPFUL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    //return {};
  });

  const getProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/productsCard",
      );
      const data = await response.json();
      setProducts(data);
      //localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      console.log("Can't fetch prducts", error);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log("Can't fetch orders", error);
    }
  };

  const getReviews = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.log("can't fetch reviews", error);
    }
  };

  useEffect(() => {
    getProducts();
    getOrders();
    getReviews();
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(HELPFUL_KEY, JSON.stringify(helpfulVotes));
    } catch {}
  }, [helpfulVotes]);

  const addReview = async (revData) => {
    try {
      const formData = new FormData();

      formData.append("userId", user.id);
      formData.append("productId", revData.productId);
      formData.append("helpful", 0);
      formData.append("orderItemId", revData.orderItemId);
      formData.append("title", revData.title);
      formData.append("review", revData.review);
      formData.append("rating", revData.rating);
      revData.images.forEach((file) => {
        formData.append("gallery", file);
      });
      const response = await fetch(`http://localhost:5000/api/reviews/add`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to reviews");
      }
      await getReviews();
    } catch (error) {
      console.error("Add to reviews error:", error);
      toast.error(error.message || "Failed to add to reviews");
    }
  };

  const updateReview = async (id, patch) => {
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("productId", patch.productId);
      formData.append("rating", patch.rating);
      formData.append("title", patch.title);
      formData.append("review", patch.review);
      formData.append("images", JSON.stringify(patch.images));
      patch.newImages.forEach((file) => {
        formData.append("gallery", file);
      });
      const response = await fetch(
        `http://localhost:5000/api/reviews/update/${id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update reviews");
      }
      await getReviews();
    } catch (error) {
      console.log("Can't update review", error);
    }
  };

  const deleteReview = async (id) => {
    //setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/delete/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete review");
      }

      await getReviews();
    } catch (error) {
      console.error("Delete error:", error);

      toast({
        title: "Delete failed",
        description: error.message || "Could not delete review",
        variant: "destructive",
      });
    }
  };

  const toggleHelpful = async (id) => {
    const already = !!helpfulVotes[id];
    const arithmetic = already ? "subtract" : "add";
    setHelpfulVotes((prev) => ({ ...prev, [id]: !already }));
    const response = await fetch(
      `http://localhost:5000/api/reviews/update-helpful/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ arithmetic }),
      },
    );

    await getReviews();
  };

  const replyToReview = (id, text) => {
    const date = new Date().toISOString().slice(0, 10);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: { text, date } } : r)),
    );
  };

  const deleteReply = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: null } : r)),
    );
  };

  // Helpers
  const getProductReviews = (productId) =>
    reviews.filter((r) => String(r.productId) === String(productId));

  const getProductStats = (productId) => {
    const list = getProductReviews(productId);
    const count = list.length;
    if (count === 0)
      return {
        avg: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    const sum = list.reduce((a, r) => a + r.rating, 0);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return { avg: sum / count, count, distribution };
  };

  const getUserReviews = (userId = user.id) => {
    return reviews.filter((r) => String(r.userId) === String(userId));
  };

  const getVendorReviews = (vendorName) => {
    const vendorProductIds = products
      .filter((p) => p.vendor === vendorName)
      .map((p) => String(p.id));
    return reviews.filter((r) =>
      vendorProductIds.includes(String(r.productId)),
    );
  };

  // Reviewable items: delivered orders for current user, not yet reviewed
  const reviewableItems = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    return delivered.map((o) => {
      // Map order.product (name) to a real product id when possible
      const match =
        products.find(
          (p) => p.name.toLowerCase() === String(o.product_name).toLowerCase(),
        ) || products.find((p) => p.vendor_name === o.store_name);
      const productId = match ? match.id : o.product_id;
      const orderItemId = o.order_item_id;
      const existing = reviews.find(
        (r) =>
          String(r.userId) === String(user?.id) &&
          String(r.order_item_id) === String(orderItemId),
      );
      return {
        orderItemId,
        productId,
        productName: o.product_name,
        productImage: match ? match.thumbnail : o.thumbnail,
        vendor: o.store_name,
        date: o.created_at,
        reviewed: !!existing,
        existingReviewId: existing?.id || null,
      };
    });
  }, [reviews, products, orders]);

  const canReview = (productId, orderItemId) => {
    if (!orderItemId) return false;
    const item = reviewableItems.find(
      (i) =>
        i.orderItemId === orderItemId &&
        String(i.productId) === String(productId),
    );
    if (!item) return false;
    return !item.reviewed;
  };

  const hasUserVotedHelpful = (id) => !!helpfulVotes[id];

  const value = {
    reviews,
    addReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    replyToReview,
    deleteReply,
    getProductReviews,
    getProductStats,
    getUserReviews,
    getVendorReviews,
    reviewableItems,
    canReview,
    hasUserVotedHelpful,
    currentUser: CURRENT_USER,
  };

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside ReviewsProvider");
  return ctx;
};
