import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Star, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-fashion.jpg";
import { categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
const Index = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/productsCard",
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/vendors/vendors",
        );
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchProducts();
    fetchVendors();
  }, []);
  const trendingProducts = products.filter((p) => p.is_trending);
  const newProducts = products.filter((p) => p.is_new);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative h-[85vh] lg:h-[90vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Fitly.ng Fashion"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="relative section-padding h-full flex items-center">
          <div className="max-w-xl animate-fade-in-up">
            <span className="premium-badge text-sm mb-4 inline-block px-4 py-2">
              <Sparkles size={14} /> New Collection 2026
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-[1.1] mb-4">
              Redefine Your <span className="text-primary italic">Style</span>
            </h1>
            <p className="font-body text-primary-foreground/80 text-base lg:text-lg mb-8 max-w-md leading-relaxed">
              Discover curated fashion from Nigeria's finest designers. Premium
              quality, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/category/women"
                className="btn-gold flex items-center gap-2"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                to={
                  user
                    ? user.role === "vendor"
                      ? "dashboard"
                      : "/vendor/apply"
                    : "/register"
                }
                className="btn-outline-gold border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
              >
                {user
                  ? user.role === "vendor"
                    ? "Vendor Dashboard"
                    : "Become a Vendor"
                  : "Become a Vendor"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Explore our curated collections for every occasion
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              to={`/category/${cat.name.toLowerCase()}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-heading text-2xl font-bold text-primary-foreground mb-1">
                  {cat.name}
                </h3>
                <p className="font-body text-sm text-primary-foreground/70 mb-3">
                  {cat.subcategories.join(" • ")}
                </p>
                <span className="font-body text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="gradient-pink-cream py-16 lg:py-24">
        <div className="section-padding">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Trending Now
              </h2>
              <p className="font-body text-muted-foreground">
                The styles everyone is talking about
              </p>
            </div>
            <Link
              to="/category/women"
              className="hidden sm:flex items-center gap-1 font-body text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {trendingProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-1/2 lg:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 lg:-left-5" />
            <CarouselNext className="-right-4 lg:-right-5" />
          </Carousel>
        </div>
      </section>

      <section className="section-padding py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Premium Vendors
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Shop from verified, top-rated Nigerian fashion brands
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {vendors
            .filter((v) => v.is_premium)
            .map((vendor) => (
              <div key={vendor.id} className="card-premium p-6 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary">
                  <img
                    src={`http://localhost:5000/uploads/logos/${vendor.store_logo}`}
                    alt={vendor.store_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-heading text-lg font-semibold text-foreground mb-1">
                  {vendor.store_name}
                </h4>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="font-body text-sm text-muted-foreground">
                    {vendor.rating}
                  </span>
                </div>
                <span className="premium-badge text-xs">
                  <Star size={10} fill="currentColor" /> Premium Vendor
                </span>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  {vendor.products_count} Products
                </p>
              </div>
            ))}
        </div>
      </section>

      <section className="bg-muted py-16 lg:py-24">
        <div className="section-padding">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
                New Arrivals
              </h2>
              <p className="font-body text-muted-foreground">
                Fresh styles just landed
              </p>
            </div>
            <Link
              to="/category/women"
              className="hidden sm:flex items-center gap-1 font-body text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-gold py-16 lg:py-20">
        <div className="section-padding text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Start Selling on Fitly.ng
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Join Nigeria's fastest-growing fashion marketplace. Reach thousands
            of customers, manage your store with ease.
          </p>
          <Link
            to={
              user
                ? user.role === "vendor"
                  ? "/dashboard"
                  : "/vendor/apply"
                : "/register"
            }
            className="inline-flex items-center gap-2 bg-foreground text-primary-foreground px-8 py-3.5 rounded-lg font-body font-medium hover:opacity-90 transition-opacity"
          >
            {user
              ? user.role === "vendor"
                ? "Vendor Dashboard"
                : "Become a Vendor"
              : "Become a Vendor"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
