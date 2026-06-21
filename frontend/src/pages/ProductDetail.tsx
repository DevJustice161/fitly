import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
//import { products } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/ProductCard";
import ProductReviewsSection from "@/components/reviews/ProductReviewsSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

const sampleReviews = [
  {
    name: "Adaeze O.",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely stunning! Fabric quality is premium and the fit is perfect. Will definitely order again.",
  },
  {
    name: "Tunde A.",
    rating: 4,
    date: "1 month ago",
    text: "Great product, arrived earlier than expected. Sizing runs slightly large but still beautiful.",
  },
  {
    name: "Chiamaka E.",
    rating: 5,
    date: "1 month ago",
    text: "Got so many compliments! Worth every naira. The vendor was very responsive too.",
  },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { getProductStats } = useReviews();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState(null);
  const [colors, setColors] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    try {
      setLoading(true);
      const fetchProductDetails = async () => {
        const response = await fetch(
          `http://localhost:5000/api/products/details/${slug}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data.product);
        setSizes(data.sizes);
        setColors(data.colors);
        setProductImages(data.product_images);
        setSelectedImage(null);
      };
      const fetchProducts = async () => {
        const response = await fetch(
          "http://localhost:5000/api/products/productsCard",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      };
      fetchProductDetails();
      fetchProducts();
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-padding py-20 text-center">
          <p className="font-heading text-2xl text-muted-foreground mb-4">
            Product not found
          </p>
          <Link to="/" className="btn-gold">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  //.slice(0, 4);
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-padding py-8">
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="section-padding py-4 border-b border-border">
        <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/category/${product.category.toLowerCase()}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="section-padding py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="flex gap-5">
            <div className="flex flex-col gap-3">
              {productImages.map((img, index) => (
                <img
                  alt="images"
                  key={index}
                  src={`http://localhost:5000/uploads/products/${img}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${
                    selectedImage === img ? "border-primary" : "border-border"
                  }`}
                />
              ))}
            </div>

            {selectedImage ? (
              <div className="flex-1 bg-muted rounded-xl overflow-hidden">
                <img
                  src={`http://localhost:5000/uploads/products/${selectedImage}`}
                  alt=""
                  className="w-full h-full object-cover hover:scale-110 cursor-pointer transition duration-300"
                />
              </div>
            ) : (
              <p>Select an image to view</p>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                {product.vendor_name}
              </span>
              {product.is_premium && (
                <span className="premium-badge text-[10px]">
                  <Star size={10} fill="currentColor" /> Premium
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.rating)
                        ? "text-primary fill-primary"
                        : "text-border"
                    }
                  />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">
                {product.rating} ({product.reviews_count} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="font-heading text-3xl font-bold text-foreground">
                {formatPrice(product.discount_price)}
              </span>
              {product.discount_price && (
                <>
                  <span className="font-body text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-destructive text-destructive-foreground text-xs font-body font-semibold px-2 py-1 rounded-full">
                    -
                    {Math.round(
                      (1 - product.discount_price / product.price) * 100,
                    )}
                    %
                  </span>
                </>
              )}
            </div>
            <div className="mb-4">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-semibold">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              )}
            </div>

            {/* Size selector */}
            {sizes && (
              <div className="mb-6">
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Size : {selectedSize}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`font-body text-sm font-medium px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {colors && (
              <div className="mb-8">
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Color: {selectedColor}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`font-body text-sm font-medium px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary bg-secondary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Quantity</h4>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-10 h-10 border rounded"
                >
                  -
                </button>

                <span className="font-semibold text-lg">{quantity}</span>

                <button
                  onClick={() =>
                    quantity < product.stock_quantity &&
                    setQuantity(quantity + 1)
                  }
                  className="w-10 h-10 border rounded"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() =>
                  addToCart(product, selectedSize, selectedColor, quantity)
                }
                className="btn-gold flex-1 flex items-center justify-center gap-2 text-base"
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button
                onClick={() =>
                  addToCart(product, selectedSize, selectedColor, quantity)
                }
                className="flex-1 bg-black text-white rounded-lg py-4 hover:opacity-90"
              >
                Buy Now
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product);
                }}
                className="w-14 h-14 border-2 border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={22}
                  className={isWishlisted(product.id) ? "fill-destructive" : ""}
                />
                {/* <Heart size={16} className={wished ? "fill-destructive" : ""} /> */}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Truck, label: "Fast Delivery" },
                { icon: Shield, label: "Secure Payment" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="mx-auto text-primary mb-1" />
                  <span className="font-body text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="rounded-xl">
                <CardContent className="p-6 space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                  <div>{product.description}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card className="rounded-xl">
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ["Brand", product.vendor_name],
                        ["Category", product.category],
                        ["Color", colors?.join(", ") || "—"],
                        ["Size", sizes?.join(", ") || "One Size"],
                        [
                          "Gender",
                          product.gender === "male"
                            ? "Male"
                            : product.gender === "female"
                              ? "Female"
                              : "Unisex",
                        ],
                        ["Origin", "Made in Nigeria"],
                      ].map(([k, v]) => (
                        <tr
                          key={k}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-3 px-4 font-semibold w-1/3 bg-muted/30">
                            {k}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProductReviewsSection product={product} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="section-padding py-16 border-t border-border">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* People also viewed */}
      <section className="section-padding py-16 mt-12">
        <h2 className="font-heading text-2xl font-bold mb-6">
          People Also Viewed
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 6)
            .map((p) => (
              <div key={p.id} className="min-w-[220px] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
