import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Edit, Upload, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { vendorProducts as initialProducts } from "@/data/vendorData";
import { useAuth } from "@/contexts/AuthContext.jsx";

const API_URL = "http://localhost:5000/api/products";
const categories = [
  "Women's fashion",
  "Men's fashion",
  "Shoes",
  "Bags",
  "Accessories",
  "Beauty products",
];
const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
];
const colorOptions = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Pink",
  "Gold",
  "Silver",
  "Navy",
  "Burgundy",
  "Cream",
  "Brown",
];
const statuses = ["Active", "Inactive", "Out of Stock"];

const VendorProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Active", "Inactive", "Out of Stock"];
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [dataImages, setDataImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    thumbnail: "",
    description: "",
    name: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    category: "",
    status: "",
    images: [],
    sizes: [],
    colors: [],
  });

  // fetch products

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/vendor/${user.id}`);

      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user]);

  const handleThumbnailChange = (e) => {
    setForm({
      ...form,
      thumbnail: e.target.files[0],
    });
    const file = e.target.files[0];

    if (!file) return;

    setThumbnailFile(file);
  };

  const handleGalleryChange = (e) => {
    setForm({
      ...form,
      images: [...e.target.files],
    });
    const files = Array.from(e.target.files);

    if (!files.length) return;
    const fileName = files.map((file) => file.name);
    setGalleryFiles((prev) => [...prev, ...fileName]);
    setUploadFiles((prev) => [...prev, ...files]);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setSelected(null);
    setForm({
      thumbnail: "",
      description: "",
      name: "",
      price: "",
      discount_price: "",
      stock_quantity: "",
      category: "",
      status: "",
      images: [],
    });
    setThumbnailFile(null);
    setDataImages([]);
    setGalleryFiles([]);
    setUploadFiles([]);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const removeDataImage = (index) => {
    setDataImages((prev) => prev.filter((_, i) => i !== index));
  };
  const removeUploadFilesImage = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openEdit = (p) => {
    setSelected(p);
    const image_URLs = p.images ? p.images.map((img) => img.image_url) : [];
    const productSizes = p.variants
      ? [...new Set(p.variants.map((v) => v.size).filter(Boolean))]
      : [];
    const productColors = p.variants
      ? [...new Set(p.variants.map((v) => v.color).filter(Boolean))]
      : [];
    setSelectedSizes(productSizes);
    setSelectedColors(productColors);
    setDataImages(image_URLs);
    setGalleryFiles(image_URLs);

    setForm({
      thumbnail: p.thumbnail || "",
      name: p.name,
      description: p.description || "",
      price: p.price,
      discount_price: p.discount_price || "",
      stock_quantity: p.stock_quantity,
      category: p.category,
      status: p.status,
      images: p.images || [],
      sizes: productSizes,
      colors: productColors,
    });
    setEditOpen(true);
  };

  const openDelete = (p) => {
    setSelected(p);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.price) {
        toast({
          title: "Missing fields",
          description: "Name and price are required",
          variant: "destructive",
        });

        return;
      }

      const MAX_FILE_SIZE = 20 * 1024 * 1024;

      if (thumbnailFile && thumbnailFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File Size Error",
          description: "Thumbnail image exceeds the 20MB limit.",
        });
        return;
      }

      if (dataImages.some((file) => file.size > MAX_FILE_SIZE)) {
        toast({
          title: "File Size Error",
          description: "One or more gallery images exceed the 20MB limit.",
        });
        return;
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append(
        "discount_price",
        form.discount_price ? Number(form.discount_price) : null,
      );
      formData.append("stock_quantity", form.stock_quantity);
      formData.append("category", form.category);
      formData.append(
        "status",
        form.stock_quantity === 0 ? "Out of Stock" : form.status,
      );
      formData.append("sizes", JSON.stringify(form.sizes));
      formData.append("colors", JSON.stringify(form.colors));
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      formData.append("existingImages", JSON.stringify(dataImages));
      uploadFiles.forEach((file) => formData.append("gallery", file));

      const response = await fetch(`${API_URL}/update/${selected.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Update failed",
          description: data.message || "Could not update product",
          variant: "destructive",
        });
        return;
      }

      await fetchProducts();

      toast({
        title: "Product updated",
        description: `${form.name} has been updated successfully.`,
      });
      closeEditDialog();
    } catch (error) {
      console.error("Update error:", error);

      toast({
        title: "Update failed",
        description: error.message || "Could not update product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setProducts(products.filter((p) => p.id !== selected.id));
    try {
      const response = await fetch(`${API_URL}/delete/${selected.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete product");
      }
      await fetchProducts();
      setDeleteOpen(false);
      toast({
        title: "Product deleted",
        description: `${selected.name} has been removed from your store.`,
      });
    } catch (error) {
      console.error("Delete error:", error);

      toast({
        title: "Delete failed",
        description: error.message || "Could not delete product",
        variant: "destructive",
      });
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          My Products
        </h1>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link to="/vendor/products/add">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f ? "bg-primary text-primary-foreground" : ""
              }
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {filtered.map((product) => (
          <Card
            key={product.id}
            className="border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex gap-4">
              <img
                src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                alt={product.name}
                className="h-20 w-20 rounded-lg object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <Badge
                    className={
                      product.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <p className="font-heading font-semibold text-foreground">
                    ₦{product.price.toLocaleString()}
                  </p>
                  {product.discount_price && (
                    <p className="text-sm text-muted-foreground line-through">
                      ₦{product.discount_price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Stock: {product.stock_quantity}</span>
                  {/* <span>Sales: {product.sales}</span> */}
                  <span>Sales: 300</span>
                  <span>⭐ {product.rating}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => openEdit(product)}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => openDelete(product)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Edit Dialog */}
      {/* EDIT PRODUCT DIALOG */}
      <Dialog
        open={editOpen}
        onOpenChange={closeEditDialog}
        onClose={closeEditDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex flex-col max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update all product information
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* PRODUCT NAME */}
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* CATEGORY */}
              <div className="space-y-2">
                <Label>Category</Label>

                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PRICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦)</Label>

                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Price (₦)</Label>

                  <Input
                    type="number"
                    value={form.discount_price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_price: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* STOCK + STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>

                  <Input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock_quantity: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>

                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {statuses.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SIZES */}
              <div className="space-y-2">
                <Label>Sizes</Label>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const exists = form.sizes?.includes(size);

                        setForm({
                          ...form,
                          sizes: exists
                            ? form.sizes.filter((s) => s !== size)
                            : [...(form.sizes || []), size],
                        });
                      }}
                      className={`px-3 py-1 rounded border text-sm ${
                        form.sizes?.includes(size)
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLORS */}
              <div className="space-y-2">
                <Label>Colors</Label>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        const exists = form.colors?.includes(color);

                        setForm({
                          ...form,
                          colors: exists
                            ? form.colors.filter((c) => c !== color)
                            : [...(form.colors || []), color],
                        });
                      }}
                      className={`px-3 py-1 rounded border text-sm ${
                        form.colors?.includes(color)
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* THUMBNAIL */}
              <div className="space-y-2">
                <Label>Thumbnail Image</Label>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />

                {thumbnailFile ? (
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    className="h-20 w-20 object-cover rounded"
                    alt="New Thumbnail"
                  />
                ) : (
                  selected?.thumbnail && (
                    <img
                      src={`http://localhost:5000/uploads/products/${selected.thumbnail}`}
                      className="h-20 w-20 object-cover rounded"
                      alt="Current Thumbnail"
                    />
                  )
                )}

                {/* {selected?.thumbnail && (
                  <img
                    src={`http://localhost:5000/uploads/products/${selected.thumbnail}`}
                    className="h-32 w-32 object-cover rounded"
                  />
                )} */}
              </div>

              {/* GALLERY */}
              <div className="space-y-2">
                <Label>Gallery Images</Label>

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryChange}
                />

                <div className="flex flex-wrap gap-3">
                  {/* {selected?.images?.map((img) => (
                    <img
                      key={img.id}
                      src={`http://localhost:5000/uploads/products/${img.image_url}`}
                      className="h-24 w-24 rounded object-cover"
                    />
                  ))} */}
                  {dataImages.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {dataImages.map((file, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden border"
                        >
                          <img
                            src={`http://localhost:5000/uploads/products/${file}`}
                            alt="Preview"
                            className="h-full w-20 rounded object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeDataImage(index)}
                            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden border"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="h-full w-20 rounded object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeUploadFilesImage(index)}
                            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>

              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{selected?.name}</strong>{" "}
              from your store. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorProducts;
