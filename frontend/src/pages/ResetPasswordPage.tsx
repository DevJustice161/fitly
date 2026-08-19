import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { resetPassword } from "../services/auth";
import { toast } from "sonner";

const rules = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pwdError = rules.every((r) => r.test(password))
      ? ""
      : "Password does not meet the requirements below";
    const matchError = password === confirm ? "" : "Passwords do not match";

    setPasswordError(pwdError);
    setConfirmError(matchError);
    if (pwdError || matchError) return;

    setLoading(true);
    if (!token) {
      toast.error("Invalid password reset link");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const data = await resetPassword(token, password);

      if (data.success) {
        setTimeout(() => {
          setLoading(false);
          setDone(true);
          toast.success("Password reset successfully!");
          setTimeout(() => navigate("/login"), 1800);
        }, 1200);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {done ? "Password Updated" : "Set New Password"}
            </h1>
            <p className="font-body text-muted-foreground">
              {done
                ? "Redirecting you to sign in..."
                : "Choose a strong password for your Fitly.ng account"}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            {done ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="text-primary" size={28} />
                </div>
                <Link
                  to="/login"
                  className="block w-full btn-gold py-3 text-base font-semibold tracking-wide"
                >
                  Sign In Now
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    New Password
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
                      maxLength={72}
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
                  {passwordError && (
                    <p className="mt-1.5 font-body text-sm text-destructive">
                      {passwordError}
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {rules.map((rule) => {
                    const ok = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 font-body text-sm ${ok ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${ok ? "bg-primary/10 border-primary" : "border-border"}`}
                        >
                          {ok && <Check size={11} />}
                        </span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>

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
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      maxLength={72}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  {confirmError && (
                    <p className="mt-1.5 font-body text-sm text-destructive">
                      {confirmError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold py-3 text-base font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
