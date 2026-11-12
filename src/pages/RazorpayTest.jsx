
import { useState } from "react";

const API_BASE_URL = "http://localhost:8080";

export default function RazorpayTest() {
  const [addressId, setAddressId] = useState("3");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Create Razorpay order in our backend
      const response = await fetch(
        `${API_BASE_URL}/api/orders/online-payment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addressId: Number(addressId),
            paymentMethod: "ONLINE",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create payment order");
      }

      // Step 2: Load Razorpay Checkout script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout");
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: data.razorpayKeyId,
        amount: Math.round(Number(data.amount) * 100),
        currency: data.currency,
        name: "aún",
        description: "Clothing order payment",
        order_id: data.razorpayOrderId,

        handler: async function (paymentResponse) {
          try {
            setMessage("Verifying payment...");

            // Step 4: Verify payment with our backend
            const verifyResponse = await fetch(
              `${API_BASE_URL}/api/orders/verify-payment`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: data.orderId,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(result.message || "Payment verification failed");
            }

            setMessage(
              `Payment successful! Order ID: ${result.orderId}`
            );
          } catch (error) {
            setMessage(error.message);
          }
        },

        modal: {
          ondismiss: function () {
            setMessage(
              "Checkout closed. Check the backend order status before retrying."
            );
          },
        },

        theme: {
          color: "#111111",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setMessage(
          response.error.description || "Payment failed"
        );
      });

      razorpay.open();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.brand}>aún</h1>
        <p style={styles.subtitle}>Razorpay Payment Test</p>

        <label style={styles.label}>Shipping Address ID</label>

        <input
          type="number"
          min="1"
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handlePayment}
          disabled={loading || !addressId || Number(addressId) <= 0}
          style={styles.button}
        >
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.note}>
          Use Razorpay Test Mode credentials and test payment details only.
        </p>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#e9e9e9",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    background: "#ffffff",
    color: "#111111",
    border: "1px solid #d5d5d5",
  },
  brand: {
    fontSize: "42px",
    letterSpacing: "5px",
    textAlign: "center",
    margin: "0",
  },
  subtitle: {
    textAlign: "center",
    color: "#777777",
    marginBottom: "35px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    boxSizing: "border-box",
    border: "1px solid #cccccc",
    marginBottom: "20px",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
  },
  message: {
    marginTop: "20px",
    textAlign: "center",
    overflowWrap: "anywhere",
  },
  note: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#777777",
    textAlign: "center",
  },
};
