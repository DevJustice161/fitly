import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import EmptyState from "@/components/admin/EmptyState";
import { adminCategories } from "@/data/adminManagementData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const emptyForm = { name: "", slug: "", subcategories: "" };

const AdminCategories = () => {
  const { user, token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.BACKEND_URL;
  const { toast } = useToast();
  const [categories, setCategories] = useState(adminCategories);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCategories(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      subcatname: c.subcatname.join(", "),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Name required",
        description: "Enter a category name.",
        variant: "destructive",
      });
      return;
    }

    const subCategories = form.subcatname
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = (form.name || form.slug).toLowerCase().replace(/\s+/g, "-");

    try {
      const url = editing
        ? `${API_URL}/categories/${editing.id}`
        : `${API_URL}/categories`;

      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          slug,
          sub_categories: subCategories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast({
        title: editing ? "Category updated" : "Category added",
        description: data.message,
      });

      fetchCategories(); // Refresh from database

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description: error.message,
      });
    }
  };

  const updateCategoryImage = async (categoryId, file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/categories/${categoryId}/image`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "Image Updated",
        description: data.message,
      });

      fetchCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };
  const toggleActive = async (id) => {
    try {
      const category = categories.find((c) => c.id === id);

      if (!category) return;

      const newStatus = !category.active;

      const response = await fetch(`${API_URL}/categories/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update category status");
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                active: newStatus,
              }
            : c,
        ),
      );

      toast({
        title: "Category Updated",
        description: `Category has been ${
          newStatus ? "activated" : "deactivated"
        }.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  const remove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Category Deleted",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = categories.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.subcatname.join(" ").toLowerCase().includes(q),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Manage Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organise how products are browsed on Fitly.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Add a category to get started."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <Card key={c.id} className="border border-border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /{c.slug} • {c.products}{" "}
                      {c.products <= 1 ? "product" : "products"}
                    </p>
                  </div>
                  <Switch
                    checked={c.active}
                    onCheckedChange={() => toggleActive(c.id)}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.subcatname?.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No subcategories
                    </span>
                  )}
                  {c.subcatname?.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-border group shadow-sm">
                  <img
                    src={`${BACKEND_URL}/uploads/categories/${c.image}`}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <label
                      htmlFor={`category-image-${c.id}`}
                      className="cursor-pointer bg-white text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                    >
                      Change Image
                    </label>

                    <input
                      id={`category-image-${c.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        updateCategoryImage(c.id, e.target.files[0])
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive"
                    onClick={() => setConfirmAction(c)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kids"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="kids"
                disabled
              />
            </div>
            <div>
              <Label>Subcategories (comma separated)</Label>
              <Input
                value={form.subcatname}
                onChange={(e) =>
                  setForm({ ...form, subcatname: e.target.value })
                }
                placeholder="Boys, Girls, Baby"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction &&
                `${confirmAction.name} will be deleted permanently, this action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove(confirmAction.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
