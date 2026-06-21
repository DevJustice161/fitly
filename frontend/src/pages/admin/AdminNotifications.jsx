import { useState } from 'react';
import { Bell, Store, Wallet, AlertTriangle, CheckCheck, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const seed = [
  { id: 'an1', type: 'application', title: 'New Vendor Application', description: 'Ngozi Couture submitted an application for review', time: '15 min ago', read: false },
  { id: 'an2', type: 'withdrawal', title: 'Withdrawal Request', description: 'Kings Tailoring requested ₦120,000 withdrawal', time: '1 hour ago', read: false },
  { id: 'an3', type: 'alert', title: 'Suspicious Activity', description: 'Multiple failed login attempts detected for vendor Royal Fits', time: '3 hours ago', read: false },
  { id: 'an4', type: 'application', title: 'Application Updated', description: 'Tunde Menswear uploaded additional documents', time: '5 hours ago', read: true },
  { id: 'an5', type: 'user', title: 'New Customer Registration', description: '15 new customers signed up today', time: '1 day ago', read: true },
  { id: 'an6', type: 'withdrawal', title: 'Withdrawal Approved', description: 'Luxe Accessories NG withdrawal of ₦45,000 approved', time: '2 days ago', read: true },
];

const iconFor = (type) => {
  switch (type) {
    case 'application': return Store;
    case 'withdrawal': return Wallet;
    case 'alert': return AlertTriangle;
    case 'user': return UserPlus;
    default: return Bell;
  }
};

const colorFor = (type) => {
  switch (type) {
    case 'application': return 'text-primary bg-primary/10';
    case 'withdrawal': return 'text-green-600 bg-green-100';
    case 'alert': return 'text-red-600 bg-red-100';
    case 'user': return 'text-blue-600 bg-blue-100';
    default: return 'text-muted-foreground bg-secondary';
  }
};

const AdminNotifications = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(seed);
  const unread = items.filter(i => !i.read).length;

  const markAllRead = () => {
    setItems(prev => prev.map(i => ({ ...i, read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const remove = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Notification removed' });
  };

  const toggleRead = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: !i.read } : i));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <Card className="border border-border shadow-sm"><CardContent className="p-8 text-center text-muted-foreground">No notifications</CardContent></Card>
        )}
        {items.map(n => {
          const Icon = iconFor(n.type);
          return (
            <Card key={n.id} className={`border border-border shadow-sm transition ${!n.read ? 'bg-primary/5' : ''}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorFor(n.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toggleRead(n.id)}>
                    {n.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => remove(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNotifications;
