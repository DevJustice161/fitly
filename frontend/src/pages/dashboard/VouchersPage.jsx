import { useEffect, useState } from "react";
import { Copy, Ticket, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const VouchersPage = () => {
  const { user } = useAuth();

  const [vouchers, setVouchers] = useState([]);
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVouchers = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/vouchers/user/${user.id}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch vouchers");
      }

      setVouchers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVouchers();
    }
  }, [user]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);

    setCopied(code);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const isCouponActive = (voucher) => {
    if (!voucher.is_active) return false;

    if (!voucher.expires_at) return true;

    return new Date(voucher.expires_at) > new Date();
  };

  const getDiscountText = (voucher) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}% OFF`;
    }

    return `₦${Number(voucher.discount_value).toLocaleString()} OFF`;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl mb-4 font-bold text-foreground">
        Vouchers & Coupons
      </h1>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          Loading vouchers...
        </div>
      ) : vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No vouchers available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((voucher) => {
            const active = isCouponActive(voucher);

            return (
              <Card
                key={voucher.id}
                className={`border p-4 shadow-sm relative overflow-hidden ${
                  active ? "border-border" : "border-border opacity-60"
                }`}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-primary" />

                      <span className="font-heading text-xl font-bold text-primary">
                        {getDiscountText(voucher)}
                      </span>
                    </div>

                    <Badge
                      className={`text-[10px] ${
                        active
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }`}
                    >
                      {active ? "Active" : "Expired"}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Min. order: ₦
                      {Number(voucher.min_order_amount || 0).toLocaleString()}
                    </p>

                    {voucher.expires_at && (
                      <p>
                        Expires:{" "}
                        {new Date(voucher.expires_at).toLocaleDateString(
                          "en-NG",
                        )}
                      </p>
                    )}

                    {voucher.description && <p>{voucher.description}</p>}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground">
                      {voucher.code}
                    </code>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(voucher.code)}
                      disabled={!active}
                      className="rounded-full border-primary text-primary"
                    >
                      {copied === voucher.code ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
