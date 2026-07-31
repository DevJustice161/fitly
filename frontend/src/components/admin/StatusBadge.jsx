const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  "under review": "bg-blue-100 text-blue-600",
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-purple-100 text-purple-600",
  delivered: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  rejected: "bg-red-100 text-red-600",
  suspended: "bg-red-100 text-red-600",
  "out of stock": "bg-red-50 text-red-700 border border-red-200",
};

const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  const style = STATUS_STYLES[key] || "bg-secondary text-secondary-foreground";
  return (
    <span
      className={`text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${style}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
