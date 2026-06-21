import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(price));

const CartPage = () => {
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

  const [variantMap, setVariantMap] = useState({});

  // =========================
  // FETCH PRODUCT VARIANTS
  // =========================
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const map = {};

        for (const item of items) {
          if (!map[item.product_id]) {
            const res = await fetch(
              `http://localhost:5000/api/products/variants/${item.product_id}`,
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

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-padding py-20 text-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // =========================
  // EMPTY CART STATE
  // =========================
  if (!items.length) {
    return (
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
    );
  }

  const deliveryFee = totalPrice >= 50000 ? 0 : 3500;

  const hasMissingVariants = items.some((item) => !item.size || !item.color);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-padding py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">
            Shopping Cart ({totalItems})
          </h1>

          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice = Number(item.discount_price || item.price);
              const variants = variantMap[item.product_id] || [];

              const uniqueSizes = [...new Set(variants.map((v) => v.size))];
              const uniqueColors = [...new Set(variants.map((v) => v.color))];

              return (
                <div
                  key={item.cart_id}
                  className="bg-card rounded-xl p-4 flex gap-4 border"
                >
                  {/* IMAGE */}
                  <div className="w-24 h-32 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          {item.vendor_name}
                        </p>

                        <h3 className="font-semibold">{item.name}</h3>

                        {/* VARIANTS */}
                        <div className="flex gap-2 mt-2">
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
                            className="border rounded px-2 py-1 text-xs"
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
                            className="border rounded px-2 py-1 text-xs"
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
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.size} | {item.color}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cart_id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* QUANTITY + PRICE */}
                    <div className="flex justify-between mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.cart_id, item.quantity - 1)
                          }
                          className="p-2"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="px-3">{item.quantity}</span>

                        <button
                          onClick={() =>
                            item.quantity < item.stock_quantity &&
                            updateQuantity(item.cart_id, item.quantity + 1)
                          }
                          className="p-2"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="font-semibold">
                        {formatPrice(itemPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
          <div className="bg-card p-6 rounded-xl border h-fit sticky top-28">
            <h3 className="font-bold text-xl mb-4">Order Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(totalPrice + deliveryFee)}</span>
              </div>
            </div>

            {/* CHECKOUT */}
            <Link
              to={hasMissingVariants ? "#" : "/checkout"}
              className={`btn-gold w-full mt-6 flex justify-center gap-2 ${
                hasMissingVariants ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            {hasMissingVariants && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Select size and color for all items
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
