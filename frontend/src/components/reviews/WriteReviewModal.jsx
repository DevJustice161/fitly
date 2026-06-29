import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import StarRating from "./StarRating";
import { useReviews } from "@/contexts/ReviewsContext";

const MAX_IMAGES = 5;

const WriteReviewModal = ({
  open,
  onOpenChange,
  product,
  orderItemId,
  existingReview,
}) => {
  const { addReview, updateReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingReview) {
        setRating(existingReview.rating || 0);
        setTitle(existingReview.title || "");
        setText(existingReview.review || "");
        setImages(existingReview.images || []);
        setAddedImages(existingReview.addedImages || []);
      } else {
        setRating(0);
        setTitle("");
        setText("");
        setImages([]);
        setAddedImages([]);
      }
    }
  }, [open, existingReview]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    const slots = MAX_IMAGES - (images.length + addedImages.length);
    if (slots <= 0) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`);
      return;
    }
    const accepted = files.slice(0, slots);
    try {
      if (!accepted.length) return;
      if (existingReview) {
        setAddedImages((prev) => [...prev, ...accepted]);
      } else {
        setImages((prev) => [...prev, ...accepted]);
      }
    } catch {
      toast.error("Failed to read image");
    }
    e.target.value = "";
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const removeAddedImage = (idx) =>
    setAddedImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!text.trim()) {
      toast.error("Please write a short review");
      return;
    }
    setSubmitting(true);
    try {
      if (existingReview) {
        updateReview(existingReview.id, {
          productId: existingReview.productId,
          rating: rating,
          title: title.trim(),
          review: text.trim(),
          images: images,
          newImages: addedImages,
        });
        toast.success("Review updated");
      } else {
        addReview({
          productId: product.id,
          orderItemId: orderItemId,
          rating: rating,
          title: title.trim(),
          review: text.trim(),
          images: images,
        });
        toast.success("Thank you! Your review was submitted");
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {existingReview ? "Edit your review" : "Write a review"}
          </DialogTitle>
          {product && (
            <DialogDescription className="flex items-center gap-3 pt-2">
              {product.thumbnail && (
                <img
                  src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
              )}
              <span className="text-foreground font-medium">
                {product.name}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              Your rating
            </label>
            <StarRating
              value={rating}
              interactive
              onChange={setRating}
              size={28}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Your review
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell other shoppers what you loved (or didn't) about this product"
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length}/1000
            </p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Add photos (up to {MAX_IMAGES})
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((file, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-md overflow-hidden border"
                >
                  <img
                    src={
                      file instanceof File
                        ? URL.createObjectURL(file)
                        : `http://localhost:5000/uploads/reviews/${file}`
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-foreground/70 text-background rounded-bl p-0.5"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {addedImages.map((file, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-md overflow-hidden border"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeAddedImage(i)}
                    className="absolute top-0 right-0 bg-foreground/70 text-background rounded-bl p-0.5"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus size={20} className="text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || submitting}>
            {existingReview ? "Save Changes" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
