import React from "react";

const SkeletonLoader = ({ count = 8, type = "product" }) => {
  const renderDashboardOverviewSkeleton = () => (
    <div className=" gap-4">
      <div className="border rounded-xl p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-7 w-16 bg-muted rounded animate-pulse" />
          </div>

          <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
        </div>

        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );

  const renderCartSkeleton = () => (
    <div className="flex gap-3 p-4 border-b">
      <div className="flex-1 ">
        <div className="h-32 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 ">
        <div className="h-32 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 w-32 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );

  const renderProductSkeleton = () => (
    <div className="bg-background border rounded-xl overflow-hidden shadow-sm">
      <div className="h-56 w-full bg-muted animate-pulse" />

      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />

        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />

        <div className="h-5 w-24 bg-muted rounded animate-pulse" />

        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>

        <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );

  const renderMessageSkeleton = () => (
    <div className="flex gap-3 p-4 border-b">
      <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />

      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );

  const renderNotificationSkeleton = () => (
    <div className="p-4 border rounded-xl">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );

  const renderOrderSkeleton = () => (
    <div className="border rounded-xl p-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-muted rounded-lg animate-pulse" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />

        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case "dashboard":
        return renderDashboardOverviewSkeleton();

      case "cart":
        return renderCartSkeleton();

      case "messages":
        return renderMessageSkeleton();

      case "notifications":
        return renderNotificationSkeleton();

      case "orders":
        return renderOrderSkeleton();

      case "profile":
        return renderProfileSkeleton();

      default:
        return renderProductSkeleton();
    }
  };

  return (
    <div
      className={
        type === "product"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "space-y-4"
      }
    >
      {[...Array(count)].map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export { SkeletonLoader };
