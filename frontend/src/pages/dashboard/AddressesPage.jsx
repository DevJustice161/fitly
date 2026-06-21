import { useState } from "react";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockAddresses } from "@/data/dashboardData";
import { toast } from "@/hooks/use-toast";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
};

const AddressesPage = () => {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      country: addr.country,
    });
    setDialogOpen(true);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state) {
      toast({ title: "Missing details", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (editingId) {
      setAddresses((list) =>
        list.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
      toast({ title: "Address updated", description: "Your delivery address has been updated." });
    } else {
      const newAddr = {
        id: Date.now(),
        ...form,
        isDefault: addresses.length === 0,
      };
      setAddresses((list) => [...list, newAddr]);
      toast({ title: "Address added", description: "New delivery address saved." });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setAddresses((list) => {
      const filtered = list.filter((a) => a.id !== deleteId);
      const removed = list.find((a) => a.id === deleteId);
      if (removed?.isDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
    toast({ title: "Address deleted" });
    setDeleteId(null);
  };

  const handleSetDefault = (id) => {
    setAddresses((list) =>
      list.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast({ title: "Default updated", description: "Default delivery address changed." });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Delivery Addresses</h1>
        <Button onClick={openAdd} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-10 text-center text-muted-foreground">
            No addresses yet. Click “Add Address” to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className={`border shadow-sm ${addr.isDefault ? "border-primary" : "border-border"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground">{addr.name}</p>
                  </div>
                  {addr.isDefault && (
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                      <Check className="h-3 w-3 mr-1" /> Default
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{addr.phone}</p>
                  <p>{addr.address}</p>
                  <p>{addr.city}, {addr.state}, {addr.country}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button onClick={() => openEdit(addr)} size="sm" variant="outline" className="rounded-full text-xs border-border">
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button onClick={() => setDeleteId(addr.id)} size="sm" variant="outline" className="rounded-full text-xs border-border text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                  {!addr.isDefault && (
                    <Button onClick={() => handleSetDefault(addr.id)} size="sm" variant="outline" className="rounded-full text-xs border-primary text-primary">
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={handleChange("name")} placeholder="Adaeze Okafor" />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input value={form.phone} onChange={handleChange("phone")} placeholder="+234 801 234 5678" />
            </div>
            <div className="space-y-1">
              <Label>Street Address</Label>
              <Input value={form.address} onChange={handleChange("address")} placeholder="12 Admiralty Way" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={form.city} onChange={handleChange("city")} placeholder="Lekki" />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={form.state} onChange={handleChange("state")} placeholder="Lagos" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={handleChange("country")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {editingId ? "Save Changes" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The address will be removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressesPage;
