import { useMemo, useState } from "react";
import { ThumbsUp, BadgeCheck, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { useReviews, CURRENT_USER } from "@/contexts/ReviewsContext";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from "./StarRating";
import WriteReviewModal from "./WriteReviewModal";
import ImageLightbox from "./ImageLightbox";
import { toast } from "sonner";

const PAGE_SIZE = 4;

const ProductReviewsSection = ({ product }) => {
  const { user } = useAuth();
  const {
    getProductReviews,
    getProductStats,
    toggleHelpful,
    hasUserVotedHelpful,
    deleteReview,
    reviewableItems,
  } = useReviews();

  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], idx: 0 });

  const all = getProductReviews(product.id);
  const stats = getProductStats(product.id);

  // Find a reviewable order item for this product
  const reviewableForThis = reviewableItems.find(
    (i) => String(i.productId) === String(product.id) && !i.reviewed,
  );

  const sorted = useMemo(() => {
    const arr = [...all];
    if (sort === "recent")
      arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "highest") arr.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") arr.sort((a, b) => a.rating - b.rating);
    if (sort === "helpful")
      arr.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    return arr;
  }, [all, sort]);

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const customerPhotos = all.flatMap((r) => r.images || []).slice(0, 8);

  const openLightbox = (images, idx) =>
    setLightbox({ open: true, images, idx });

  const openDeleteDialog = (r) => {
    setSelected(r);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const handleDelete = () => {
    deleteReview(selected.id);
    toast.success("Review deleted");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <div className="font-heading text-5xl font-bold text-foreground">
                {stats.avg ? stats.avg.toFixed(1) : "0.0"}
              </div>
              <StarRating
                value={stats.avg}
                size={18}
                className="mt-2 justify-center md:justify-start"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {stats.count} review{stats.count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s) => {
                const pct = stats.count
                  ? Math.round((stats.distribution[s] / stats.count) * 100)
                  : 0;
                return (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <span className="w-6 text-muted-foreground">{s}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="mt-4" />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div>
              {reviewableForThis ? (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  Write a Review
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Only verified buyers of this product can leave a review.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer photos */}
      {customerPhotos.length > 0 && (
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-primary" />
              <h4 className="font-semibold text-sm">Customer Photos</h4>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {customerPhotos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(customerPhotos, i)}
                  className="w-20 h-20 rounded-lg overflow-hidden border shrink-0 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={`http://localhost:5000/uploads/reviews/${src}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {visible.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-10 text-center">
            <div className="text-5xl mb-2">⭐</div>
            <p className="font-heading text-lg">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your thoughts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const mine = r.userId === user.id;
            const voted = hasUserVotedHelpful(r.id);
            return (
              <Card
                key={r.id}
                className="rounded-xl hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <img
                        src={`http://localhost:5000/uploads/avatars/${r.userAvatar}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {/* <AvatarFallback>{r.userName.charAt(0)}</AvatarFallback> */}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm">{r.userName}</p>
                        {r.verified && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1"
                          >
                            <BadgeCheck size={10} /> Verified Purchase
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {r.createdAt}
                        </span>
                      </div>
                      <StarRating value={r.rating} size={12} className="my-1" />
                      {r.title && (
                        <p className="font-semibold text-sm mt-1">{r.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                        {r.review}
                      </p>

                      {r.images && r.images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {r.images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => openLightbox(r.images, i)}
                              className="w-16 h-16 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={`http://localhost:5000/uploads/reviews/${src}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <button
                          onClick={() => toggleHelpful(r.id)}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            voted
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-accent"
                          }`}
                        >
                          <ThumbsUp size={12} /> Helpful ({r.helpful || 0})
                        </button>
                        {r.helpful > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {r.helpful} {r.helpful === 1 ? "person" : "people"}{" "}
                            found this helpful
                          </span>
                        )}
                        {mine && (
                          <div className="ml-auto flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditing(r);
                                setModalOpen(true);
                              }}
                            >
                              <Pencil size={12} /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => openDeleteDialog(r)}
                            >
                              <Trash2 size={12} /> Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      {r.replies.length != 0 && (
                        <div className="mt-3 ml-2 pl-3 border-l-2 border-primary/40 bg-muted/30 rounded-r-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-[10px]">Vendor Reply</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                r.replies[0].created_at.replace(" ", "T"),
                              ).toLocaleString(undefined, dateOptions)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {r.replies[0].reply}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {visible.length < sorted.length && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}

      <WriteReviewModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setEditing(null);
        }}
        product={product}
        orderItemId={
          editing ? editing.orderItemId : reviewableForThis?.orderItemId
        }
        existingReview={editing}
      />
      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        startIndex={lightbox.idx}
        onOpenChange={(v) => setLightbox((s) => ({ ...s, open: v }))}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the review details. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductReviewsSection;
