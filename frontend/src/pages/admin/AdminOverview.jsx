import { Link } from "react-router-dom";
import {
  Users,
  Store,
  DollarSign,
  Wallet,
  Package,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminStats,
  vendorApplications,
  adminWithdrawalRequests,
} from "@/data/vendorData";
import { useAuth } from "@/context/AuthContext.jsx";

const statCards = [
  {
    label: "Total Vendors",
    value: adminStats.totalVendors,
    icon: Users,
    color: "text-primary",
  },
  {
    label: "Pending Applications",
    value: adminStats.pendingApplications,
    icon: Clock,
    color: "text-orange-500",
  },
  {
    label: "Commission Earned",
    value: `₦${(adminStats.commissionEarned / 1000000).toFixed(1)}M`,
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    label: "Active Products",
    value: adminStats.activeProducts,
    icon: Package,
    color: "text-blue-500",
  },
];

const AdminOverview = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-gradient-to-r from-secondary to-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage vendors, applications, and platform revenue
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-heading font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">
              Recent Applications
            </h2>
            <Link
              to="/admin/applications"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {vendorApplications
              .filter((a) => a.status === "Pending")
              .map((app) => (
                <Card key={app.id} className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {app.storeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {app.name} • {app.date}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">
              Pending Withdrawals
            </h2>
            <Link
              to="/admin/withdrawals"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {adminWithdrawalRequests
              .filter((w) => w.status === "Pending")
              .map((w) => (
                <Card key={w.id} className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{w.vendor}</p>
                      <p className="text-xs text-muted-foreground">
                        ₦{w.amount.toLocaleString()} • {w.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
