import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.id);

  return (
    <div className="card-premium group">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => addToCart(product)}
            className="btn-gold text-sm py-2 px-6 flex items-center gap-2"
          >
            <ShoppingBag size={16} /> Add to Cart
          </button>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="bg-foreground text-primary-foreground text-[10px] font-body font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              New
            </span>
          )}
          {product.price && (
            <span className="bg-destructive text-destructive-foreground text-[10px] font-body font-semibold px-2.5 py-1 rounded-full">
              -{Math.round((1 - product.discount_price / product.price) * 100)}%
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${wished ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} className={wished ? "fill-destructive" : ""} />
        </button>
        {product.is_premium && (
          <div className="absolute bottom-3 left-3 premium-badge">
            <Star size={10} fill="currentColor" /> Premium
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
          {product.vendor_name}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-heading text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1 mb-2">
          <Star size={12} className="text-primary fill-primary" />
          <span className="font-body text-xs text-muted-foreground">
            {product.rating} ({product.reviews_count})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body font-semibold text-foreground">
            {formatPrice(product.discount_price || product.price)}
          </span>
          {product.discount_price && (
            <span className="font-body text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
