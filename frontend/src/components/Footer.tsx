import { useState } from "react";
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

const Footer = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");

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
          </form>
        </div>
      </div>

      <div className="section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">Fitly.ng</h4>
            <p className="font-body text-sm text-primary-foreground/60 mb-4 leading-relaxed">
              Nigeria's premium multi-vendor fashion marketplace. Discover
              curated collections from the best designers.
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
              {[
                "Women",
                "Men",
                "Accessories",
                "Shoes",
                "Beauty Products",
                "Bags",
                "New Arrivals",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to={`/category/${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="font-body text-sm text-primary-foreground/60 hover:text-primary transition-colors"
                  >
                    {link}
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
                <Phone size={16} /> +234 800 FITLY NG
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail size={16} /> hello@fitly.ng
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <MapPin size={16} /> Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center">
          <p className="font-body text-xs text-primary-foreground/40">
            © 2026 Fitly.ng. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
