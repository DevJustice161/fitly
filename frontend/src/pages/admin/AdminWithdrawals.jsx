import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/admin/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const FILTERS = ["All", "Pending", "Approved", "Paid", "Rejected"];

const AdminWithdrawals = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const API_URL = "http://localhost:5000/api";

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/withdrawals-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok)
        throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();

      setRequests(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user.id]);

  const capitalizeWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const capitalizeSentence = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const q = query.trim().toLowerCase();
  const filtered = requests.filter((w) => {
    const matchesQuery =
      !q ||
      [w.vendor, w.bank, w.accountNumber, w.id, String(w.amount)].some((f) =>
        String(f).toLowerCase().includes(q),
      );
    return (
      matchesQuery && (filter === "All" || capitalizeWord(w.status) === filter)
    );
  });

  const updateStatus = async (id, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `${API_URL}/withdrawals/approve/${id}`
          : `${API_URL}/withdrawals/reject/${id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update withdrawal");
      }

      fetchRequests();

      toast({
        title: `Withdrawal ${action === "approve" ? "Approved" : "Rejected"}`,
        description: data.message,
      });
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Operation failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Withdrawal Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Search and process vendor payout requests.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by vendor, bank, account number or amount..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilter(f)}
          >
            {f}{" "}
            {f !== "All" &&
              `(${requests.filter((r) => capitalizeWord(r.status) === f).length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No withdrawal requests found"
          description="Try a different search term or filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <Card key={w.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{w.vendor}</p>
                  <p className="text-lg font-heading font-bold text-foreground">
                    {currencySymbol}
                    {Number(w.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(w.date).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {w.bank} • {w.accountNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      w.status === "approved" || w.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : w.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {capitalizeWord(w.status)}
                  </span>
                  {w.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatus(w.id, "approve")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-destructive"
                        onClick={() => updateStatus(w.id, "reject")}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
