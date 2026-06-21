import { useState } from 'react';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { vendorMessages } from '@/data/vendorData';

const VendorMessages = () => {
  const [selected, setSelected] = useState(vendorMessages[0]);

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
        {/* Conversation List */}
        <Card className="border border-border shadow-sm md:col-span-1 overflow-auto">
          <CardContent className="p-0">
            {vendorMessages.map(msg => (
              <div key={msg.id} onClick={() => setSelected(msg)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${selected?.id === msg.id ? 'bg-secondary/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {msg.customer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${msg.unread ? 'font-semibold text-foreground' : 'text-foreground'}`}>{msg.customer}</p>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.lastMessage}</p>
                  </div>
                  {msg.unread && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="border border-border shadow-sm md:col-span-2 flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-foreground">{selected?.customer}</p>
          </div>
          <CardContent className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">{selected?.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selected?.time}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">Thank you for your interest! Let me check that for you.</p>
                  <p className="text-xs text-muted-foreground mt-1">Just now</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorMessages;
