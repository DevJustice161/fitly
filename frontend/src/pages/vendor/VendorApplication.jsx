import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Store,
  User,
  Building2,
  CreditCard,
  CheckCircle,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext.jsx";

const storeCategories = [
  "Men's fashion",
  "Women's fashion",
  "Shoes",
  "Bags",
  "Accessories",
  "Beauty products",
];

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const VendorApplication = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLogo, setStoreLogo] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [cac, setCac] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [agreed, setAgreed] = useState(false);

  const totalSteps = 4;

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Validation;
    if (
      !storeName ||
      !storeDescription ||
      !city ||
      !state ||
      !businessAddress ||
      !bankName ||
      !accountName ||
      !accountNumber ||
      !cac ||
      !governmentId
    ) {
      toast.info("Please fill in all required fields before submitting.");

      return;
    }
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    if (storeLogo && storeLogo.size > MAX_FILE_SIZE) {
      toast.error("Business logo must be less than 20MB");

      return;
    }

    if (governmentId && governmentId.size > MAX_FILE_SIZE) {
      toast.error("Government ID must be less than 20MB");

      return;
    }

    try {
      // Create FormData
      const formData = new FormData();

      // Text fields
      formData.append("user_id", user.id);

      formData.append("full_name", fullName);

      formData.append("email", email);

      formData.append("phone", phone);

      formData.append("store_name", storeName);

      formData.append("store_description", storeDescription);

      formData.append("city", city);

      formData.append("country", "Nigeria");

      formData.append("state", state);

      formData.append("business_address", businessAddress);

      formData.append("bank_name", bankName);

      formData.append("account_name", accountName);

      formData.append("account_number", accountNumber);

      // File uploads
      if (storeLogo) {
        formData.append("store_logo", storeLogo);
      }

      if (governmentId) {
        formData.append("government_id", governmentId);
      }

      if (cac) {
        formData.append("cac", cac);
      }

      // Send request
      const response = await fetch("http://localhost:5000/api/vendors/apply", {
        method: "POST",

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to submit application");

        return;
      }

      toast.success("Vendor application submitted successfully");

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting application:", err);

      toast.error(
        "There was an error submitting your application. Please try again.",
      );
    }
  };
  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-padding py-12 md:py-20">
          <div className="max-w-lg mx-auto text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
              Application Submitted!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your vendor application is under review.
            </p>
            <p className="text-muted-foreground mb-8">
              You will be notified once approved. This usually takes 1–3
              business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="section-padding py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Start Selling on Fitly.ng
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your vendor application to begin selling
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            {[
              { num: 1, label: "Personal", icon: User },
              { num: 2, label: "Store", icon: Store },
              { num: 3, label: "Business", icon: Building2 },
              { num: 4, label: "Payment", icon: CreditCard },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex flex-col items-center`}>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                    {s.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${step > s.num ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} enctype="multipart/form-data">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        value={email}
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={phone}
                      type="tel"
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next: Store Information
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Store Info */}
            {step === 2 && (
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Your store name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Store Description</Label>
                    <Textarea
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Describe your store and products..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Store Logo</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="store_logo"
                          className="hidden"
                          id="logo-upload"
                          onChange={(e) => setStoreLogo(e.target.files[0])}
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Upload logo
                          </p>
                        </label>
                        <img
                          src={
                            storeLogo
                              ? URL.createObjectURL(storeLogo)
                              : undefined
                          }
                          className="mx-auto w-full h-30 object-contain"
                        />
                        {/* <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" /> */}
                        {/* <p className="text-sm text-muted-foreground">
                          Upload logo
                        </p> */}
                      </div>
                    </div>
                    {/* <div className="space-y-2">
                      <Label>Store Banner</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload banner
                        </p>
                      </div>
                    </div> */}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next: Business Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Business Info */}
            {step === 3 && (
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Input
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value="Nigeria" disabled />
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground mb-3">
                      Mandatory Verification
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Government ID</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="file"
                            name="government_id"
                            className="hidden"
                            id="id-upload"
                            onChange={(e) => setGovernmentId(e.target.files[0])}
                          />
                          <label htmlFor="id-upload" className="cursor-pointer">
                            <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Upload ID
                            </p>
                          </label>
                          <img
                            src={
                              governmentId
                                ? URL.createObjectURL(governmentId)
                                : undefined
                            }
                            className="mx-auto w-full h-30 object-contain mt-2"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Business Reg. Number (CAC)</Label>
                        <Input
                          value={cac}
                          onChange={(e) => setCac(e.target.value)}
                          placeholder="Mandatory"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next: Payment Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment + Agreement */}
            {step === 4 && (
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., GTBank"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="0123456789"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreed}
                        onCheckedChange={setAgreed}
                        className="mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        I agree to Fitly.ng vendor terms and commission policy.
                        I understand that a 10% commission will be deducted from
                        each sale.
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(3)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!agreed}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Submit Vendor Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorApplication;
