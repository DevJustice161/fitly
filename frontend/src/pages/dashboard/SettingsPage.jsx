import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Trash2,
  Bell,
  BellOff,
  Eye,
  EyeOff,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, setUser, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [city, setCity] = useState(user.city);
  const [country, setCountry] = useState(user.country);
  const [state, setState] = useState(user.state);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const API_URL = "http://localhost:5000/api/users";

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const response = await fetch(`${API_URL}/update/${user.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      console.log("Update user:", data.user);

      const updatedUser = {
        ...user,
        ...data.user,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.info("Your Profile has been updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }

      await fetch(`${API_URL}/update-password/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Password updated successfully.") {
            toast.success("Your password has been updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } else if (data.message === "Current password is incorrect.") {
            toast.error("Current password is incorrect.");
          } else {
            toast.error(data.message || "Failed to update password.");
          }
        })
        .catch((error) => {
          console.error("Error updating password:", error);
          toast.error("An error occurred while updating password.");
        });
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    try {
      setLoading(true);
      fetch(`${API_URL}/delete/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "User deleted successfully") {
            toast.success("Your account has been deleted.");
            // Perform logout or redirect to homepage
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          } else {
            toast.error(data.message || "Failed to delete account.");
          }
        })
        .catch((error) => {
          console.error("Error deleting account:", error);
          toast.error("An error occurred while deleting account.");
        });
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-4">
        Account Settings
      </h1>

      {/* Profile */}
      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarFallback className="bg-secondary text-secondary-foreground font-heading text-2xl">
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : user.avatar ? (
                    <img
                      src={`http://localhost:5000/uploads/avatars/${user.avatar}`}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="p-4 ml-2 border border-border rounded-md relative w-full">
            <input
              type="file"
              id="avatar-upload"
              className="hidden "
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className=" -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer mb-4"
            >
              <Camera className="h-3 w-3 ml-4" />{" "}
            </label>
            <span className="ml-2">Upload Avatar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                defaultValue={fullName}
                className="mt-1 border-border"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                defaultValue={email}
                className="mt-1 border-border"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input
                defaultValue={phone}
                className="mt-1 border-border"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Delivery Address
              </Label>
              <Input
                defaultValue={address}
                className="mt-1 border-border"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">City</Label>
              <Input
                defaultValue={city}
                className="mt-1 border-border"
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">State</Label>
              <Input
                defaultValue={state}
                className="mt-1 border-border"
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Country</Label>
              <Input
                defaultValue={country}
                className="mt-1 border-border"
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Change Password
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">
              Current Password
            </Label>

            <div className="relative mt-1">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border-border pr-10"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                New Password
              </Label>

              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-border pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Confirm Password
              </Label>

              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-full border-primary text-primary"
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Order Updates
              </p>
              <p className="text-xs text-muted-foreground">
                Get email notifications for order status changes
              </p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Promotions & Deals
              </p>
              <p className="text-xs text-muted-foreground">
                Receive promotional offers and discount alerts
              </p>
            </div>
            <Switch checked={promoNotifs} onCheckedChange={setPromoNotifs} />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-destructive/30 shadow-sm p-4 mb-4">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-destructive">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently remove your account and all data.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
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

export default SettingsPage;
