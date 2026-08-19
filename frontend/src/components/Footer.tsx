import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const Footer = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, token } = useAuth();
  const { siteDetails, domain, brand, extension } = useSiteDetails();
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
              };
            })
          : [];

        setCategories(normalizedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [user?.id, API_URL, token]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed!", {
      description: `${email} is now on the Fitly.ng list.`,
    });
    setEmail("");
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="gradient-gold py-12">
        <div className="section-padding text-center">
          <h3 className="font-heading text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">
            Stay in Style
          </h3>
          <p className="font-body text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Subscribe for exclusive deals, new arrivals, and fashion tips
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md mx-auto gap-2"
          >
            <div className="w-full flex items-center gap-2 bg-primary-foreground rounded-lg overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-foreground text-primary-foreground rounded-lg font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">
              {brand}.{extension}
            </h4>
            <p className="font-body text-sm text-primary-foreground/60 mb-4 leading-relaxed">
              {siteDetails?.description ||
                "Fitly.ng is your go-to destination for the latest fashion trends, exclusive deals, and style inspiration. Join our community and stay ahead in the world of fashion."}
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  title="socials"
                  className="text-primary-foreground/60 hover:text-primary transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-body font-semibold text-sm uppercase tracking-wider mb-4">
              Shop
            </h5>
            <ul className="space-y-2">
              {categories.map((link) => (
                <li key={link.id}>
                  <Link
                    to={`/category/${link.slug}`}
                    className="font-body text-sm text-primary-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-body font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h5>
            <ul className="space-y-2">
              {[
                { label: "About Us", to: "/about" },
                {
                  label: user
                    ? user.role === "vendor"
                      ? "Vendor Dashboard"
                      : "Become a Vendor"
                    : "Become a Vendor",
                  to: user
                    ? user.role === "vendor"
                      ? "/dashboard"
                      : "/vendor/apply"
                    : "/register",
                },
                { label: "Privacy Policy", to: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-body text-sm text-primary-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-body font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone size={16} />{" "}
                {siteDetails?.support_phone || "+234 123 456 7890"}
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail size={16} />{" "}
                {siteDetails?.support_email || "hello@fitly.ng"}
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <MapPin size={16} />{" "}
                {siteDetails?.business_address || "Lagos, Nigeria"}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center">
          <p className="font-body text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} {brand}.{extension}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
