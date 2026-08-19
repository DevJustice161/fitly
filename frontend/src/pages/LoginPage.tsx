import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import SEO from "@/components/SEO";
import { loginUser } from "../services/auth";
import { useAuth } from "../contexts/AuthContext.jsx";
import { toast } from "sonner";

const LoginPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);

      if (data.token) {
        login(data.user, data.token);
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.info(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <SEO title="Login - Fitly Marketplace" noIndex />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding py-12 lg:py-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="font-body text-muted-foreground">
                Sign in to your Fitly.ng account
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input accent-primary"
                    />
                    <span className="font-body text-sm text-muted-foreground">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-body text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full btn-gold py-3 text-base font-semibold tracking-wide"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-4 font-body text-sm text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 w-full overflow-hidden rounded-xl">
                  <GoogleAuthButton mode="signin" />
                </div>
              </div>

              <p className="mt-6 text-center font-body text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
