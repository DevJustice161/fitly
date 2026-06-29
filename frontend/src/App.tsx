import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext.tsx";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import NotFound from "./pages/NotFound.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import OrdersPage from "./pages/dashboard/OrdersPage";
import WishlistPage from "./pages/dashboard/WishlistPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import VouchersPage from "./pages/dashboard/VouchersPage";
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import RecentlyViewedPage from "./pages/dashboard/RecentlyViewedPage";
import OrderTrackingPage from "./pages/dashboard/OrderTrackingPage";
import AboutPage from "./pages/AboutPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";

// Vendor pages
import VendorApplication from "./pages/vendor/VendorApplication";
import VendorDashboardLayout from "./components/vendor/VendorDashboardLayout";
import VendorDashboardOverview from "./pages/vendor/VendorDashboardOverview";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorAddProduct from "./pages/vendor/VendorAddProduct";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorCustomers from "./pages/vendor/VendorCustomers";
import VendorRevenue from "./pages/vendor/VendorRevenue";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorWithdrawals from "./pages/vendor/VendorWithdrawals";
import VendorStoreSettings from "./pages/vendor/VendorStoreSettings";
import VendorPremium from "./pages/vendor/VendorPremium";
import VendorMessages from "./pages/vendor/VendorMessages";
import VendorNotifications from "./pages/vendor/VendorNotifications";
import VendorStorePage from "./pages/vendor/VendorStorePage";

// Admin pages
import AdminDashboardLayout from "./components/admin/AdminDashboardLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminVendorApplications from "./pages/admin/AdminVendorApplications";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminCommission from "./pages/admin/AdminCommission";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RecentlyViewedProvider>
        <CartProvider>
          <WishlistProvider>
            <ReviewsProvider>
              <NotificationProvider>
                <MessagesProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route
                        path="/category/:slug"
                        element={<CategoryPage />}
                      />
                      <Route
                        path="/product/:slug"
                        element={<ProductDetail />}
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route
                        path="/payment-success"
                        element={<PaymentSuccess />}
                      />
                      <Route
                        path="/order-confirmation"
                        element={<OrderConfirmationPage />}
                      />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/store/:id" element={<VendorStorePage />} />
                      <Route
                        path="/vendor/apply"
                        element={<VendorApplication />}
                      />

                      {/* Customer Dashboard */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={["customer"]}>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<DashboardOverview />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route
                          path="orders/:id/track"
                          element={<OrderTrackingPage />}
                        />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="vouchers" element={<VouchersPage />} />
                        <Route path="reviews" element={<ReviewsPage />} />
                        <Route path="payments" element={<PaymentsPage />} />
                        <Route
                          path="notifications"
                          element={<NotificationsPage />}
                        />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route
                          path="recently-viewed"
                          element={<RecentlyViewedPage />}
                        />
                      </Route>

                      {/* Vendor Dashboard */}
                      <Route
                        path="/vendor"
                        element={
                          <ProtectedRoute allowedRoles={["vendor"]}>
                            <VendorDashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<VendorDashboardOverview />} />
                        <Route path="products" element={<VendorProducts />} />
                        <Route
                          path="products/add"
                          element={<VendorAddProduct />}
                        />
                        <Route path="orders" element={<VendorOrders />} />
                        <Route path="customers" element={<VendorCustomers />} />
                        <Route path="revenue" element={<VendorRevenue />} />
                        <Route path="analytics" element={<VendorAnalytics />} />
                        <Route
                          path="withdrawals"
                          element={<VendorWithdrawals />}
                        />
                        <Route
                          path="settings"
                          element={<VendorStoreSettings />}
                        />
                        <Route path="premium" element={<VendorPremium />} />
                        <Route path="messages" element={<VendorMessages />} />
                        <Route
                          path="notifications"
                          element={<VendorNotifications />}
                        />
                      </Route>

                      {/* Admin Dashboard */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminOverview />} />
                        <Route
                          path="applications"
                          element={<AdminVendorApplications />}
                        />
                        <Route path="vendors" element={<AdminVendors />} />
                        <Route
                          path="withdrawals"
                          element={<AdminWithdrawals />}
                        />
                        <Route
                          path="commission"
                          element={<AdminCommission />}
                        />
                        <Route path="revenue" element={<AdminRevenue />} />
                        <Route
                          path="notifications"
                          element={<AdminNotifications />}
                        />
                        <Route path="settings" element={<AdminSettings />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </MessagesProvider>
              </NotificationProvider>
            </ReviewsProvider>
          </WishlistProvider>
        </CartProvider>
      </RecentlyViewedProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
