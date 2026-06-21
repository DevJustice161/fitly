import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CategoryPage = () => {
  let { slug } = useParams();
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  //const [vendors, setVendors] = useState([]);

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
    // const fetchVendors = async () => {
    //   try {
    //     const response = await fetch(
    //       "http://localhost:5000/api/vendors/vendors",
    //     );
    //     const data = await response.json();
    //     setVendors(data);
    //   } catch (error) {
    //     console.error("Error fetching vendors:", error);
    //   }
    // };

    fetchProducts();
    //fetchVendors();
  }, []);

  let categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";

  switch (categoryName) {
    case "Women":
      categoryName = "Women's fashion";
      slug = "women's fashion";
      break;
    case "Men":
      categoryName = "Men's fashion";
      slug = "men's fashion";
      break;
    case "Beauty-products":
      categoryName = "Beauty products";
      slug = "beauty products";
      break;

    default:
      break;
  }
  const category = categories.find((c) => c.name.toLowerCase() === slug);
  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === slug,
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="section-padding py-4 border-b border-border">
        <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>
      </div>

      {/* Title */}
      <div className="section-padding py-10 text-center">
        <h1 className="font-heading text-3xl lg:text-5xl font-bold text-foreground mb-3">
          {categoryName}
        </h1>
        {category && (
          <div className="flex items-center justify-center gap-4 mt-4">
            {category.subcategories.map((sub) => (
              <button
                key={sub}
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-secondary transition-all"
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="section-padding pb-4">
        <div className="flex items-center justify-between">
          {/* <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-body text-sm font-medium text-foreground px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <SlidersHorizontal size={16} /> Filters
          </button> */}
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length < 2 ? "item" : "items"}
            </span>
            {/* <button className="flex items-center gap-1 font-body text-sm font-medium text-foreground px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              Sort by <ChevronDown size={16} />
            </button> */}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="section-padding pb-6 animate-fade-in-up">
          <div className="bg-card rounded-xl p-6 border border-border grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-body text-sm font-semibold text-foreground mb-3">
                Price Range
              </h4>
              {[
                "Under ₦20,000",
                "₦20,000 - ₦50,000",
                "₦50,000 - ₦100,000",
                "Over ₦100,000",
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
                    //style={{ backgroundColor: c.color }}
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

      {/* Products */}
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
  );
};

export default CategoryPage;
