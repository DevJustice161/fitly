import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SectionHeader = ({
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = "View All",
  action,
}) => (
  <div className="flex items-end justify-between gap-4 mb-4">
    <div>
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
    {action}
    {viewAllTo && (
      <Link
        to={viewAllTo}
        className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
      >
        {viewAllLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
