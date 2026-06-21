import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (p) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(p);

const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          My Wishlist
        </h1>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearWishlist}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-heading text-muted-foreground">
            Your wishlist is empty
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Save items you love for later.
          </p>
          <Button asChild>
            <Link to="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border border-border shadow-sm hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-3">
                <div className="relative">
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                      alt={item.name}
                      className="w-full aspect-[3/4] rounded-lg object-cover bg-muted"
                    />
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromWishlist(item.wishlist_id)}
                    className="absolute top-2 right-2 h-8 w-8 bg-card/80 hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to={`/product/${item.id}`}>
                    <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.vendor_name}
                  </p>
                  <p className="font-heading font-semibold text-foreground">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="flex-1 rounded-full text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
