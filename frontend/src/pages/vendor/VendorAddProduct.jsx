import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, PlusCircle, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext.jsx";

const API_URL = "http://localhost:5000/api";

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

const VendorAddProduct = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");

  const [stockQuantity, setStockQuantity] = useState("");

  const [price, setPrice] = useState("");

  const [discountPrice, setDiscountPrice] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setThumbnailFile(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setGalleryFiles((prev) => [...prev, ...files]);
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !category || !price || !stockQuantity) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
      });

      return;
    }

    if (!thumbnailFile) {
      toast({
        title: "Thumbnail Required",
        description: "Please upload a thumbnail image.",
      });

      return;
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    if (thumbnailFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File Size Error",
        description: "Thumbnail image size exceeds the 20MB limit.",
      });
      return;
    }

    if (galleryFiles.some((file) => file.size > MAX_FILE_SIZE)) {
      toast({
        title: "File Size Error",
        description: "One or more gallery images exceed the 20MB limit.",
      });
      return;
    }

    if (selectedSizes.length === 0 && selectedColors.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one size or color.",
      });

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("vendor_id", user.id);

      formData.append("name", name);

      formData.append("description", description);

      formData.append("category", category);

      formData.append("price", price);

      formData.append("stock_quantity", stockQuantity);

      if (discountPrice) {
        formData.append("discount_price", discountPrice);
      }

      formData.append("thumbnail", thumbnailFile);

      galleryFiles.forEach((file) => {
        formData.append("gallery", file);
      });

      formData.append("sizes", JSON.stringify(selectedSizes));
      formData.append("colors", JSON.stringify(selectedColors));

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      toast({
        title: "Success",
        description: "Product added successfully.",
      });

      navigate("/vendor/products");
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/vendor/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <h1 className="font-heading text-3xl font-bold">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PRODUCT DETAILS */}

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>

              <Input
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                rows={5}
                placeholder="Describe your product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>

                <Select value={category} onValueChange={setCategory}>
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

              <div className="space-y-2">
                <Label>Stock Quantity</Label>

                <Input
                  type="number"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₦)</Label>

                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Price</Label>

                <Input
                  type="number"
                  placeholder="Optional"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VARIANTS */}

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Sizes & Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSizes.includes(size)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Available Colors</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedColors.includes(color)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* THUMBNAIL */}

        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Image</CardTitle>
          </CardHeader>

          <CardContent>
            <label className="border-2 border-dashed rounded-xl min-h-[220px] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />

              {/* <img
                src="http://localhost:5000/uploads/logos/1778685419790-756531337.jpg"
                alt="testing"
                className="w-20 h-20 object-cover"
              /> */}

              {thumbnailFile ? (
                <>
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail Preview"
                    className=" w-20 h-20 object-cover"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();

                      setThumbnailFile(null);
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />

                  <p className="text-sm text-muted-foreground">
                    Click to upload thumbnail
                  </p>
                </>
              )}
            </label>
          </CardContent>
        </Card>

        {/* GALLERY */}

        <Card>
          <CardHeader>
            <CardTitle>Gallery Images</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryChange}
              />

              <Upload className="h-8 w-8 text-muted-foreground mb-2" />

              <p className="text-sm text-muted-foreground">
                Upload gallery images
              </p>
            </label>

            {galleryFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full h-12">
          <PlusCircle className="h-5 w-5 mr-2" />

          {loading ? "Publishing..." : "Publish Product"}
        </Button>
      </form>
    </div>
  );
};

export default VendorAddProduct;
