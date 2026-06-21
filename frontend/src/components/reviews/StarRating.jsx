import { Star } from "lucide-react";

const StarRating = ({
  value = 0,
  size = 14,
  onChange,
  interactive = false,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const Btn = interactive ? "button" : "span";
        return (
          <Btn
            key={n}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(n) : undefined}
            className={
              interactive
                ? "cursor-pointer transition-transform hover:scale-110"
                : ""
            }
            aria-label={interactive ? `Rate ${n} stars` : undefined}
          >
            <Star
              size={size}
              className={filled ? "text-primary fill-primary" : "text-border"}
            />
          </Btn>
        );
      })}
    </div>
  );
};

export default StarRating;
