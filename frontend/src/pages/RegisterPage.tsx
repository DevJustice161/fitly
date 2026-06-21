import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "../services/auth";
import { toast } from "sonner";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    toast.loading("Connecting to Google...", { id: "google-signup" });
    setTimeout(() => {
      toast.success("Signed up with Google!", {
        id: "google-signup",
        description: "Welcome to Fitly.ng",
      });
      setGoogleLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the terms & conditions");
      return;
    }

    try {
      const data = await registerUser(form);

      if (data.token) {
        // auto login
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        //alert("Registration successful");

        navigate("/dashboard");
      } else {
        //alert(data.message);
        toast.error("Registration Failed!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "John Doe",
    },
    {
      key: "email",
      label: "Email Address",
      icon: Mail,
      type: "email",
      placeholder: "you@example.com",
    },
    {
      key: "phone",
      label: "Phone Number",
      icon: Phone,
      type: "tel",
      placeholder: "+234 800 000 0000",
    },
    {
      key: "address",
      label: "Delivery Address",
      icon: MapPin,
      type: "text",
      placeholder: "Lagos, Nigeria",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="font-body text-muted-foreground">
              Join Fitly.ng and start shopping
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      placeholder={placeholder}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>
              ))}

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
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
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

              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded border-input accent-primary"
                />
                <span className="font-body text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                className="w-full btn-gold py-3 text-base font-semibold tracking-wide"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 font-body text-sm text-muted-foreground">
                    or sign up with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="mt-4 w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-background font-body text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {googleLoading ? "Connecting…" : "Sign up with Google"}
              </button>
            </div>

            <p className="mt-6 text-center font-body text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
