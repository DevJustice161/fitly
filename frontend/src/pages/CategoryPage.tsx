import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const CategoryPage = () => {
  const { slug } = useParams();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);

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
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/categories`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        const normalizedCategories = Array.isArray(data)
          ? data.map((category) => {
              if (typeof category === "string") {
                return { name: category, slug: category };
              }

              return {
                name: category.name || category.slug || "Unnamed category",
                slug: category.slug || category.name || "",
                image: category.image,
                subcategories: category.sub_categories,
              };
            })
          : [];

        setCategories(normalizedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";

  const category = categories.find((c) => c.slug === slug);
  const filteredProducts = products.filter(
    (p) => p.category === category?.name,
  );
  return (
    <>
      <SEO
        title={`${categoryName} - Fitly Marketplace`}
        url={`/category/${slug}`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <div className="section-padding py-4 border-b border-border">
          <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{categoryName}</span>
          </div>
        </div>

        <div className="section-padding py-10 text-center">
          <h1 className="font-heading text-3xl lg:text-5xl font-bold text-foreground mb-3">
            {categoryName}
          </h1>
          {category && (
            <div className="flex items-center justify-center gap-4 mt-4">
              {category.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  className="font-body text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-secondary transition-all"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="section-padding pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-muted-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length < 2 ? "item" : "items"}
              </span>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="section-padding pb-6 animate-fade-in-up">
            <div className="bg-card rounded-xl p-6 border border-border grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Price Range
                </h4>
                {[
                  `Under ${currencySymbol}20,000`,
                  `${currencySymbol}20,000 - ${currencySymbol}50,000`,
                  `${currencySymbol}50,000 - ${currencySymbol}100,000`,
                  `Over ${currencySymbol}100,000`,
                ].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 font-body text-sm text-muted-foreground mb-2 cursor-pointer hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {p}
                  </label>
                ))}
              </div>
              <div>
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      className="font-body text-xs font-medium px-3 py-1.5 border border-border rounded-md hover:border-primary hover:bg-secondary transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Color
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Black", color: "#000" },
                    { name: "White", color: "#fff" },
                    { name: "Red", color: "#dc2626" },
                    { name: "Gold", color: "#D4AF37" },
                    { name: "Pink", color: "#F8C8DC" },
                    { name: "Navy", color: "#1e3a5f" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      className="w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors"
                      title={c.name}
                      type="button"
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                  Vendor
                </h4>
                {[
                  "Ama Collections",
                  "Kings Tailoring",
                  "Luxe Accessories NG",
                ].map((v) => (
                  <label
                    key={v}
                    className="flex items-center gap-2 font-body text-sm text-muted-foreground mb-2 cursor-pointer hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="section-padding pb-20">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-heading text-2xl text-muted-foreground mb-4">
                No products found
              </p>
              <Link to="/" className="btn-gold">
                Back to Home
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;
