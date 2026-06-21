import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const { clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transaction_id = params.get("transaction_id");
        const provider = params.get("provider");

        const tx_ref = params.get("tx_ref");

        // FLUTTERWAVE VERIFY
        if (provider === "flutterwave" && transaction_id) {
          const response = await fetch(
            `http://localhost:5000/api/payments/flutterwave/verify?transaction_id=${transaction_id}`,
          );

          const data = await response.json();

          if (!data.success) {
            throw new Error("Payment verification failed");
          }
        }

        // PAYSTACK VERIFY
        if (provider === "paystack" && tx_ref) {
          const response = await fetch(
            `http://localhost:5000/api/payments/paystack/verify?reference=${tx_ref}`,
          );

          const data = await response.json();

          if (!data.success) {
            throw new Error("Payment verification failed");
          }
        }

        await clearCart();

        toast.success("Payment successful");

        navigate(`/order-confirmation?orderId=${tx_ref}`, { state: tx_ref });
      } catch (error) {
        console.error(error);

        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, []);

  return <div className="p-10 text-center">Verifying payment...</div>;
};

export default PaymentSuccess;
