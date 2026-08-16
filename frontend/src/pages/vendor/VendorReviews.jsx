import { useMemo, useState, useEffect } from "react";
import { Search, MessageSquare, BadgeCheck, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import StarRating from "@/components/reviews/StarRating";
import ImageLightbox from "@/components/reviews/ImageLightbox";
import { toast } from "sonner";

const VendorReviews = () => {
  const { user, token } = useAuth();
  const { getVendorReviews, replyToReview, deleteReply } = useReviews();
  const [vendorProfile, setVendorProfile] = useState(null);
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, images: [], idx: 0 });
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/vendors/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setVendorProfile(data);
      } catch (error) {
        console.error("Error fetching vendor profile:", error);
      }
    };
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
    fetchVendorProfile();
  }, [user.id]);

  console.log(vendorProfile);

  const all = getVendorReviews(vendorProfile?.store_name);

  const productMap = useMemo(() => {
    const m = {};
    products?.forEach((p) => {
      m[String(p.id)] = p;
    });
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    return all
      .filter(
        (r) => ratingFilter === "all" || r.rating === Number(ratingFilter),
      )
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const product = productMap[String(r.productId)];
        return (
          r.userName.toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          r.review.toLowerCase().includes(q) ||
          (product?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [all, search, ratingFilter, productMap]);

  const avg = all.length
    ? all.reduce((s, r) => s + r.rating, 0) / all.length
    : 0;

  const submitReply = () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    replyToReview(replyTarget.id, replyText.trim(), replyTarget.userId);
    toast.success("Reply posted");
    setReplyTarget(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Customer Reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and respond to reviews on your products.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-heading text-2xl font-bold">
                {avg.toFixed(1)}
              </p>
              <StarRating value={avg} size={14} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <p className="font-heading text-2xl font-bold mt-1">{all.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Replied</p>
            <p className="font-heading text-2xl font-bold mt-1">
              {all.filter((r) => r.reply).length} / {all.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-xl mb-4">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, product, or review text"
              className="pl-10"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-10 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="font-heading text-lg">No reviews found</p>
            <p className="text-sm text-muted-foreground">
              Try clearing your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const product = productMap[String(r.productId)];
            return (
              <Card key={r.id} className="rounded-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {product && (
                      <img
                        src={`${BACKEND_URL}/uploads/products/${product?.thumbnail}`}
                        alt={product?.name}
                        className="w-14 h-14 rounded-md object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {product && (
                        <span className="text-xs font-semibold text-primary">
                          {product.name}
                        </span>
                      )}
                      {r.visibility == 0 && (
                        <span className="text-sm text-destructive font-semibold ml-2">
                          Hidden by admin
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`${BACKEND_URL}/uploads/avatars/${r.userAvatar}`}
                          />
                          <AvatarFallback className="text-[10px]">
                            {r.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{r.userName}</p>
                        {r.verified && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1"
                          >
                            <BadgeCheck size={10} />
                            Verified
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(r.created_at).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <StarRating value={r.rating} size={12} className="my-1" />
                      {r.title && (
                        <p className="font-semibold text-sm">{r.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.review}
                      </p>

                      {r.images?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                setLightbox({
                                  open: true,
                                  images: r.images,
                                  idx: i,
                                })
                              }
                              className="w-14 h-14 rounded-md overflow-hidden border hover:opacity-80"
                            >
                              <img
                                src={`${BACKEND_URL}/uploads/reviews/${src}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {r.reply ? (
                        <div className="mt-4 pl-3 border-l-2 border-primary/40 bg-muted/30 rounded-r-md p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge className="text-[10px]">
                              Your Reply ·{" "}
                              {new Date(
                                r.replies[0].created_at,
                              ).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-destructive"
                              onClick={() => {
                                deleteReply(r.replies[0].id);
                                toast.success("Reply removed");
                              }}
                            >
                              <Trash2 size={12} /> Remove
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {r.replies[0].reply}
                          </p>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setReplyTarget(r);
                            setReplyText("");
                          }}
                        >
                          <MessageSquare size={12} /> Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply modal */}
      <Dialog
        open={!!replyTarget}
        onOpenChange={(v) => !v && setReplyTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Reply to review</DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <div className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/30">
              <p className="font-medium text-foreground">
                {replyTarget.userName}
              </p>
              <p className="mt-1">{replyTarget.review}</p>
            </div>
          )}
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful reply to your customer..."
            rows={4}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTarget(null)}>
              Cancel
            </Button>
            <Button onClick={submitReply}>Post Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        startIndex={lightbox.idx}
        onOpenChange={(v) => setLightbox((s) => ({ ...s, open: v }))}
      />
    </div>
  );
};

export default VendorReviews;
