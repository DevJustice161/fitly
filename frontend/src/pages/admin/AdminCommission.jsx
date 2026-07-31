import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { commissionSettings } from "@/data/vendorData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const AdminCommission = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState(commissionSettings);
  const [defaultCommission, setDefaultCommission] = useState(null);
  const [premiumCommission, setPremiumCommission] = useState(null);
  const [defaultMinProducts, setDefaultMinProducts] = useState(null);
  const [premiumSubPrice, setPremiumSubPrice] = useState(null);
  const API_URL = "http://localhost:5000/api";

  const fetchCommissions = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/commission`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSettings(data);
      setDefaultCommission(data.default.commission_rate);
      setPremiumCommission(data.premium.commission_rate);
      setDefaultMinProducts(data.default.min_products);
      setPremiumSubPrice(Number(data.premium.price));
    } catch (error) {
      toast({
        title: "Error fetching commissions",
        description: `Unable to load commissions. Please try again later. ${error}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleSave = async () => {
    try {
      const comm = {
        defaultCommission,
        premiumCommission,
        defaultMinProducts,
        premiumSubPrice,
      };
      if (
        !defaultCommission ||
        !premiumCommission ||
        !defaultMinProducts ||
        !premiumSubPrice
      ) {
        toast({
          title: "Fill all inputs",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }

      if (
        isNaN(premiumSubPrice) ||
        isNaN(defaultCommission) ||
        isNaN(premiumCommission) ||
        isNaN(defaultMinProducts)
      ) {
        toast({
          title: "Wrong Input",
          description:
            "Inputs must be pure numbers, check if you've included expressions or letters.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_URL}/admin/commission`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(comm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      fetchCommissions();
      toast({
        title: "Commission settings saved",
        description: "Commission rates have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating commissions",
        description: `Unable to update commissions. Please try again later. ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Commission Settings
      </h1>

      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Default Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <Label>Standard Vendor Commission (%)</Label>
                <Input
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(e.target.value)}
                />
              </div>
              <div>
                <Label>Standard Vendor Minimum Products</Label>
                <Input
                  value={defaultMinProducts}
                  onChange={(e) => setDefaultMinProducts(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <Label>Premium Vendor Commission (%)</Label>
                <Input
                  value={premiumCommission}
                  onChange={(e) => setPremiumCommission(e.target.value)}
                />
              </div>
              <div>
                <Label>Premium Vendors Subscription Price (₦)</Label>
                <Input
                  value={premiumSubPrice}
                  onChange={(e) => setPremiumSubPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-foreground font-medium mb-1">
          Commission Example
        </p>
        <p className="text-xs text-muted-foreground">
          Product price: ₦10,000 → Platform commission ({defaultCommission}
          %): ₦{((10000 * Number(defaultCommission)) / 100).toLocaleString()} →
          Vendor receives: ₦
          {(10000 - (10000 * Number(defaultCommission)) / 100).toLocaleString()}
        </p>
      </div>

      <Button
        onClick={handleSave}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Save Commission Settings
      </Button>
    </div>
  );
};

export default AdminCommission;
