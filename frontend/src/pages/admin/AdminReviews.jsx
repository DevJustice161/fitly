import { useMemo, useState } from "react";
import {
  Search,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useReviews } from "@/contexts/ReviewsContext";
import StarRating from "@/components/reviews/StarRating";
import { toast } from "sonner";

const seedReports = (reviews) => {
  const low = reviews.filter((r) => r.rating <= 3).slice(0, 3);
  const reasons = [
    "Abusive language",
    "Spam / promotional",
    "Not about this product",
  ];
  const map = {};
  low.forEach((r, i) => {
    map[r.id] = {
      reason: reasons[i % reasons.length],
      count: (i % 3) + 1,
      reporter: "Customer",
    };
  });
  return map;
};

const AdminReviews = () => {
  const { reviews, products, toggleVisibility, deleteReview } = useReviews();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [tab, setTab] = useState("all");
  const [dismissedReports, setDismissedReports] = useState({});
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const productMap = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      m[String(p.id)] = p;
    });
    return m;
  }, [products]);

  const reports = useMemo(() => {
    const seeded = seedReports(reviews);
    Object.keys(dismissedReports).forEach((id) => {
      delete seeded[id];
    });
    return seeded;
  }, [reviews, dismissedReports]);

  const isHidden = (review) => Number(review?.visibility ?? 1) === 0;

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => rating === "all" || r.rating === Number(rating))
      .filter((r) => {
        if (tab === "reported") return !!reports[r.id];
        if (tab === "hidden") return isHidden(r);
        if (tab === "visible") return !isHidden(r);
        return true;
      })
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const product = productMap[String(r.productId)];
        return (
          r.userName.toLowerCase().includes(q) ||
          (product?.name || "").toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          r.review.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt) -
          new Date(a.created_at || a.createdAt),
      );
  }, [reviews, search, rating, tab, productMap, reports]);

  const toggleHide = async (r) => {
    const nextVisibility = isHidden(r) ? "visible" : "hidden";
    await toggleVisibility(r.id, nextVisibility);
    toast.success(
      nextVisibility === "visible"
        ? "Review is now visible on the storefront"
        : "Review hidden from the storefront",
    );
  };

  const dismissReport = (id) => {
    setDismissedReports((current) => ({ ...current, [id]: true }));
    toast.success("Report dismissed");
  };

  const confirmDelete = async () => {
    if (!deleting) return;

    const deleted = await deleteReview(deleting.id);
    if (!deleted) return;

    dismissReport(deleting.id);
    setDeleting(null);
    toast.success(`Review by ${deleting.userName} deleted`);
  };

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const reportedCount = Object.keys(reports).length;
  const hiddenCount = reviews.filter((r) => isHidden(r)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Reviews Management</h1>
        <p className="text-sm text-muted-foreground">
          Moderate customer reviews, hide or remove abusive content.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <p className="font-heading text-2xl font-bold mt-1">
              {reviews.length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <p className="font-heading text-2xl font-bold mt-1">
              {avg.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Reported</p>
            <p className="font-heading text-2xl font-bold mt-1 text-destructive">
              {reportedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Hidden</p>
            <p className="font-heading text-2xl font-bold mt-1">
              {hiddenCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
          <TabsTrigger value="reported">Reported ({reportedCount})</TabsTrigger>
          <TabsTrigger value="hidden">Hidden ({hiddenCount})</TabsTrigger>
          <TabsTrigger value="visible">Visible</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, product, or content"
              className="pl-9"
            />
          </div>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-10 text-center">
            <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="font-heading text-lg">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const product = productMap[String(r.productId)];
            const report = reports[r.id];
            console.log("Review:", r);
            return (
              <Card
                key={r.id}
                className={`rounded-xl ${isHidden(r) ? "opacity-70 border-dashed" : ""}`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                  {product && (
                    <img
                      src={`${BACKEND_URL}/uploads/products/${product.thumbnail}`}
                      alt={product.name}
                      className="w-14 h-14 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {product && (
                        <Badge variant="outline" className="text-[10px]">
                          {product.name}
                        </Badge>
                      )}
                      {product && (
                        <span className="text-xs text-muted-foreground">
                          · {product.vendor_name}
                        </span>
                      )}
                      {isHidden(r) && (
                        <Badge variant="secondary" className="text-[10px]">
                          Hidden
                        </Badge>
                      )}
                      {report && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] gap-1"
                        >
                          <Flag className="h-3 w-3" /> {report.count} report
                          {report.count > 1 ? "s" : ""}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(r.created_at).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`${BACKEND_URL}/uploads/avatars/${r.userAvatar}`}
                        />

                        <AvatarFallback className="text-[10px]">
                          {r.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{r.userName}</p>
                      <StarRating value={r.rating} size={12} />
                    </div>
                    {r.title && (
                      <p className="font-semibold text-sm mt-1">{r.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {r.review}
                    </p>
                    {report && (
                      <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Reported for:{" "}
                        {report.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewing(r)}
                    >
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleHide(r)}
                    >
                      {isHidden(r) ? (
                        <>
                          <Eye size={14} className="mr-1" /> Unhide
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} className="mr-1" /> Hide
                        </>
                      )}
                    </Button>
                    {report && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissReport(r.id)}
                      >
                        <Flag size={14} className="mr-1" /> Dismiss
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Review details</DialogTitle>
            <DialogDescription>
              Full review content and moderation status.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <StarRating value={viewing.rating} size={14} />
                <span className="text-muted-foreground">
                  by {viewing.userName} ·{" "}
                  {new Date(viewing.created_at).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="font-semibold">{viewing.title}</p>
              <p className="text-muted-foreground">{viewing.review}</p>
              <p className="text-xs text-muted-foreground">
                Product: {productMap[String(viewing.productId)]?.name || "—"} ·
                Verified: {viewing.verified ? "Yes" : "No"} · Helpful:{" "}
                {viewing.helpful}
              </p>
              {viewing.replies?.[0]?.reply && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs font-medium">Vendor reply</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {viewing.replies[0].reply}
                  </p>
                </div>
              )}
              {reports[viewing.id] && (
                <p className="text-xs text-destructive">
                  Reported for: {reports[viewing.id].reason}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete review by {deleting?.userName || "this customer"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the review for{" "}
              {productMap[String(deleting?.productId)]?.name || "this product"}.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviews;
