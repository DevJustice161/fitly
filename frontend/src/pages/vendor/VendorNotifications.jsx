import { useState } from 'react';
import { Bell, ShoppingBag, Truck, MessageCircle, Wallet, Crown, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vendorNotifications } from '@/data/vendorData';

const iconMap = {
  order: ShoppingBag,
  delivery: Truck,
  message: MessageCircle,
  withdrawal: Wallet,
  subscription: Crown,
};

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState(vendorNotifications);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <Card key={n.id} className={`border shadow-sm transition-colors ${n.read ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                  <Icon className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-foreground' : 'font-semibold text-foreground'}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VendorNotifications;
