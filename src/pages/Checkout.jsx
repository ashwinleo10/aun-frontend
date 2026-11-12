import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressService";
import {
  placeOrder,
  createOnlinePayment,
  verifyOnlinePayment,
} from "../services/orderService";
import "../assets/checkout.css";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

const initialAddress = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: "HOME",
  defaultAddress: false,
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCheckoutData();
  }, []);

  async function loadCheckoutData() {
    try {
      setLoading(true);
      setError("");

      const [addressData, cartData] = await Promise.all([
        getAddresses(),
        getCart(),
      ]);

      const savedAddresses = Array.isArray(addressData)
        ? addressData
        : [];

      setAddresses(savedAddresses);
      setCart(cartData);

      const defaultAddress = savedAddresses.find(
        (address) => address.defaultAddress
      );

      setSelectedAddressId(
        defaultAddress?.addressId ||
          savedAddresses[0]?.addressId ||
          null
      );

      if (savedAddresses.length === 0) {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error("Checkout loading error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to load checkout details.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddressInput(event) {
    const { name, value, type, checked } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEditAddress(address) {
    setEditingAddressId(address.addressId);

    setAddressForm({
      fullName: address.fullName || "",
      phoneNumber: address.phoneNumber || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      addressType: address.addressType || "HOME",
      defaultAddress: Boolean(address.defaultAddress),
    });

    setShowAddressForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancelAddressForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(initialAddress);
    setError("");
  }

  async function handleSaveAddress(event) {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setError("");
      setSuccess("");

      if (editingAddressId !== null) {
        const updatedAddress = await updateAddress(
          editingAddressId,
          addressForm
        );

        setAddresses((current) =>
          current.map((address) => {
            if (address.addressId === editingAddressId) {
              return updatedAddress;
            }

            if (addressForm.defaultAddress) {
              return { ...address, defaultAddress: false };
            }

            return address;
          })
        );

        setSuccess("Address updated successfully.");
      } else {
        const createdAddress = await addAddress(addressForm);

        setAddresses((current) => [
          ...current.map((address) =>
            addressForm.defaultAddress
              ? { ...address, defaultAddress: false }
              : address
          ),
          createdAddress,
        ]);

        setSelectedAddressId(createdAddress.addressId);
        setSuccess("Your delivery address has been saved.");
      }

      setAddressForm(initialAddress);
      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (err) {
      console.error("Save address error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to save your address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm("Do you want to delete this address?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAddress(addressId);

      const remainingAddresses = addresses.filter(
        (address) => address.addressId !== addressId
      );

      setAddresses(remainingAddresses);

      if (selectedAddressId === addressId) {
        const nextAddress =
          remainingAddresses.find((address) => address.defaultAddress) ||
          remainingAddresses[0];

        setSelectedAddressId(nextAddress?.addressId || null);
      }

      if (editingAddressId === addressId) {
        handleCancelAddressForm();
      }

      setSuccess("Address deleted successfully.");
    } catch (err) {
      console.error("Delete address error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to delete this address.");
    }
  }

  async function handleSetDefault(addressId) {
    try {
      setError("");
      setSuccess("");

      const updatedAddress = await setDefaultAddress(addressId);

      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          defaultAddress:
            address.addressId === updatedAddress.addressId,
        }))
      );

      setSuccess("Default address updated.");
    } catch (err) {
      console.error("Default address error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to update default address.");
    }
  }

  async function handleOnlinePayment() {
    setPlacingOrder(true);
    setError("");
    setSuccess("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Check your internet connection."
        );
      }

      // Step 1: Create a pending order through Spring Boot.
      const paymentData = await createOnlinePayment(
        selectedAddressId
      );

      const keyId =
        paymentData.keyId || paymentData.razorpayKeyId;

      const razorpayOrderId =
        paymentData.razorpayOrderId;

      if (
        !keyId ||
        !razorpayOrderId ||
        !paymentData.orderId ||
        !paymentData.amount
      ) {
        throw new Error(
          "Payment order details are incomplete. Check the backend response."
        );
      }

      // Step 2: Configure Razorpay Checkout.
      const options = {
        key: keyId,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "aún",
        description: "Order payment",
        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            setError("");
            setPlacingOrder(true);

            // Step 3: Verify payment with the backend.
            const verifiedOrder =
              await verifyOnlinePayment({
                orderId: paymentData.orderId,
                razorpayOrderId:
                  response.razorpay_order_id,
                razorpayPaymentId:
                  response.razorpay_payment_id,
                razorpaySignature:
                  response.razorpay_signature,
              });

            // Show confirmation only after backend verification.
            setPlacedOrder(verifiedOrder);
          } catch (err) {
            console.error(
              "Payment verification error:",
              err
            );

            if (err.status === 401) {
              navigate("/login");
              return;
            }

            setError(
              err.message ||
                "Payment verification failed. Please check your order status."
            );
          } finally {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPlacingOrder(false);

            setError(
              "Payment window closed. Your payment may still be pending. Check your order status before retrying."
            );
          },
        },

        theme: {
          color: "#171717",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          setPlacingOrder(false);

          setError(
            response.error?.description ||
              "Payment failed. You can try again."
          );
        }
      );

      setPlacingOrder(false);
      razorpay.open();
    } catch (err) {
      console.error(
        "Online payment error:",
        err
      );

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message ||
          "Unable to start online payment."
      );

      setPlacingOrder(false);
    }
  }

  async function handleContinue() {
    if (!selectedAddressId) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (placingOrder) {
      return;
    }

    setError("");
    setSuccess("");

    if (paymentMethod === "ONLINE") {
      await handleOnlinePayment();
      return;
    }

    try {
      setPlacingOrder(true);

      const order = await placeOrder(
        selectedAddressId,
        "COD"
      );

      setPlacedOrder(order);
    } catch (err) {
      console.error(
        "COD order placement error:",
        err
      );

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="checkout-status">
        Loading checkout...
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="checkout-status">
        <h2>Unable to load checkout</h2>
        <p>{error}</p>

        <button
          type="button"
          onClick={loadCheckoutData}
        >
          TRY AGAIN
        </button>

        <Link to="/cart">
          Return to bag
        </Link>
      </div>
    );
  }

  // Successful order confirmation
  if (placedOrder) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <Link
            to="/home"
            className="checkout-logo"
          >
            aún<span>.</span>
          </Link>
        </header>

        <section className="checkout-confirmation">
          <div className="confirmation-icon">
            ✓
          </div>

          <span className="checkout-eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank you for your order.
          </h1>

          <p className="confirmation-message">
            Your order has been placed successfully.
            We'll prepare your items for delivery.
          </p>

          <div className="confirmation-details">
            <div className="confirmation-detail-row">
              <span>Order ID</span>
              <strong>
                #{placedOrder.orderId}
              </strong>
            </div>

            <div className="confirmation-detail-row">
              <span>Order status</span>
              <strong>
                {placedOrder.orderStatus}
              </strong>
            </div>

            <div className="confirmation-detail-row">
              <span>Payment method</span>
              <strong>
                {placedOrder.paymentMethod}
              </strong>
            </div>

            <div className="confirmation-detail-row">
              <span>Payment status</span>
              <strong>
                {placedOrder.paymentStatus}
              </strong>
            </div>

            <div className="confirmation-detail-row confirmation-total-row">
              <span>Total amount</span>
              <strong>
                {formatPrice(
                  placedOrder.totalAmount
                )}
              </strong>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link
              to={`/orders/${placedOrder.orderId}`}
              className="confirmation-secondary-link"
            >
              VIEW ORDER
            </Link>

            <Link
              to="/home"
              className="checkout-primary-link"
            >
              CONTINUE SHOPPING ↗
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <Link
            to="/home"
            className="checkout-logo"
          >
            aún<span>.</span>
          </Link>
        </header>

        <div className="checkout-empty">
          <h1>Your bag is empty.</h1>

          <p>
            Add something to your bag before
            proceeding to checkout.
          </p>

          <Link
            to="/home"
            className="checkout-primary-link"
          >
            EXPLORE COLLECTION ↗
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link
          to="/home"
          className="checkout-logo"
        >
          aún<span>.</span>
        </Link>

        <Link
          to="/cart"
          className="checkout-back-link"
        >
          ← Back to bag
        </Link>
      </header>

      <section className="checkout-content">
        <div className="checkout-heading">
          <span className="checkout-eyebrow">
            ALMOST YOURS
          </span>

          <h1>Checkout</h1>

          <p>
            Complete your delivery details to continue.
          </p>
        </div>

        {error && (
          <p
            className="checkout-message checkout-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="checkout-message checkout-success"
            role="status"
          >
            {success}
          </p>
        )}

        <div className="checkout-layout">
          <section className="address-section">
            <div className="checkout-section-heading">
              <div>
                <span>01</span>
                <h2>
                  Delivery address
                </h2>
              </div>

              {!showAddressForm && (
                <button
                  type="button"
                  className="add-address-toggle"
                  onClick={() => {
                    setAddressForm(
                      initialAddress
                    );
                    setEditingAddressId(null);
                    setShowAddressForm(
                      true
                    );
                    setError("");
                    setSuccess("");
                  }}
                >
                  + ADD NEW ADDRESS
                </button>
              )}
            </div>

            {addresses.length > 0 && (
              <div className="saved-addresses">
                {addresses.map(
                  (address) => (
                    <article
                      key={
                        address.addressId
                      }
                      className={
                        selectedAddressId ===
                        address.addressId
                          ? "address-card address-selected"
                          : "address-card"
                      }
                    >
                      <label className="address-card-main">
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={
                            address.addressId
                          }
                          checked={
                            selectedAddressId ===
                            address.addressId
                          }
                          onChange={() =>
                            setSelectedAddressId(
                              address.addressId
                            )
                          }
                        />

                        <div className="address-details">
                          <div className="address-name-row">
                            <strong>
                              {
                                address.fullName
                              }
                            </strong>

                            <span className="address-type">
                              {
                                address.addressType
                              }
                            </span>

                            {address.defaultAddress && (
                              <span className="default-address-label">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <p>
                            {
                              address.phoneNumber
                            }
                          </p>

                          <p>
                            {
                              address.addressLine1
                            }
                          </p>

                          {address.addressLine2 && (
                            <p>
                              {
                                address.addressLine2
                              }
                            </p>
                          )}

                          {address.landmark && (
                            <p>
                              Landmark:{" "}
                              {
                                address.landmark
                              }
                            </p>
                          )}

                          <p>
                            {
                              address.city
                            }
                            ,{" "}
                            {
                              address.state
                            }{" "}
                            -{" "}
                            {
                              address.pincode
                            }
                          </p>

                          <p>
                            {
                              address.country
                            }
                          </p>
                        </div>
                      </label>

                      <div className="address-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditAddress(
                              address
                            )
                          }
                        >
                          EDIT
                        </button>

                        {!address.defaultAddress && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefault(
                                address.addressId
                              )
                            }
                          >
                            SET AS DEFAULT
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAddress(
                              address.addressId
                            )
                          }
                        >
                          DELETE
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}

            {showAddressForm && (
              <form
                className="address-form"
                onSubmit={
                  handleSaveAddress
                }
              >
                <div className="address-form-heading">
                  <h3>
                    {editingAddressId !==
                    null
                      ? "Edit delivery address"
                      : "Add delivery address"}
                  </h3>

                  <button
                    type="button"
                    onClick={
                      handleCancelAddressForm
                    }
                  >
                    CANCEL
                  </button>
                </div>

                <div className="address-form-grid">
                  <label>
                    Full name *
                    <input
                      name="fullName"
                      value={
                        addressForm.fullName
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    Phone number *
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={
                        addressForm.phoneNumber
                      }
                      onChange={
                        handleAddressInput
                      }
                      pattern="[0-9]{10,15}"
                      maxLength={15}
                      title="Enter 10 to 15 digits."
                      required
                    />
                  </label>

                  <label className="address-field-full">
                    Address line 1 *
                    <input
                      name="addressLine1"
                      value={
                        addressForm.addressLine1
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="address-field-full">
                    Address line 2
                    <input
                      name="addressLine2"
                      value={
                        addressForm.addressLine2
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={255}
                    />
                  </label>

                  <label className="address-field-full">
                    Landmark
                    <input
                      name="landmark"
                      value={
                        addressForm.landmark
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={100}
                    />
                  </label>

                  <label>
                    City *
                    <input
                      name="city"
                      value={
                        addressForm.city
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    State *
                    <input
                      name="state"
                      value={
                        addressForm.state
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    Pincode *
                    <input
                      name="pincode"
                      value={
                        addressForm.pincode
                      }
                      onChange={
                        handleAddressInput
                      }
                      pattern="[0-9]{4,10}"
                      maxLength={10}
                      title="Enter 4 to 10 digits."
                      required
                    />
                  </label>

                  <label>
                    Country *
                    <input
                      name="country"
                      value={
                        addressForm.country
                      }
                      onChange={
                        handleAddressInput
                      }
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    Address type *
                    <select
                      name="addressType"
                      value={
                        addressForm.addressType
                      }
                      onChange={
                        handleAddressInput
                      }
                      required
                    >
                      <option value="HOME">
                        Home
                      </option>
                      <option value="WORK">
                        Work
                      </option>
                      <option value="OTHER">
                        Other
                      </option>
                    </select>
                  </label>

                  <label className="default-address-checkbox">
                    <input
                      type="checkbox"
                      name="defaultAddress"
                      checked={
                        addressForm.defaultAddress
                      }
                      onChange={
                        handleAddressInput
                      }
                    />

                    Set as default address
                  </label>
                </div>

                <button
                  type="submit"
                  className="save-address-button"
                  disabled={
                    savingAddress
                  }
                >
                  {savingAddress
                    ? "SAVING..."
                    : editingAddressId !==
                      null
                    ? "UPDATE ADDRESS"
                    : "SAVE ADDRESS"}
                </button>
              </form>
            )}

            {!showAddressForm &&
              addresses.length === 0 && (
                <p className="no-address-message">
                  Please add a delivery address
                  to continue.
                </p>
              )}

            <div className="checkout-section-heading payment-heading">
              <div>
                <span>02</span>
                <h2>
                  Payment method
                </h2>
              </div>
            </div>

            <div className="payment-methods">
              <label
                className={
                  paymentMethod ===
                  "COD"
                    ? "payment-option payment-option-selected"
                    : "payment-option"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={
                    paymentMethod ===
                    "COD"
                  }
                  onChange={() => {
                    setPaymentMethod(
                      "COD"
                    );
                    setError("");
                  }}
                />

                <span className="payment-option-content">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order
                    arrives at your
                    doorstep.
                  </span>
                </span>

                <strong className="payment-option-code">
                  COD
                </strong>
              </label>

              <label
                className={
                  paymentMethod ===
                  "ONLINE"
                    ? "payment-option payment-option-selected"
                    : "payment-option"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={
                    paymentMethod ===
                    "ONLINE"
                  }
                  onChange={() => {
                    setPaymentMethod(
                      "ONLINE"
                    );
                    setError("");
                  }}
                />

                <span className="payment-option-content">
                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    Pay securely using
                    Razorpay.
                  </span>
                </span>

                <strong className="payment-option-code">
                  ONLINE
                </strong>
              </label>
            </div>
          </section>

          <aside className="checkout-summary">
            <span className="checkout-eyebrow">
              YOUR SELECTION
            </span>

            <h2>
              Order summary
            </h2>

            <div className="checkout-summary-items">
              {items.map(
                (item) => (
                  <div
                    className="checkout-summary-item"
                    key={
                      item.cartItemId
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.productName
                        }
                      </strong>

                      <p>
                        {
                          item.selectedSize
                        }{" "}
                        /{" "}
                        {
                          item.selectedColor
                        }{" "}
                        · Qty:{" "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <span>
                      {formatPrice(
                        item.subtotal
                      )}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="checkout-summary-line">
              <span>
                Total items
              </span>

              <span>
                {cart?.totalItems ||
                  0}
              </span>
            </div>

            <div className="checkout-summary-line">
              <span>
                Subtotal
              </span>

              <span>
                {formatPrice(
                  cart?.totalAmount
                )}
              </span>
            </div>

            <div className="checkout-summary-total">
              <strong>
                Total
              </strong>

              <strong>
                {formatPrice(
                  cart?.totalAmount
                )}
              </strong>
            </div>

            <p className="checkout-summary-note">
              Shipping charges and applicable
              taxes will be calculated during
              checkout.
            </p>

            <button
              type="button"
              className="checkout-place-order-button"
              disabled={
                !selectedAddressId ||
                placingOrder
              }
              onClick={
                handleContinue
              }
            >
              {placingOrder
                ? "PROCESSING..."
                : paymentMethod ===
                  "COD"
                ? "PLACE COD ORDER ↗"
                : "PAY WITH RAZORPAY ↗"}
            </button>

            <Link
              to="/cart"
              className="checkout-edit-bag"
            >
              EDIT SHOPPING BAG
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
