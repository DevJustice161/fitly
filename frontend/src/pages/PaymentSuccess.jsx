import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const { clearCart } = useCart();
  const { user, token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.BACKEND_URL;

  const verifyPayment = async () => {
    try {
      const transaction_id = params.get("transaction_id");
      const provider = params.get("provider");

      const tx_ref = params.get("tx_ref");
      const reference = params.get("reference");
      if (provider === "flutterwave" && transaction_id) {
        const response = await fetch(
          `${API_URL}/payments/flutterwave/verify?transaction_id=${transaction_id}&tx_ref=${tx_ref}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error("Payment verification failed");
        }
      }

      if (provider === "paystack" && reference) {
        const response = await fetch(
          `${API_URL}/payments/paystack/verify?reference=${reference}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error("Payment verification failed");
        }
      }
      navigate(`/order-confirmation?orderId=${tx_ref || reference}`, {
        state: tx_ref || reference,
      });
    } catch (error) {
      console.error(error);

      toast.error("Payment verification failed");
    }
  };

  useEffect(() => {
    verifyPayment();
    clearCart();
    toast.success("Payment Successful");
  }, [user]);

  return <div className="p-10 text-center">Verifying payment...</div>;
};

export default PaymentSuccess;
