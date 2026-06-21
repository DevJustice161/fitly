import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext.jsx";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalWishlists } = useWishlist();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setMobileOpen(false);
    setSearchQuery("");
  };

  const navLinks = [
    { label: "Women", href: "/category/women" },
    { label: "Men", href: "/category/men" },
    { label: "Accessories", href: "/category/accessories" },
    { label: "Shoes", href: "/category/shoes" },
    { label: "Bags", href: "/category/bags" },
    { label: "Beauty Products", href: "/category/beauty-products" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-body tracking-wider">
        FREE DELIVERY ON ORDERS OVER ₦50,000 | Use code: FITLY10
      </div>

      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-2xl lg:text-3xl font-bold tracking-tight"
          >
            <span className="text-gradient-gold">Fitly</span>
            <span className="text-foreground">.ng</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label="Account"
              >
                <User size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card z-50">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer">
                        <LogIn className="h-4 w-4 mr-2" /> Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="cursor-pointer">
                        <UserPlus className="h-4 w-4 mr-2" /> Register
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> My Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer">
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register" className="cursor-pointer">
                    <UserPlus className="h-4 w-4 mr-2" /> Register
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> My Dashboard
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <button
              className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </button> */}
            <Link
              to="/dashboard/wishlist"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Wishlists"
            >
              <Heart size={20} />
              {totalWishlists > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalWishlists}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop search bar */}
        {searchOpen && (
          <div className="hidden sm:block pb-4 animate-fade-in-up">
            <form
              onSubmit={handleSearch}
              className="flex max-w-2xl mx-auto gap-2"
            >
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, vendors, categories..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium hover:opacity-90"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-fade-in-up">
          <nav className="section-padding py-6 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                title="Search"
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium"
              >
                <Search size={18} />
              </button>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-body text-lg font-medium text-foreground py-2 border-b border-border"
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg border border-border font-body text-sm font-medium text-foreground"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium"
              >
                My Dashboard
              </Link>
            )}

            {user ? (
              user.role === "vendor" ? null : (
                <Link
                  to="/vendor/apply"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium"
                >
                  Become a Vendor
                </Link>
              )
            ) : null}

            {/* <Link
              to={
                !user
                  ? "/register"
                  : user.role === "vendor"
                    ? "/dashboard"
                    : "/vendor/apply"
              }
              onClick={() => setMobileOpen(false)}
              className="btn-gold text-center mt-2"
            >
              {user
                ? user.role === "vendor"
                  ? "My Dashboard"
                  : "Become a Vendor"
                : "Become a Vendor"}
            </Link> */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
