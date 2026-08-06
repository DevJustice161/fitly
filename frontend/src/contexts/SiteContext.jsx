import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { toast } from "sonner";

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [siteDetails, setSiteDetails] = useState([]);

  const fetchSiteDetails = async () => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`http://localhost:5000/api/settings/`, {
      headers,
    });
    const data = await res.json();

    if (res.ok) {
      setSiteDetails({
        ...data,
        currencySymbol: data.currency_symbol || data.currencySymbol || "₦",
        currency: data.currency || "NGN",
      });
    }
  };

  useEffect(() => {
    fetchSiteDetails();
  }, [user?.id, token]);

  const domain = siteDetails?.site_name || "Fitly.ng";

  const [brand, extension] = domain.split(".");

  return (
    <SiteContext.Provider
      value={{
        siteDetails,
        domain,
        brand,
        extension,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteDetails = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSiteDetails must be used inside SiteProvider");
  return ctx;
};
