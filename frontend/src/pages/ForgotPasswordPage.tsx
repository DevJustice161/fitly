import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginUser, forgotPassword } from "../services/auth";
import { toast } from "sonner";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();

    if (!value) {
      setError("Please enter your email address");
      return;
    }
    if (value.length > 255 || !emailPattern.test(value)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setTimeout(() => {
        setLoading(false);
        setSent(true);
        toast.success(data.message);
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="font-body text-muted-foreground">
              {sent
                ? `We sent a password reset link to ${email.trim()}`
                : "Enter your email and we'll send you a link to reset your password"}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            {sent ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="text-primary" size={28} />
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  The link expires in 30 minutes. Didn't get it? Check your spam
                  folder or resend below.
                </p>
                <button
                  onClick={() => navigate("/reset-password")}
                  className="w-full btn-gold py-3 text-base font-semibold tracking-wide"
                >
                  Open Reset Link
                </button>
                <button
                  onClick={() => {
                    setSent(false);
                    toast.info("Enter your email to resend the link");
                  }}
                  className="w-full py-3 rounded-xl border border-border bg-background font-body text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Resend Email
                </button>
              </div>
            ) : (
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="you@example.com"
                      maxLength={255}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 font-body text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold py-3 text-base font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 font-body text-sm text-primary font-semibold hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
