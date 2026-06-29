import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string | number;
  name?: string;
  vendor_name?: string;
  category?: string;
  subcategory?: string;
  [key: string]: unknown;
}

const SearchPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/productsCard",
        );
        const data = await response.json();
        setProducts(data as Product[]);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return products.filter((p) =>
      [p.name, p.vendor_name, p.category, p.subcategory]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [query, products]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="section-padding py-10 lg:py-14">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-2 text-foreground">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            {query
              ? `${results.length} item${results.length === 1 ? "" : "s"} found`
              : "Type a query in the search bar above."}
          </p>

          {query && results.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl">
              <SearchX
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
              />
              <h2 className="font-heading text-xl font-semibold mb-2 text-foreground">
                No matches
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Try different keywords or browse our categories.
              </p>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {results.map((p) => (
                <ProductCard key={p.id} product={p as Product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SearchPage;
