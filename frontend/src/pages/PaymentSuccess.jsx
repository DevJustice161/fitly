import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const { clearCart } = useCart();
  const { user } = useAuth();

  const verifyPayment = async () => {
    try {
      const transaction_id = params.get("transaction_id");
      const provider = params.get("provider");

      const tx_ref = params.get("tx_ref");
      const reference = params.get("reference");
      if (provider === "flutterwave" && transaction_id) {
        const response = await fetch(
          `http://localhost:5000/api/payments/flutterwave/verify?transaction_id=${transaction_id}&tx_ref=${tx_ref}`,
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error("Payment verification failed");
        }
      }

      if (provider === "paystack" && reference) {
        const response = await fetch(
          `http://localhost:5000/api/payments/paystack/verify?reference=${reference}`,
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
