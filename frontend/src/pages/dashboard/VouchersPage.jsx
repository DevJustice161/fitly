import { Copy, Ticket, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockVouchers } from "@/data/dashboardData";
import { useState } from "react";

const VouchersPage = () => {
  const [copied, setCopied] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Vouchers & Coupons</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockVouchers.map((v) => (
          <Card
            key={v.code}
            className={`border shadow-sm relative overflow-hidden ${v.active ? "border-border" : "border-border opacity-60"}`}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  <span className="font-heading text-xl font-bold text-primary">{v.discount}</span>
                </div>
                <Badge className={`text-[10px] ${v.active ? "bg-green-100 text-green-700 border-0" : "bg-muted text-muted-foreground border-0"}`}>
                  {v.active ? "Active" : "Expired"}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Min. order: ₦{v.minOrder.toLocaleString()}</p>
                <p>Expires: {v.expiry}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground">{v.code}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(v.code)}
                  disabled={!v.active}
                  className="rounded-full border-primary text-primary"
                >
                  {copied === v.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VouchersPage;
