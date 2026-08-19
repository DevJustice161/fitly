import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GoogleAuthButton = ({ mode = "signin" }) => {
  const googleButtonRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      // Prevent duplicate buttons
      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: mode === "signup" ? "signup_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          renderGoogleButton();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [GOOGLE_CLIENT_ID, mode]);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      toast.loading("Connecting to Google...", {
        id: "google-auth",
      });

      const result = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      login(data.user, data.token);

      toast.success(
        mode === "signup"
          ? "Google signup successful!"
          : "Google login successful!",
        {
          id: "google-auth",
          description: "Welcome to Fitly.ng",
        },
      );

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "vendor") {
        navigate("/vendor");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google authentication error:", error);

      toast.error(error.message || "Google authentication failed", {
        id: "google-auth",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 rounded-xl">
          <span className="text-sm text-muted-foreground">
            Connecting to Google...
          </span>
        </div>
      )}

      <div ref={googleButtonRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleAuthButton;
