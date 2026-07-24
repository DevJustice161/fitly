import { useState, useEffect } from "react";
import { Wallet, ArrowDownCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const VendorWithdrawals = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [vendorProfile, setVendorProfile] = useState({});
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/withdrawals/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch withdrawals");
        }
        const data = await response.json();
        setWithdrawals(data);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
      }
    };

    const fetchVendorProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/vendors/profile/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch vendor profile");
        }
        const data = await response.json();
        setVendorProfile(data);
      } catch (error) {
        console.error("Error fetching vendor profile:", error);
      }
    };

    fetchVendorProfile();

    fetchWithdrawals();
  }, [user.id]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const withdrawalAmount = Number(amount);
      const det = {
        amount: withdrawalAmount,
        vendorId: user.id,
        status: "pending",
        method: "Bank Transfer",
        bank: vendorProfile.bank_name,
        accountNumber: vendorProfile.account_number,
        accountName: vendorProfile.account_name,
      };
      if (withdrawalAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid withdrawal amount.",
        });
        return;
      }
      if (withdrawalAmount > Number(withdrawals.availableBalance)) {
        toast({
          title: "Insufficient Balance",
          description: "You do not have enough balance for this withdrawal.",
        });
        return;
      }
      const response = await fetch(`http://localhost:5000/api/withdrawals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(det),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Withdrawal Requested",
          description: `₦${Number(amount).toLocaleString()} withdrawal request submitted.`,
        });
        setAmount("");
        fetchVendorProfile();
        fetchWithdrawals();
      } else {
        toast({
          title: "Withdrawal Failed",
          description: data.message || "Failed to submit withdrawal request.",
        });
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-4">
        Withdraw Funds
      </h1>

      <Card className="border border-border shadow-sm bg-gradient-to-r from-secondary to-card mb-4">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Available Balance
          </p>
          <p className="text-3xl font-heading font-bold text-foreground">
            ₦{withdrawals.availableBalance?.toLocaleString()}
          </p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">
              Gross Sales:{" "}
              <span className="text-foreground font-medium">
                ₦{withdrawals.grossSales?.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-foreground">
              Earnings:{" "}
              <span className="text-foreground font-medium">
                ₦{withdrawals.totalEarnings?.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-foreground">
              Commission:{" "}
              <span className="text-destructive font-medium">
                ₦{withdrawals.commission?.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-foreground">
              Withdrawn:{" "}
              <span className="text-foreground font-medium">
                ₦{withdrawals.totalWithdrawn?.toLocaleString()}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Request Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label>Withdrawal Amount (₦)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium text-foreground mb-1">
                Payment Details
              </p>
              <p className="text-muted-foreground">
                {vendorProfile.bank_name} • {vendorProfile.account_name} • ****
                {vendorProfile.account_number?.slice(-4)}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!amount || Number(amount) <= 0}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" /> Request Withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Withdrawal History
        </h2>
        <div className="space-y-3">
          {withdrawals.withdrawals?.map((w) => (
            <Card key={w.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {w.status === "paid" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      ₦{w.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {w.bank_name} • ****{w.account_number.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {w.status === "paid" ? "Paid" : "Pending"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    w.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {w.status === "paid" ? "Paid" : "Pending"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorWithdrawals;
