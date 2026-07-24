import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const VendorPaymentSuccess = () => {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const { user, token } = useAuth();

  const verifyPayment = async () => {
    try {
      const {
        transaction_id,
        provider,
        reference,
        purpose,
        vendorId,
        planId,
        billingCycle,
        autoRenew,
        status,
        amount,
        paymentMethod,
        tx_ref,
        startedAt,
        nextBillingAt,
        paymentReference,
      } = Object.fromEntries(params.entries());
      const premStatus = status == "completed" ? "active" : "pending";

      if (provider === "flutterwave" && transaction_id) {
        const response = await fetch(
          `http://localhost:5000/api/payments/flutterwave/premium/verify?transaction_id=${transaction_id}
          &tx_ref=${tx_ref}&vendorId=${vendorId}&startedAt=${startedAt}&nextBillingAt=${nextBillingAt}&
          paymentReference=${paymentReference}&planId=${planId}&billingCycle=${billingCycle}&
          status=${premStatus}&autoRenew=${autoRenew}&amount=${amount}&method=${paymentMethod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error("Payment verification failed");
        }
      }

      if (provider === "paystack" && reference) {
        const response = await fetch(
          `http://localhost:5000/api/payments/paystack/premium/verify?reference=${reference}
          &vendorId=${vendorId}&startedAt=${startedAt}&nextBillingAt=${nextBillingAt}&
          paymentReference=${paymentReference}&planId=${planId}&billingCycle=${billingCycle}&
          status='active'&autoRenew=${autoRenew}&amount=${amount}&method=${paymentMethod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error("Premium Payment verification failed");
        }
      }
      navigate(`/vendor/premium`);
    } catch (error) {
      console.error(error);

      toast.error("Premium Payment verification failed");
    }
  };

  useEffect(() => {
    verifyPayment();
    toast.success("Premium Payment Successful");
  }, [user]);

  return <div className="p-10 text-center">Verifying premium payment...</div>;
};

export default VendorPaymentSuccess;
