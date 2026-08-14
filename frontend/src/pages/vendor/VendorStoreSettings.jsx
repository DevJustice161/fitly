import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext.jsx";

const VendorStoreSettings = () => {
  const { toast } = useToast();
  const { user, updateUser, token } = useAuth();
  const [vendorDetails, setVendorDetails] = useState({});
  const [categories, setCategories] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchVendorDetails = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}/vendors/profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setVendorDetails(data);
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
      }

      const normalizedCategories = Array.isArray(data)
        ? data.map((category) => {
            if (typeof category === "string") {
              return { name: category, slug: category };
            }

            return {
              name: category.name || category.slug || "Unnamed category",
              slug: category.slug || category.name || "",
            };
          })
        : [];

      setCategories(normalizedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await fetch(`${API_URL}/couriers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load couriers");
      }

      setCouriers(data);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCouriers();
    fetchVendorDetails();
  }, [user?.id]);

  const validatePhoneNumber = (phone) => {
    if (!phone) return true;

    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.length !== 11) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be exactly 11 digits.",
        variant: "destructive",
      });
      return false;
    }

    if (phone !== digitsOnly) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must contain only numbers.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Unable to save",
        description: "Please sign in again and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(vendorDetails.phone)) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/vendors/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_name: vendorDetails.store_name,
          store_description: vendorDetails.store_description,
          category: vendorDetails.category,
          default_courier: vendorDetails.default_courier,
          email: vendorDetails.email,
          phone: vendorDetails.phone,
          address: vendorDetails.address,
          business_address: vendorDetails.address,
          city: vendorDetails.city,
          state: vendorDetails.state,
          country: vendorDetails.country,
          bank_name: vendorDetails.bank_name,
          account_name: vendorDetails.account_name,
          account_number: vendorDetails.account_number,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update store settings");
      }

      toast({
        title: "Settings saved",
        description: "Your store settings have been updated.",
      });
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      toast({
        title: "Save failed",
        description: error.message || "Could not update your store settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setVendorDetails((prev) => ({ ...prev, [field]: value }));
  };

  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  const handleLogoSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["jpeg", "jpg", "png", "webp", "avif"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Logo must be one of: jpeg, jpg, png, webp, avif.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setSelectedLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !user?.id) {
      return;
    }

    const allowedExtensions = ["jpeg", "jpg", "png", "webp", "avif"];
    const extension = selectedLogoFile.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Logo must be one of: jpeg, jpg, png, webp, avif.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("store_logo", selectedLogoFile);

    try {
      setUploadingLogo(true);
      const response = await fetch(`${API_URL}/vendors/profile/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload logo");
      }

      setVendorDetails((prev) => ({ ...prev, store_logo: data.store_logo }));
      if (user) {
        updateUser({
          avatar: data.store_logo,
          store_logo: data.store_logo,
        });
      }
      setSelectedLogoFile(null);
      setLogoPreviewUrl("");
      toast({
        title: "Logo updated",
        description: "Your store logo has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Logo upload failed",
        description: error.message || "Could not upload your store logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
        Store Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border border-border shadow-sm mb-4">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Store Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="">
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <input
                  id="store-logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelection}
                />
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("store-logo-input")?.click()
                    }
                    className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedLogoFile
                        ? `Selected: ${selectedLogoFile.name}`
                        : vendorDetails.store_logo
                          ? "Choose new logo"
                          : "Upload new logo"}
                    </p>
                  </button>
                  {selectedLogoFile && (
                    <>
                      <div className="flex justify-center">
                        <img
                          src={logoPreviewUrl}
                          alt="Selected logo preview"
                          className=" rounded-lg object-cover border border-border"
                          style={{ width: "300px", height: "250px" }}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleLogoUpload}
                        className="w-full"
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo
                          ? "Uploading..."
                          : "Upload selected logo"}
                      </Button>
                    </>
                  )}
                </div>
                {vendorDetails.store_logo && (
                  <div className="mt-3">
                    <img
                      src={`${BACKEND_URL}/uploads/logos/${vendorDetails.store_logo}`}
                      alt="Store logo"
                      className="h-20 w-20 rounded-lg object-cover border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={vendorDetails.store_name}
                onChange={(e) => updateField("store_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Textarea
                value={vendorDetails.store_description}
                onChange={(e) =>
                  updateField("store_description", e.target.value)
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Courier</Label>

              <Select
                value={
                  vendorDetails.default_courier
                    ? String(vendorDetails.default_courier)
                    : vendorDetails.courier?.id
                      ? String(vendorDetails.courier.id)
                      : ""
                }
                onValueChange={(value) =>
                  updateField("default_courier", Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a default courier" />
                </SelectTrigger>

                <SelectContent>
                  {couriers.map((courier) => (
                    <SelectItem key={courier.id} value={String(courier.id)}>
                      {courier.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              {categories.length > 0 && (
                <Select
                  value={vendorDetails.category || undefined}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm mb-4">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={vendorDetails.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={vendorDetails.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={vendorDetails.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={vendorDetails.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={vendorDetails.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={vendorDetails.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm mb-4">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={vendorDetails.bank_name}
                onChange={(e) => updateField("bank_name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  value={vendorDetails.account_name}
                  onChange={(e) => updateField("account_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={vendorDetails.account_number}
                  onChange={(e) =>
                    updateField("account_number", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default VendorStoreSettings;
