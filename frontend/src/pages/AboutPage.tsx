import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  ShieldCheck,
  Truck,
  Heart,
  Award,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext.jsx";

const stats = [
  { label: "Verified Vendors", value: "500+" },
  { label: "Happy Customers", value: "50K+" },
  { label: "Cities Covered", value: "36" },
  { label: "Products Listed", value: "20K+" },
];

const values = [
  {
    icon: Sparkles,
    title: "Curated Style",
    text: "Hand-picked designers and pieces that define modern Nigerian fashion.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    text: "Verified vendors, secure payments and buyer protection on every order.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    text: "Nationwide logistics partners deliver your style swiftly and safely.",
  },
  {
    icon: Heart,
    title: "Customer First",
    text: "A support team obsessed with making every shopping experience delightful.",
  },
  {
    icon: Users,
    title: "Empowering Vendors",
    text: "We give local designers the tools, audience and tech to scale their brands.",
  },
  {
    icon: Award,
    title: "Quality Promise",
    text: "Every item is reviewed for quality so you only get the very best.",
  },
];

const AboutPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-gold py-20 lg:py-28">
        <div className="section-padding text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground font-body text-xs tracking-widest uppercase mb-6">
            About Fitly.ng
          </span>
          <h1 className="font-heading text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Nigeria's Premier Fashion Marketplace
          </h1>
          <p className="font-body text-lg text-primary-foreground/85 leading-relaxed">
            Fitly.ng connects discerning shoppers with the most talented fashion
            vendors across Nigeria — all in one beautifully curated space.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding py-16 lg:py-24">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Our Story
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              Born in Lagos in 2024, Fitly.ng was created with one mission: to
              celebrate Nigerian style on a world-class platform. We saw
              incredible designers struggling to reach customers, and shoppers
              tired of scrolling through endless, low-quality listings.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              Today, Fitly.ng is the trusted home of premium fashion — where
              Ankara meets atelier, and every order tells a story.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="font-heading text-3xl font-bold text-gradient-gold mb-1">
                  {s.value}
                </div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="section-padding">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-3 text-foreground">
              What We Stand For
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              The principles guiding every decision we make.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center mb-4">
                  <Icon className="text-primary-foreground" size={22} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
                  {title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-16 lg:py-24">
        <div className="max-w-4xl mx-auto bg-foreground text-primary-foreground rounded-2xl p-10 lg:p-14 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
            Join the Fitly Family
          </h2>
          <p className="font-body text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Whether you're shopping the latest looks or selling your designs to
            thousands, there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/category/women"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
            <Link
              to={
                user
                  ? user.role === "vendor"
                    ? "/dashboard"
                    : "/vendor/apply"
                  : "/register"
              }
              className="px-8 py-3 rounded-lg border border-primary-foreground/30 font-body font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              {user
                ? user.role === "vendor"
                  ? "Vendor Dashboard"
                  : "Become a Vendor"
                : "Become a Vendor"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
