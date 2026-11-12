import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressService";
import "../assets/addresses.css";

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

export default function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddress);

  const [savingAddress, setSavingAddress] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      setError("");

      const data = await getAddresses();

      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Address loading error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to load your addresses."
      );
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

  function handleAddAddress() {
    setEditingAddressId(null);
    setAddressForm({ ...initialAddress });
    setShowAddressForm(true);
    setError("");
    setSuccess("");
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

  function handleCancelForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({ ...initialAddress });
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
              return {
                ...address,
                defaultAddress: false,
              };
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
              ? {
                  ...address,
                  defaultAddress: false,
                }
              : address
          ),
          createdAddress,
        ]);

        setSuccess("Address added successfully.");
      }

      setAddressForm({ ...initialAddress });
      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (err) {
      console.error("Save address error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to save your address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(addressId) {
    const confirmed = window.confirm(
      "Do you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAddress(addressId);

      setAddresses((current) =>
        current.filter(
          (address) => address.addressId !== addressId
        )
      );

      setSuccess("Address deleted successfully.");
    } catch (err) {
      console.error("Delete address error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to delete this address."
      );
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

      setError(
        err.message || "Unable to update default address."
      );
    }
  }

  if (loading) {
    return (
      <main className="addresses-page">
        <div className="addresses-container">
          <div className="addresses-loading">
            <span className="loading-mark">aún.</span>
            <p>Loading your addresses...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="addresses-page">
      <div className="addresses-container">

        {/* HEADER */}
        <header className="addresses-header">
          <div className="addresses-header-content">
            <Link
              to="/account"
              className="back-account-link"
            >
              ← Back to Account
            </Link>

            <p className="addresses-eyebrow">
              DELIVERY
            </p>

            <h1>My Addresses</h1>

            <p className="addresses-subtitle">
              Manage the addresses you use for your orders.
            </p>
          </div>

          {!showAddressForm && (
            <button
              type="button"
              className="add-address-button"
              onClick={handleAddAddress}
            >
              <span>+ ADD ADDRESS</span>
            </button>
          )}
        </header>


        {/* MESSAGES */}
        {error && (
          <div className="addresses-message error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="addresses-message success">
            <span>{success}</span>
          </div>
        )}


        {/* FORM */}
        {showAddressForm && (
          <section className="address-form-section">
            <div className="address-form-header">
              <div>
                <p className="address-form-eyebrow">
                  {editingAddressId !== null
                    ? "EDIT ADDRESS"
                    : "NEW ADDRESS"}
                </p>

                <h2>
                  {editingAddressId !== null
                    ? "Edit delivery address"
                    : "Add delivery address"}
                </h2>
              </div>

              <button
                type="button"
                className="cancel-form-button"
                onClick={handleCancelForm}
              >
                CANCEL
              </button>
            </div>

            <form
              className="account-address-form"
              onSubmit={handleSaveAddress}
            >
              <label>
                Full name *
                <input
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={handleAddressInput}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Phone number *
                <input
                  name="phoneNumber"
                  type="tel"
                  value={addressForm.phoneNumber}
                  onChange={handleAddressInput}
                  pattern="[0-9]{10,15}"
                  maxLength={15}
                  title="Enter 10 to 15 digits."
                  required
                />
              </label>

              <label className="field-full">
                Address line 1 *
                <input
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={handleAddressInput}
                  maxLength={255}
                  required
                />
              </label>

              <label className="field-full">
                Address line 2
                <input
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={handleAddressInput}
                  maxLength={255}
                />
              </label>

              <label className="field-full">
                Landmark
                <input
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={handleAddressInput}
                  maxLength={100}
                />
              </label>

              <label>
                City *
                <input
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressInput}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                State *
                <input
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressInput}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Pincode *
                <input
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressInput}
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
                  value={addressForm.country}
                  onChange={handleAddressInput}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Address type *
                <select
                  name="addressType"
                  value={addressForm.addressType}
                  onChange={handleAddressInput}
                  required
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="default-address-option">
                <input
                  type="checkbox"
                  name="defaultAddress"
                  checked={addressForm.defaultAddress}
                  onChange={handleAddressInput}
                />

                <span>Set as default address</span>
              </label>

              <div className="address-form-actions">
                <button
                  type="button"
                  className="secondary-address-button"
                  onClick={handleCancelForm}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="save-address-button"
                  disabled={savingAddress}
                >
                  {savingAddress
                    ? "SAVING..."
                    : editingAddressId !== null
                      ? "UPDATE ADDRESS"
                      : "SAVE ADDRESS"}
                </button>
              </div>
            </form>
          </section>
        )}


        {/* SAVED ADDRESSES */}
        <section className="saved-addresses-section">
          <div className="saved-addresses-heading">
            <div>
              <p className="addresses-eyebrow">
                SAVED ADDRESSES
              </p>

              <h2>
                {addresses.length === 1
                  ? "Your address"
                  : "Your addresses"}
              </h2>
            </div>

            <span>
              {addresses.length}{" "}
              {addresses.length === 1
                ? "ADDRESS"
                : "ADDRESSES"}
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="empty-addresses">
              <div className="empty-address-mark">
                aún.
              </div>

              <h3>
                No saved addresses yet.
              </h3>

              <p>
                Add an address to make your checkout
                experience faster.
              </p>

              {!showAddressForm && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                >
                  ADD YOUR FIRST ADDRESS ↗
                </button>
              )}
            </div>
          ) : (
            <div className="address-list">
              {addresses.map((address, index) => (
                <article
                  className="saved-address-card"
                  key={address.addressId}
                >
                  <div className="saved-address-top">
                    <div className="address-badges">
                      <span className="address-type-badge">
                        {address.addressType || "HOME"}
                      </span>

                      {address.defaultAddress && (
                        <span className="default-badge">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <span className="address-number">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="saved-address-content">
                    <h3>
                      {address.fullName}
                    </h3>

                    <p className="address-phone">
                      {address.phoneNumber}
                    </p>

                    <div className="address-location">
                      <p>
                        {address.addressLine1}
                      </p>

                      {address.addressLine2 && (
                        <p>
                          {address.addressLine2}
                        </p>
                      )}

                      {address.landmark && (
                        <p>
                          Landmark: {address.landmark}
                        </p>
                      )}

                      <p>
                        {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <p>
                        {address.country}
                      </p>
                    </div>
                  </div>

                  <div className="saved-address-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditAddress(address)
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
                      className="delete-address-button"
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
              ))}
            </div>
          )}
        </section>


        {/* FOOTER */}
        <footer className="addresses-footer">
          <Link
            to="/home"
            className="addresses-footer-logo"
          >
            aún<span>.</span>
          </Link>

          <p>
            MADE FOR EVERY VERSION OF YOU.
          </p>
        </footer>

      </div>
    </main>
  );
}
