import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageLightbox = ({ images = [], startIndex = 0, open, onOpenChange }) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    if (open) setIdx(startIndex);
  }, [open, startIndex]);

  if (!images.length) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-black border-0">
        <div className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center">
          <img
            src={`http://localhost:5000/uploads/reviews/${images[idx]}`}
            alt={`Review ${idx + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 text-center text-white/80 text-xs">
                {idx + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
