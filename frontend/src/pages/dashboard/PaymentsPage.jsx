import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Building2,
  Smartphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const iconMap = {
  card: CreditCard,
  bank: Building2,
  mobile: Smartphone,
};

const emptyForm = {
  type: "card",
  cardNumber: "",
  bankName: "",
  accountNumber: "",
  email: "",
  provider: "Flutterwave",
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const API_URL = "http://localhost:5000/api/payments";

  const getPaymentMethod = async () => {
    try {
      const response = await fetch(`${API_URL}/get-methods/${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }
      const data = await response.json();
      setMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  useEffect(() => {
    getPaymentMethod();
  }, [user]);

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    let newMethod;
    if (form.type === "card") {
      const digits = form.cardNumber.replace(/\s/g, "");
      if (digits.length < 12) {
        toast({
          title: "Invalid card",
          description: "Enter a valid card number.",
          variant: "destructive",
        });
        return;
      }
      newMethod = {
        user_id: user.id,
        type: "card",
        label: "Debit/Credit  Card",
        bank_name: form.bankName || null,
        account_number: null,
        provider: null,
        details: `**** **** **** ${digits.slice(-4)}`,
        bank: form.bankName || "Card",
        is_default: methods.length === 0,
      };
    } else if (form.type === "bank") {
      if (!form.bankName || !form.accountNumber) {
        toast({
          title: "Missing details",
          description: "Bank and account number are required.",
          variant: "destructive",
        });
        return;
      }
      newMethod = {
        user_id: user.id,
        bank_name: form.bankName,
        account_number: form.accountNumber,
        provider: null,
        type: "bank",
        label: "Bank Transfer",
        details: form.accountNumber,
        is_default: methods.length === 0,
      };
    } else {
      if (!form.email) {
        toast({
          title: "Missing email",
          description: "Enter the account email.",
          variant: "destructive",
        });
        return;
      }
      newMethod = {
        user_id: user.id,
        bank_name: null,
        account_number: null,
        provider: null,
        is_default: methods.length === 0,
        type: "online",
        label: form.provider,
        details: form.email,
      };
    }
    await fetch(`${API_URL}/method`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMethod),
    });
    getPaymentMethod();
    toast({ title: "Payment method added" });
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/method/${deleteId}`, {
        method: "DELETE",
      });
      getPaymentMethod();
      toast({ title: "Payment method removed" });
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`${API_URL}/method/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to update payment method");
      }
      getPaymentMethod();
      toast({ title: "Default payment updated" });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Payment Methods
        </h1>
        <Button
          onClick={openAdd}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Payment
        </Button>
      </div>

      <div className="space-y-4">
        {methods.length === 0 ? (
          <Card className="border border-border shadow-sm mb-2">
            <CardContent className="p-10 text-center text-muted-foreground">
              No payment methods yet. Click “Add Payment” to add one.
            </CardContent>
          </Card>
        ) : (
          methods.map((pm) => {
            const Icon = iconMap[pm.type] || CreditCard;
            return (
              <Card
                key={pm.id}
                className={`border p-3 shadow-sm ${pm.is_defualt ? "border-primary" : "border-border"}`}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{pm.label}</p>
                      {pm.is_default != 0 && (
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                          <Check className="h-3 w-3 mr-1" /> Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pm.details}
                    </p>
                    {pm.bank_name && (
                      <p className="text-xs text-muted-foreground">
                        {pm.bank_name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!pm.is_default && (
                      <Button
                        onClick={() => handleSetDefault(pm.id)}
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs border-primary text-primary"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      onClick={() => setDeleteId(pm.id)}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs border-border text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="border border-border shadow-sm bg-secondary/30 mt-4">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Payments are securely processed via{" "}
            <span className="font-medium text-foreground">Flutterwave</span> and{" "}
            <span className="font-medium text-foreground">Paystack</span>.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Payment Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Debit / Credit Card</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="mobile">Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.type === "card" && (
              <>
                <div className="space-y-1">
                  <Label>Card Number</Label>
                  <Input
                    value={form.cardNumber}
                    onChange={handleChange("cardNumber")}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Bank / Issuer (optional)</Label>
                  <Input
                    value={form.bankName}
                    onChange={handleChange("bankName")}
                    placeholder="GTBank"
                  />
                </div>
              </>
            )}

            {form.type === "bank" && (
              <>
                <div className="space-y-1">
                  <Label>Bank Name</Label>
                  <Input
                    value={form.bankName}
                    onChange={handleChange("bankName")}
                    placeholder="First Bank"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Account Number</Label>
                  <Input
                    value={form.accountNumber}
                    onChange={handleChange("accountNumber")}
                    placeholder="0123456789"
                  />
                </div>
              </>
            )}

            {form.type === "mobile" && (
              <>
                <div className="space-y-1">
                  <Label>Provider</Label>
                  <Select
                    value={form.provider}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, provider: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flutterwave">Flutterwave</SelectItem>
                      <SelectItem value="Paystack">Paystack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Account Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@email.com"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              You can re-add it any time. This won’t affect any past
              transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentsPage;
