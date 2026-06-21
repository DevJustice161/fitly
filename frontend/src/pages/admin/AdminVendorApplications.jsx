import { useState } from "react";
import {
  Image,
  Map,
  Globe,
  IdCard,
  FileBadge,
  Tags,
  Building2,
  Landmark,
  User,
  CreditCard,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  Send,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
//import { vendorApplications } from "@/data/vendorData";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const AdminVendorApplications = () => {
  const API_URL = "http://localhost:5000/api";
  const { toast } = useToast();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewApp, setViewApp] = useState(null);
  const [requestApp, setRequestApp] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const filters = ["All", "Pending", "Approved", "Rejected"];
  const [previewImage, setPreviewImage] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/vendors/applications`);
      const data = await response.json();
      setApps(data);
    } catch (error) {
      toast({
        title: "Error fetching applications",
        description:
          "Unable to load vendor applications. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Fetch applications on component mount
  useState(() => {
    fetchApplications();
  }, []);

  // const updateStatus = (id, status) => {
  //   setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  //   toast({
  //     title: `Application ${status}`,
  //     description: `Vendor application has been ${status.toLowerCase()}.`,
  //   });
  // };

  const updateApprovedStatus = (id, status) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: status === "Pending" ? "Approved" : "Rejected" }
          : a,
      ),
    );
    toast({
      title: `Application ${status === "Pending" ? "Approved" : "Rejected"}`,
      description: `Vendor application has been ${status === "Pending" ? "approved" : "rejected"}.`,
    });
  };

  const updateRejectedStatus = (id, status) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: status === "Pending" ? "Approved" : "Rejected" }
          : a,
      ),
    );
    toast({
      title: `Application ${status === "Pending" ? "Rejected" : "Approved"}`,
      description: `Vendor application has been ${status === "Pending" ? "rejected" : "approved"}.`,
    });
  };

  const handleStatusApprove = async (id, status) => {
    try {
      await fetch(`${API_URL}/vendors/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      updateApprovedStatus(id, status);
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Unable to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusReject = async (id, status) => {
    try {
      await fetch(`${API_URL}/vendors/reject/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      updateRejectedStatus(id, status);
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Unable to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filtered = apps.filter((a) => {
    const matchSearch =
      a.store_name.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const sendRequestInfo = () => {
    if (!requestMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter what additional information you need.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Request sent",
      description: `Information request sent to ${requestApp.name}.`,
    });
    setRequestApp(null);
    setRequestMessage("");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Vendor Applications
      </h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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

      <div className="space-y-3">
        {filtered.map((app) => (
          <Card key={app.id} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {app.store_name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {app.name} • {app.email}
                  </p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{app.phone}</span>
                    <span>{app.city}</span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {app.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusApprove(app.id, app.status)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-destructive"
                        onClick={() => handleStatusReject(app.id, app.status)}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setRequestApp(app)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" /> Request Info
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setViewApp(app)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewApp} onOpenChange={(o) => !o && setViewApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Application Details
            </DialogTitle>
            <DialogDescription>
              Full vendor application information
            </DialogDescription>
          </DialogHeader>
          {viewApp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      {viewApp.store_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {viewApp.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[viewApp.status]}`}
                >
                  {viewApp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {viewApp.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {viewApp.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-10" /> {viewApp.store_description}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {viewApp.city}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>CAC</bold> {viewApp.cac}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> {viewApp.business_address}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>Bank Name</bold> {viewApp.bank_name}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>Account Name</bold> {viewApp.account_name}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>Account Number</bold> {viewApp.account_number}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                  <Calendar className="h-4 w-4" /> Applied on{" "}
                  {new Date(viewApp.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>Government ID</bold>
                  <img
                    src={`http://localhost:5000/uploads/ids/${viewApp.government_id}`}
                    alt="Government ID"
                    className="w-20 h-20 object-cover rounded cursor-pointer border"
                    onClick={() => setPreviewImage(viewApp.government_id)}
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <bold>Business Logo</bold>
                  <img
                    src={`http://localhost:5000/uploads/logos/${viewApp.store_logo}`}
                    alt="Business Logo"
                    className="h-20 w-20 object-cover rounded-md border"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 bg-secondary/30">
                <p className="text-xs font-medium text-foreground mb-1">
                  Application Note
                </p>
                <p className="text-xs text-muted-foreground">
                  Vendor has submitted required documents including business
                  registration, ID verification and store details. All
                  information appears valid and ready for review.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {viewApp?.status === "Pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    handleStatusReject(viewApp.id, viewApp.status);
                    setViewApp(null);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleStatusApprove(viewApp.id, viewApp.status);
                    setViewApp(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewApp(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog
        open={!!requestApp}
        onOpenChange={(o) => {
          if (!o) {
            setRequestApp(null);
            setRequestMessage("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Request Additional Info
            </DialogTitle>
            <DialogDescription>
              {requestApp &&
                `Send a message to ${requestApp.name} (${requestApp.email})`}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Please provide a clearer photo of your business registration document..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRequestApp(null);
                setRequestMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={sendRequestInfo}
              className="bg-primary text-primary-foreground"
            >
              <Send className="h-4 w-4 mr-1" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>

          {previewImage && (
            <img
              src={`http://localhost:5000/uploads/ids/${previewImage}`}
              alt="Preview"
              className="w-full h-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendorApplications;
