import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Ticket,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "@/components/SEO";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const CartPage = () => {
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const formatPrice = (price) =>
    `${currencySymbol}${Number(price || 0).toLocaleString()}`;
  const navigate = useNavigate();
  const {
    items,
    loading,
    removeFromCart,
    updateQuantity,
    updateVariant,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();
  const { user, token } = useAuth();

  const [variantMap, setVariantMap] = useState({});
  const [voucherInputs, setVoucherInputs] = useState({});
  const [appliedVouchers, setAppliedVouchers] = useState({});
  const [voucherLoading, setVoucherLoading] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const map = {};

        for (const item of items) {
          if (!map[item.product_id]) {
            const res = await fetch(
              `${API_URL}/products/variants/${item.product_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const data = await res.json();

            map[item.product_id] = data.variants || [];
          }
        }

        setVariantMap(map);
      } catch (err) {
        console.error("Variant fetch error:", err);
      }
    };

    if (items.length) {
      fetchVariants();
    }
  }, [items]);

  const invokeclearCart = () => {
    clearCart();
    toast.success("Cart Cleared");
  };

  const getItemSubtotal = (item) =>
    Number(item.quantity) * Number(item.discount_price || item.price);

  const getVendorItems = (vendorId) =>
    items.filter((item) => String(item.vendor_id) === String(vendorId));

  const getVendorSubtotal = (vendorId) =>
    getVendorItems(vendorId).reduce(
      (sum, item) => sum + getItemSubtotal(item),
      0,
    );

  const getDiscountForVendor = (vendorId) => {
    const voucher = appliedVouchers[vendorId];
    if (!voucher) return 0;

    const vendorItems = getVendorItems(vendorId);
    const vendorSubtotal = getVendorSubtotal(vendorId);
    if (!vendorSubtotal) return 0;

    if (voucher.discount_type === "percentage") {
      return vendorItems.reduce(
        (sum, item) =>
          sum + getItemSubtotal(item) * (Number(voucher.discount_value) / 100),
        0,
      );
    }

    const fixedDiscount = Number(voucher.discount || 0);
    return vendorItems.reduce((sum, item) => {
      const lineSubtotal = getItemSubtotal(item);
      return sum + (lineSubtotal / vendorSubtotal) * fixedDiscount;
    }, 0);
  };

  const getDisplayUnitPrice = (item) => {
    const price = Number(item.discount_price || item.price);
    const voucher = appliedVouchers[item.vendor_id];

    if (!voucher) return price;

    if (voucher.discount_type === "percentage") {
      return Math.max(price * (1 - Number(voucher.discount_value) / 100), 0);
    }

    const vendorDiscount = getDiscountForVendor(item.vendor_id);
    const lineSubtotal = getItemSubtotal(item);
    const vendorSubtotal = getVendorSubtotal(item.vendor_id);
    const share = vendorSubtotal ? lineSubtotal / vendorSubtotal : 0;
    const lineDiscount = share * vendorDiscount;

    return Math.max(price - lineDiscount / Number(item.quantity || 1), 0);
  };

  const voucherDiscountTotal = useMemo(
    () =>
      Object.keys(appliedVouchers).reduce(
        (sum, vendorId) => sum + getDiscountForVendor(vendorId),
        0,
      ),
    [appliedVouchers, items],
  );

  const discountedCartTotal = useMemo(() => {
    const originalTotal = items.reduce(
      (sum, item) => sum + getItemSubtotal(item),
      0,
    );
    return Math.max(originalTotal - voucherDiscountTotal, 0);
  }, [items, voucherDiscountTotal]);

  const deliveryFee = totalPrice >= 50000 ? 0 : 3500;

  const hasMissingVariants = items.some((item) => !item.size || !item.color);

  const handleCheckoutNavigation = () => {
    if (hasMissingVariants) return;

    navigate("/checkout", {
      state: {
        appliedVouchers,
        voucherDiscountTotal,
        discountedCartTotal,
      },
    });
  };

  if (loading) {
    return <SkeletonLoader type="cart" count={1} />;
  }

  const applyVoucher = async (vendorId, code) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      toast.error("Enter a voucher code");
      return;
    }

    const vendorSubtotal = getVendorSubtotal(vendorId);
    setVoucherLoading((prev) => ({ ...prev, [vendorId]: true }));

    try {
      const response = await fetch(`${API_URL}/vouchers/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: normalizedCode,
          subtotal: vendorSubtotal,
          vendor_id: vendorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Voucher validation failed");
      }

      setAppliedVouchers((prev) => ({
        ...prev,
        [vendorId]: {
          ...data.voucher,
          discount: data.discount,
        },
      }));

      setVoucherInputs((prev) => ({
        ...prev,
        [vendorId]: "",
      }));

      toast.success(`Voucher applied for ${data.voucher.code}`);
    } catch (error) {
      console.error("Voucher validation error:", error);
      toast.error(error.message || "Unable to apply voucher");
    } finally {
      setVoucherLoading((prev) => ({ ...prev, [vendorId]: false }));
    }
  };

  if (items.length) {
    return (
      <>
        <SEO title="Shopping Cart - Fitly Marketplace" noIndex />
        <div className="min-h-screen bg-background">
          <Header />

          <div className="section-padding py-10">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-3xl font-bold">
                Shopping Cart ({totalItems})
              </h1>

              <button
                onClick={invokeclearCart}
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>
            {loading ? (
              <SkeletonLoader type="cart" count={1} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CART ITEMS */}

                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => {
                    const itemPrice = Number(item.discount_price || item.price);
                    const displayUnitPrice = getDisplayUnitPrice(item);
                    const variants = variantMap[item.product_id] || [];

                    const uniqueSizes = [
                      ...new Set(variants.map((v) => v.size)),
                    ];
                    const uniqueColors = [
                      ...new Set(variants.map((v) => v.color)),
                    ];

                    return (
                      <div
                        key={item.cart_id}
                        className="bg-card rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 border min-w-0"
                      >
                        {/* IMAGE */}
                        <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={`${BACKEND_URL}/uploads/products/${item.thumbnail}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* DETAILS */}
                        <div className="flex-1 min-w-0">
                          {/* HEADER */}
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground uppercase truncate">
                                {item.vendor_name}
                              </p>

                              <h3 className="font-semibold text-sm sm:text-base break-words">
                                {item.name}
                              </h3>

                              {/* VARIANTS */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {/* SIZE */}
                                <select
                                  value={item.size || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      item.cart_id,
                                      e.target.value,
                                      item.color,
                                    )
                                  }
                                  className="max-w-full border rounded px-2 py-1 text-xs bg-background"
                                >
                                  <option value="">Size</option>
                                  {uniqueSizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </select>

                                {/* COLOR */}
                                <select
                                  value={item.color || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      item.cart_id,
                                      item.size,
                                      e.target.value,
                                    )
                                  }
                                  className="max-w-full border rounded px-2 py-1 text-xs bg-background"
                                >
                                  <option value="">Color</option>
                                  {uniqueColors.map((color) => (
                                    <option key={color} value={color}>
                                      {color}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {!item.size || !item.color ? (
                                <p className="text-xs text-red-500 mt-1">
                                  Select size & color
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1 break-words">
                                  {item.size} | {item.color}
                                </p>
                              )}
                            </div>

                            {/* REMOVE BUTTON */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cart_id)}
                              className="shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          {/* QUANTITY + PRICE */}
                          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mt-4">
                            {/* QUANTITY */}
                            <div className="flex items-center border rounded-lg w-fit shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.cart_id,
                                    item.quantity - 1,
                                  )
                                }
                                className="p-2"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="px-3 text-sm">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  item.quantity < item.stock_quantity &&
                                  updateQuantity(
                                    item.cart_id,
                                    item.quantity + 1,
                                  )
                                }
                                className="p-2"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* PRICE */}
                            <div className="text-left xs:text-right min-w-0">
                              <div className="font-semibold text-sm sm:text-base break-words">
                                {formatPrice(displayUnitPrice * item.quantity)}
                              </div>

                              {appliedVouchers[item.vendor_id] && (
                                <p className="text-[11px] text-green-600 mt-1 break-words">
                                  Coupon applied:{" "}
                                  {appliedVouchers[item.vendor_id].code}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* COUPON */}
                          <div className="flex flex-col sm:flex-row mt-3 gap-2 w-full min-w-0">
                            <input
                              type="text"
                              value={voucherInputs[item.vendor_id] || ""}
                              onChange={(e) =>
                                setVoucherInputs((prev) => ({
                                  ...prev,
                                  [item.vendor_id]: e.target.value,
                                }))
                              }
                              placeholder="Apply vendor voucher"
                              className="w-full min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                applyVoucher(
                                  item.vendor_id,
                                  voucherInputs[item.vendor_id] || "",
                                )
                              }
                              disabled={voucherLoading[item.vendor_id]}
                              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground whitespace-nowrap"
                            >
                              <Ticket size={14} />

                              {voucherLoading[item.vendor_id]
                                ? "Applying..."
                                : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-card p-6 rounded-xl border h-fit sticky top-28">
                  <h3 className="font-bold text-xl mb-4">Order Summary</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(discountedCartTotal)}</span>
                    </div>

                    {voucherDiscountTotal > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Voucher Discount</span>
                        <span>-{formatPrice(voucherDiscountTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>
                        {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {formatPrice(discountedCartTotal + deliveryFee)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckoutNavigation}
                    className={`btn-gold w-full mt-6 flex justify-center gap-2 ${
                      hasMissingVariants ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>

                  {hasMissingVariants && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      Select size and color for all items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Footer />
        </div>
      </>
    );
  } else {
    return (
      <>
        <SEO title="Shopping Cart" noIndex />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="section-padding py-20 text-center">
            <ShoppingBag
              size={64}
              className="mx-auto text-muted-foreground/30 mb-6"
            />
            <h1 className="font-heading text-3xl font-bold mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Discover amazing fashion from vendors
            </p>
            <Link to="/" className="btn-gold">
              Continue Shopping
            </Link>
          </div>
          <Footer />
        </div>
      </>
    );
  }
};

export default CartPage;
