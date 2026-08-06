import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.jsx";

export const CURRENT_USER = () => {
  const { user } = useAuth();
  return { id: user.id, name: user.name, avatar: user.avatar };
};

const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [helpfulVotes, setHelpfulVotes] = useState({});

  const getProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/productsCard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log("Can't fetch prducts", error);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log("Can't fetch orders", error);
    }
  };

  const getReviews = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.log("can't fetch reviews", error);
    }
  };

  const getHelpfulVotes = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/helpful/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const votes = await response.json();
      const map = {};

      votes.forEach((v) => {
        map[v.review_id] = true;
      });

      setHelpfulVotes(map);
    } catch (error) {
      console.log("can't fetch helpful votes", error);
    }
  };

  useEffect(() => {
    getProducts();
    getOrders();
    getReviews();
    getHelpfulVotes(user?.id);
  }, [user?.id, helpfulVotes]);

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete review");
      }

      await getReviews();
      return true;
    } catch (error) {
      console.error("Delete error:", error);

      toast({
        title: "Delete failed",
        description: error.message || "Could not delete review",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleHelpful = async (id) => {
    const response = await fetch(
      `http://localhost:5000/api/reviews/helpful/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  };

  const toggleVisibility = async (id, visibility) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/update-visibility/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ visibility }),
        },
      );

      await getReviews();
    } catch (error) {
      console.log(error);
    }
  };

  const replyToReview = async (id, text, userId) => {
    const date = new Date().toISOString().slice(0, 10);
    const det = { vendorId: user.id, text: text, userId: userId };
    const response = await fetch(
      `http://localhost:5000/api/reviews/reply/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(det),
      },
    );

    await getReviews();
  };

  const deleteReply = async (id) => {
    const response = await fetch(
      `http://localhost:5000/api/reviews/reply/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await getReviews();
  };

  const getProductReviews = (productId) =>
    reviews.filter(
      (r) => r.visibility == 1 && String(r.productId) === String(productId),
    );

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

  const reviewableItems = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");

    const seenProductIds = new Set();
    const uniqueItems = [];

    for (const o of delivered) {
      const match =
        products.find(
          (p) => p.name.toLowerCase() === String(o.product_name).toLowerCase(),
        ) || products.find((p) => p.vendor_name === o.store_name);

      const productId = match ? match.id : o.product_id;

      if (seenProductIds.has(productId)) {
        continue;
      }

      const existing = reviews.find(
        (r) =>
          String(r.userId) === String(user?.id) &&
          String(r.productId) === String(productId),
      );

      seenProductIds.add(productId);

      uniqueItems.push({
        orderItemId: o.order_item_id,
        productId,
        productName: o.product_name,
        productImage: match ? match.thumbnail : o.thumbnail,
        vendor: o.store_name,
        date: o.created_at,
        reviewed: !!existing,
        existingReviewId: existing?.id || null,
      });
    }

    return uniqueItems;
  }, [reviews, products, orders, user?.id]);

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

  const hasUserVotedHelpful = (reviewId) => {
    return !!helpfulVotes[reviewId];
  };

  const value = {
    reviews,
    products,
    addReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    toggleVisibility,
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
