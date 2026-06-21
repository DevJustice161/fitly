import { useState, useRef } from 'react';
import { Search, Printer, MessageCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { vendorOrders as initialOrders, vendorProfile } from '@/data/vendorData';

const statusColors = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-purple-100 text-purple-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const VendorOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const invoiceRef = useRef(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.product.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    toast({ title: 'Order updated', description: `Status changed to ${status}.` });
  };

  const openInvoice = (order) => { setSelected(order); setInvoiceOpen(true); };
  const openContact = (order) => { setSelected(order); setMessage(''); setContactOpen(true); };

  const handlePrint = () => {
    const content = invoiceRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`
      <html><head><title>Invoice ${selected.id}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
        h1,h2,h3 { margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
        .right { text-align: right; }
        .muted { color: #666; font-size: 13px; }
        .total { font-size: 18px; font-weight: 700; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({ title: 'Message empty', description: 'Please type a message before sending.', variant: 'destructive' });
      return;
    }
    setContactOpen(false);
    toast({ title: 'Message sent', description: `Your message to ${selected.customer} has been sent.` });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? 'bg-primary text-primary-foreground' : ''}>
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <Card key={order.id} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img src={order.productImage} alt={order.product} className="h-20 w-20 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">{order.product}</p>
                      <p className="text-sm text-muted-foreground">{order.id} • {order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm flex-wrap">
                    <div><span className="text-muted-foreground">Price:</span> <span className="font-semibold">₦{order.price.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Commission:</span> <span className="text-destructive">-₦{order.commission.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Earning:</span> <span className="text-green-600 font-semibold">₦{order.earning.toLocaleString()}</span></div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openInvoice(order)}>
                      <Printer className="h-3 w-3 mr-1" /> Invoice
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openContact(order)}>
                      <MessageCircle className="h-3 w-3 mr-1" /> Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12"><p className="text-muted-foreground">No orders found</p></div>
      )}

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Order {selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div ref={invoiceRef} className="space-y-4 text-foreground">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold">{vendorProfile.storeName}</h2>
                  <p className="muted text-sm text-muted-foreground">{vendorProfile.address}</p>
                  <p className="muted text-sm text-muted-foreground">{vendorProfile.email} • {vendorProfile.phone}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">{selected.id}</p>
                  <p className="text-sm text-muted-foreground">{selected.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="muted text-muted-foreground">Billed To</p>
                  <p className="font-medium">{selected.customer}</p>
                </div>
                <div className="text-right">
                  <p className="muted text-muted-foreground">Status</p>
                  <p className="font-medium">{selected.status}</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Item</th>
                    <th className="right text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2">{selected.product}</td>
                    <td className="right text-right py-2">₦{selected.price.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Platform Commission</td>
                    <td className="right text-right py-2 text-destructive">-₦{selected.commission.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 total font-bold">Vendor Earning</td>
                    <td className="right text-right py-3 total font-bold">₦{selected.earning.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                Thank you for selling on Fitly.ng
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceOpen(false)}>Close</Button>
            <Button onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selected?.customer}</DialogTitle>
            <DialogDescription>Send a message regarding order {selected?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium">{selected?.product}</p>
              <p className="text-xs text-muted-foreground">₦{selected?.price.toLocaleString()} • {selected?.status}</p>
            </div>
            <Textarea
              placeholder="Type your message to the customer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrders;
