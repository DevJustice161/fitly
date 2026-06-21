import { ShoppingCart, Heart, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockRecentlyViewed } from "@/data/dashboardData";

const RecentlyViewedPage = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
        <Clock className="h-6 w-6 text-primary" /> Recently Viewed
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {mockRecentlyViewed.map((item) => (
          <Card key={item.id} className="border border-border shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <CardContent className="p-3">
              <img src={item.image} alt={item.name} className="w-full aspect-square rounded-lg object-cover bg-muted mb-2" />
              <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.vendor}</p>
              <p className="font-heading font-semibold text-sm text-foreground mt-1">₦{item.price.toLocaleString()}</p>
              <div className="flex gap-1 mt-2">
                <Button size="sm" className="flex-1 rounded-full text-[10px] h-7 bg-primary text-primary-foreground hover:bg-primary/90">
                  <ShoppingCart className="h-3 w-3 mr-1" /> Cart
                </Button>
                <Button size="icon" variant="outline" className="h-7 w-7 rounded-full border-border">
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedPage;
