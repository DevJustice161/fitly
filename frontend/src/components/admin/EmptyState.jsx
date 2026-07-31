import { Inbox } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-dashed border-border bg-card/50">
    <div className="h-11 w-11 rounded-full bg-secondary/70 flex items-center justify-center mb-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="font-medium text-foreground text-sm">{title}</p>
    {description && (
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {description}
      </p>
    )}
  </div>
);

export default EmptyState;
