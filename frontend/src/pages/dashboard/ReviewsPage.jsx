import { useMemo, useState, useEffect } from "react";
import { Star, Edit, Trash2, PenSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
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
//import { products } from "@/data/products";
import StarRating from "@/components/reviews/StarRating";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ReviewsPage = () => {
  const { user } = useAuth();
  const API_URL = "http://localhost:5000/api/products/productsCard";
  const [products, setProducts] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { getUserReviews, deleteReview, reviewableItems } = useReviews();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch(`${API_URL}`);

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.log("Can't fetch products", error);
      }
    };
    getProducts();
  }, [user.id]);

  const openDeleteDialog = (r) => {
    setSelected(r);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const productMap = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      m[String(p.id)] = p;
    });
    return m;
  }, [products]);

  const myReviews = getUserReviews();
  //console.log(reviewableItems);
  const toReview = reviewableItems.filter((i) => !i.reviewed);

  const [modal, setModal] = useState({
    open: false,
    product: null,
    orderItemId: null,
    existing: null,
  });

  const handleDelete = () => {
    deleteReview(selected.id);
    toast.success("Review deleted");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        My Reviews
      </h1>

      <Tabs defaultValue="written" className="w-full">
        <TabsList>
          <TabsTrigger value="written">
            Written ({myReviews.length})
          </TabsTrigger>
          <TabsTrigger value="to-review">
            To Review ({toReview.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="written" className="mt-4">
          {myReviews.length === 0 ? (
            <div className="text-center py-20">
              <Star className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-heading text-muted-foreground">
                No reviews yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your product reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((r) => {
                const product = productMap[String(r.productId)];
                return (
                  <Card key={r.id} className="border border-border shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                      {product && (
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0"
                          />
                        </Link>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {product && (
                              <Link
                                to={`/product/${product.id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {product.name}
                              </Link>
                            )}
                            <StarRating
                              value={r.rating}
                              size={14}
                              className="mt-1"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {r.created_at}
                          </span>
                        </div>
                        {r.title && (
                          <p className="text-sm font-semibold">{r.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {r.review}
                        </p>
                        {r.images?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {r.images.map((src, i) => (
                              <img
                                key={i}
                                src={`http://localhost:5000/uploads/reviews/${src}`}
                                alt=""
                                className="w-14 h-14 rounded-md object-cover border"
                              />
                            ))}
                          </div>
                        )}
                        {r.reply && (
                          <div className="mt-2 pl-3 border-l-2 border-primary/40 bg-muted/30 rounded-r-md p-2">
                            <Badge className="text-[10px] mb-1">
                              Vendor Reply
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {r.reply}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs"
                            onClick={() =>
                              setModal({
                                open: true,
                                product,
                                orderItemId: r.orderItemId,
                                existing: r,
                              })
                            }
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(r)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="to-review" className="mt-4">
          {toReview.length === 0 ? (
            <div className="text-center py-20">
              <PenSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-heading text-muted-foreground">
                All caught up!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You've reviewed every delivered order.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {toReview.map((item) => {
                const product = productMap[String(item.productId)] || {
                  id: item.productId,
                  name: item.productName,
                  image: item.productImage,
                };
                return (
                  <Card key={item.orderItemId} className="border border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <img
                        src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                        alt={product.name}
                        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.vendor}
                          {/* · Delivered {item.date} */}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setModal({
                            open: true,
                            product,
                            orderItemId: item.orderItemId,
                            existing: null,
                          })
                        }
                      >
                        <PenSquare className="h-3 w-3 mr-1" /> Write
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <WriteReviewModal
        open={modal.open}
        onOpenChange={(v) => setModal((s) => ({ ...s, open: v }))}
        product={modal.product}
        orderItemId={modal.orderItemId}
        existingReview={modal.existing}
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

export default ReviewsPage;
