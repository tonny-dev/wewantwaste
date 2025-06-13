import React, { useState, useEffect } from "react";

const Payment = ({ onPaymentComplete, bookingData = {}, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });
  const [saveCard, setSaveCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  // Add this right after your existing API_BASE_URL configuration
  const isDevelopment = process.env.NODE_ENV === "development";
  const isTestMode = STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_");

  // Add this useEffect for better error handling
  useEffect(() => {
    if (isDevelopment) {
      console.log("Payment component initialized in development mode");
      console.log("API URL:", API_BASE_URL);
      console.log("Stripe test mode:", isTestMode);
    }
  }, []);

  // Safe access to booking data with fallbacks
  const selectedSkip = bookingData.selectedSkip || { size: 5, price: 241 };
  const address = bookingData.address || {
    line1: "197 Ashby Road, Hinckley",
    postcode: "LE10 1SH",
  };
  const selectedDate =
    bookingData.selectedDate || new Date().toISOString().split("T")[0];
  const permitRequired = bookingData.permitRequired || false;

  // Calculate pricing
  const skipPrice = selectedSkip.price_before_vat || selectedSkip.price || 241;
  const permitFee = permitRequired ? 84 : 0;
  const subtotal = skipPrice + permitFee;
  const vat = Math.round(subtotal * 0.2);
  const total = subtotal + vat;

  // Initialize payment systems
  useEffect(() => {
    initializePaymentSystems();
  }, []);

  const initializePaymentSystems = async () => {
    try {
      // Ensure Stripe.js is loaded
      if (!window.Stripe) {
        console.log("Loading Stripe.js...");
        await loadStripeScript();
      }

      if (window.Stripe && STRIPE_PUBLISHABLE_KEY) {
        const stripeInstance = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        setStripe(stripeInstance);

        const elementsInstance = stripeInstance.elements({
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#3b82f6",
            },
          },
        });
        setElements(elementsInstance);

        if (isDevelopment) {
          console.log("Stripe initialized successfully");
        }
      } else {
        throw new Error("Stripe.js not loaded or publishable key missing");
      }

      // Initialize Google Pay (existing code remains the same)
      if (window.google && window.google.payments) {
        // ... your existing Google Pay code
      }
    } catch (error) {
      console.error("Payment system initialization error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          "Payment system initialization failed. Please refresh the page.",
      }));
    }
  };

  // Add this helper function
  const loadStripeScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleCardInputChange = (field, value) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleBillingAddressChange = (field, value) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? "/" + v.substring(2, 4) : "");
    }
    return v;
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, "");
    if (cleanNumber.match(/^4/)) return "visa";
    if (cleanNumber.match(/^5[1-5]/)) return "mastercard";
    if (cleanNumber.match(/^3[47]/)) return "amex";
    return "unknown";
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateExpiryDate = (expiry) => {
    const [month, year] = expiry.split("/");
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const cardMonth = parseInt(month);
    const cardYear = parseInt(year);

    if (cardMonth < 1 || cardMonth > 12) return false;
    if (cardYear < currentYear) return false;
    if (cardYear === currentYear && cardMonth < currentMonth) return false;

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === "card") {
      if (!cardDetails.number || !validateCardNumber(cardDetails.number)) {
        newErrors.number = "Please enter a valid card number";
      }
      if (!cardDetails.expiry || !validateExpiryDate(cardDetails.expiry)) {
        newErrors.expiry = "Please enter a valid expiry date";
      }
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        newErrors.cvc = "Please enter a valid CVC";
      }
      if (!cardDetails.name.trim()) {
        newErrors.name = "Please enter the cardholder name";
      }

      // Billing address validation
      if (!billingAddress.line1.trim()) {
        newErrors.billingLine1 = "Please enter your address";
      }
      if (!billingAddress.city.trim()) {
        newErrors.billingCity = "Please enter your city";
      }
      if (!billingAddress.postcode.trim()) {
        newErrors.billingPostcode = "Please enter your postcode";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total * 100, // Convert to pence
            currency: "gbp",
            booking_data: bookingData,
            billing_address: billingAddress,
            metadata: {
              skip_size: selectedSkip.size,
              delivery_address: `${address.line1}, ${address.postcode}`,
              delivery_date: selectedDate,
              permit_required: permitRequired.toString(),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to initialize payment. Please try again.");
    }
  };

  // const processCardPayment = async () => {
  //   if (!stripe) {
  //     throw new Error("Stripe not initialized");
  //   }

  //   // Create payment intent on backend
  //   const { client_secret } = await createPaymentIntent();

  //   // Confirm payment with Stripe
  //   const result = await stripe.confirmCardPayment(client_secret, {
  //     payment_method: {
  //       card: {
  //         number: cardDetails.number.replace(/\s/g, ""),
  //         exp_month: parseInt(cardDetails.expiry.split("/")[0]),
  //         exp_year: parseInt(`20${cardDetails.expiry.split("/")[1]}`),
  //         cvc: cardDetails.cvc,
  //       },
  //       billing_details: {
  //         name: cardDetails.name,
  //         address: {
  //           line1: billingAddress.line1,
  //           line2: billingAddress.line2,
  //           city: billingAddress.city,
  //           postal_code: billingAddress.postcode,
  //           country: billingAddress.country === "United Kingdom" ? "GB" : "KE",
  //         },
  //       },
  //     },
  //   });

  //   if (result.error) {
  //     throw new Error(result.error.message);
  //   }

  //   // Save card if requested
  //   if (saveCard && result.paymentIntent.payment_method) {
  //     try {
  //       await fetch(`${API_BASE_URL}/api/payments/save-payment-method`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           payment_method_id: result.paymentIntent.payment_method,
  //           customer_email: bookingData.customerEmail,
  //         }),
  //       });
  //     } catch (error) {
  //       console.warn("Failed to save payment method:", error);
  //     }
  //   }

  //   return result.paymentIntent;
  // };

  const processCardPayment = async () => {
    if (!stripe) {
      throw new Error("Stripe not initialized");
    }

    try {
      // Create payment intent on backend
      const { client_secret, payment_intent_id } = await createPaymentIntent();

      // Create payment method first
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: {
            number: cardDetails.number.replace(/\s/g, ""),
            exp_month: parseInt(cardDetails.expiry.split("/")[0]),
            exp_year: parseInt(`20${cardDetails.expiry.split("/")[1]}`),
            cvc: cardDetails.cvc,
          },
          billing_details: {
            name: cardDetails.name,
            address: {
              line1: billingAddress.line1,
              line2: billingAddress.line2 || null,
              city: billingAddress.city,
              postal_code: billingAddress.postcode,
              country:
                billingAddress.country === "United Kingdom"
                  ? "GB"
                  : billingAddress.country === "Kenya"
                    ? "KE"
                    : "GB",
            },
          },
        });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Confirm payment with the created payment method
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(client_secret, {
          payment_method: paymentMethod.id,
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Save card if requested
      if (saveCard && paymentMethod.id) {
        try {
          const saveResponse = await fetch(
            `${API_BASE_URL}/api/payments/save-payment-method`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                customer_email:
                  bookingData.customerEmail || "guest@example.com",
              }),
            },
          );

          if (!saveResponse.ok) {
            console.warn("Failed to save payment method");
          }
        } catch (error) {
          console.warn("Failed to save payment method:", error);
        }
      }

      return paymentIntent;
    } catch (error) {
      console.error("Card payment processing error:", error);
      throw error;
    }
  };

  // Add this test function to verify Stripe connection
  const testStripeConnection = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/stripe-status`,
      );
      const data = await response.json();
      console.log("Stripe connection status:", data);
      return data.success;
    } catch (error) {
      console.error("Stripe connection test failed:", error);
      return false;
    }
  };

  // Add this to your useEffect for initialization
  useEffect(() => {
    initializePaymentSystems();

    // Test Stripe connection in development
    if (process.env.NODE_ENV === "development") {
      testStripeConnection();
    }
  }, []);

  const processGooglePayPayment = async () => {
    if (!window.google || !window.google.payments) {
      throw new Error("Google Pay not available");
    }

    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment:
        process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
    });

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: [
              "AMEX",
              "DISCOVER",
              "JCB",
              "MASTERCARD",
              "VISA",
            ],
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "stripe",
              "stripe:version": "2020-08-27",
              "stripe:publishableKey": STRIPE_PUBLISHABLE_KEY,
            },
          },
        },
      ],
      merchantInfo: {
        merchantId:
          process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || "BCR2DN4TXZSQPJF7",
        merchantName: "Skip Hire Company",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPriceLabel: "Total",
        totalPrice: total.toString(),
        currencyCode: "GBP",
        countryCode: "GB",
      },
    };

    try {
      const paymentData =
        await paymentsClient.loadPaymentData(paymentDataRequest);

      // Create payment intent on backend
      const { client_secret } = await createPaymentIntent();

      // Confirm payment with Stripe using Google Pay token
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: {
            token: JSON.parse(
              paymentData.paymentMethodData.tokenizationData.token,
            ).id,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      if (error.statusCode === "CANCELED") {
        throw new Error("Payment cancelled by user");
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "card" && !validateForm()) {
      return;
    }

    setProcessing(true);
    setErrors({});

    try {
      let paymentResult;

      if (paymentMethod === "card") {
        paymentResult = await processCardPayment();
      } else if (paymentMethod === "googlepay") {
        paymentResult = await processGooglePayPayment();
      }

      // Create booking record on backend
      const bookingResponse = await fetch(
        `${API_BASE_URL}/api/bookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...bookingData,
            payment_intent_id: paymentResult.id,
            payment_status: paymentResult.status,
            total_amount: total,
            billing_address: paymentMethod === "card" ? billingAddress : null,
          }),
        },
      );

      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking record");
      }

      const booking = await bookingResponse.json();

      const paymentDetails = {
        method: paymentMethod,
        amount: total,
        cardLast4:
          paymentMethod === "card" ? cardDetails.number.slice(-4) : null,
        transactionId: paymentResult.id,
        processedAt: new Date().toISOString(),
        billingAddress: paymentMethod === "card" ? billingAddress : null,
        status: paymentResult.status,
        bookingId: booking.id,
      };

      if (onPaymentComplete) {
        onPaymentComplete(paymentDetails);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrors({
        general:
          error.message || "Payment processing failed. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = () => {
    if (paymentMethod === "googlepay") return googlePayReady;

    return (
      validateCardNumber(cardDetails.number) &&
      validateExpiryDate(cardDetails.expiry) &&
      cardDetails.cvc.length >= 3 &&
      cardDetails.name.length > 0 &&
      billingAddress.line1.trim().length > 0 &&
      billingAddress.city.trim().length > 0 &&
      billingAddress.postcode.trim().length > 0
    );
  };

  const cardType = detectCardType(cardDetails.number);

  const formatDate = (dateInput) => {
    // Default fallback
    const defaultDate = "Thursday 19 June 2025";

    if (!dateInput) return defaultDate;

    try {
      let date;

      // Handle different input types
      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
        // Handle ISO date strings
        date = new Date(dateInput);
      } else if (typeof dateInput === "number") {
        // Handle timestamps
        date = new Date(dateInput);
      } else {
        // Try to convert to string first
        date = new Date(String(dateInput));
      }

      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date provided to formatDate:", dateInput);
        return defaultDate;
      }

      // Format and return as string - THIS IS THE KEY FIX
      const formatted = date.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Extra safety check to ensure we return a string
      return String(formatted || defaultDate);
    } catch (error) {
      console.warn("Date formatting error:", error, "Input:", dateInput);
      return defaultDate;
    }
  };

  const getCollectionDate = (deliveryDateInput) => {
    // Default fallback
    const defaultDate = "Thursday 26 June 2025";

    if (!deliveryDateInput) return defaultDate;

    try {
      let deliveryDate;

      // Handle different input types
      if (deliveryDateInput instanceof Date) {
        deliveryDate = deliveryDateInput;
      } else if (typeof deliveryDateInput === "string") {
        deliveryDate = new Date(deliveryDateInput);
      } else if (typeof deliveryDateInput === "number") {
        deliveryDate = new Date(deliveryDateInput);
      } else {
        deliveryDate = new Date(String(deliveryDateInput));
      }

      // Validate the date
      if (isNaN(deliveryDate.getTime())) {
        console.warn(
          "Invalid date provided to getCollectionDate:",
          deliveryDateInput,
        );
        return defaultDate;
      }

      // Add 14 days
      const collectionDate = new Date(
        deliveryDate.getTime() + 14 * 24 * 60 * 60 * 1000,
      );

      // Format and return as string - THIS IS THE KEY FIX
      const formatted = collectionDate.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Extra safety check to ensure we return a string
      return String(formatted || defaultDate);
    } catch (error) {
      console.warn(
        "Collection date formatting error:",
        error,
        "Input:",
        deliveryDateInput,
      );
      return defaultDate;
    }
  };

  useEffect(() => {
    console.log("Booking data received in Payment.jsx:", bookingData);
  }, [bookingData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Complete Your Payment
          </h1>
          <p className="text-xl text-gray-600">
            Review your order and complete the secure payment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            {/* Delivery Address */}
            <div className="mb-6">
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Delivery Address
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700 font-medium">{address.line1}</p>
                <p className="text-gray-600">{address.postcode}</p>
              </div>
            </div>

            {/* Delivery & Collection */}
            <div className="mb-6">
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1 1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Delivery & Collection
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Delivery:</span>{" "}
                  {formatDate(selectedDate)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Collection:</span>{" "}
                  {getCollectionDate(selectedDate)}
                </p>
              </div>
            </div>

            {/* Skip Details */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">
                  {selectedSkip.size} Yard Skip
                </span>
                <span className="font-bold text-gray-800">
                  £{skipPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600">14 day hire period</p>
            </div>

            {/* Additional Charges */}
            {permitFee > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Additional Charges
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Road Permit Fee</span>
                  <span className="font-bold text-gray-800">
                    £{permitFee.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal (excl. VAT)</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>VAT (20%)</span>
                <span>£{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-800 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Payment Details
            </h2>

            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Payment Method */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-gray-800">Card</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("googlepay")}
                    disabled={!googlePayReady}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === "googlepay"
                        ? "border-blue-500 bg-blue-50"
                        : googlePayReady
                          ? "border-gray-200 bg-white hover:border-gray-300"
                          : "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-2 bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-white">G</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        Google Pay
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <>
                  {/* Card Details Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Card Details
                    </h3>

                    {/* Card Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) =>
                            handleCardInputChange(
                              "number",
                              formatCardNumber(e.target.value),
                            )
                          }
                          placeholder="1234 1234 1234 1234"
                          className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                            errors.number
                              ? "border-red-300 ring-2 ring-red-200"
                              : "border-gray-200"
                          }`}
                          maxLength="19"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {cardType === "visa" && (
                            <div className="text-blue-600 font-bold text-sm">
                              VISA
                            </div>
                          )}
                          {cardType === "mastercard" && (
                            <div className="text-red-600 font-bold text-sm">
                              MC
                            </div>
                          )}
                          {cardType === "amex" && (
                            <div className="text-blue-600 font-bold text-sm">
                              AMEX
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.number && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.number}
                        </p>
                      )}
                    </div>

                    {/* Expiry and CVC */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiration date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            handleCardInputChange(
                              "expiry",
                              formatExpiry(e.target.value),
                            )
                          }
                          placeholder="MM/YY"
                          className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.expiry
                              ? "border-red-300 ring-2 ring-red-200"
                              : "border-gray-200"
                          }`}
                          maxLength="5"
                        />
                        {errors.expiry && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.expiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            handleCardInputChange(
                              "cvc",
                              e.target.value.replace(/\D/g, "").substring(0, 4),
                            )
                          }
                          placeholder="123"
                          className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.cvc
                              ? "border-red-300 ring-2 ring-red-200"
                              : "border-gray-200"
                          }`}
                          maxLength="4"
                        />
                        {errors.cvc && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.cvc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) =>
                          handleCardInputChange("name", e.target.value)
                        }
                        placeholder="John Doe"
                        className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name
                            ? "border-red-300 ring-2 ring-red-200"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billing Address Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Billing Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address line 1
                        </label>
                        <input
                          type="text"
                          value={billingAddress.line1}
                          onChange={(e) =>
                            handleBillingAddressChange("line1", e.target.value)
                          }
                          placeholder="123 Main Street"
                          className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.billingLine1
                              ? "border-red-300 ring-2 ring-red-200"
                              : "border-gray-200"
                          }`}
                        />
                        {errors.billingLine1 && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.billingLine1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address line 2 (optional)
                        </label>
                        <input
                          type="text"
                          value={billingAddress.line2}
                          onChange={(e) =>
                            handleBillingAddressChange("line2", e.target.value)
                          }
                          placeholder="Apartment, suite, etc."
                          className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) =>
                              handleBillingAddressChange("city", e.target.value)
                            }
                            placeholder="London"
                            className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.billingCity
                                ? "border-red-300 ring-2 ring-red-200"
                                : "border-gray-200"
                            }`}
                          />
                          {errors.billingCity && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.billingCity}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postcode
                          </label>
                          <input
                            type="text"
                            value={billingAddress.postcode}
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "postcode",
                                e.target.value.toUpperCase(),
                              )
                            }
                            placeholder="SW1A 1AA"
                            className={`w-full p-3 bg-white border rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.billingPostcode
                                ? "border-red-500"
                                : "border-gray-600"
                            }`}
                          />
                          {errors.billingPostcode && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.billingPostcode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country
                        </label>
                        <select
                          value={billingAddress.country}
                          onChange={(e) =>
                            handleBillingAddressChange(
                              "country",
                              e.target.value,
                            )
                          }
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Ireland">Ireland</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Card Option */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-800">
                        Save this card for future purchases
                      </span>
                    </label>
                  </div>
                </>
              )}

              {paymentMethod === "googlepay" && (
                <div className="mb-8">
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
                        <svg
                          className="w-8 h-8 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Google Pay
                      </h3>
                      <p className="text-gray-600">
                        Quick and secure payment with Google Pay
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6 shadow-sm">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Total Amount:</span>
                        <span className="font-semibold text-gray-800">
                          £{total.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        You'll be redirected to Google Pay to complete your
                        payment securely
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Secured by Google</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-gray-700">
                      Your payment information is encrypted and processed
                      securely. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-sm text-gray-700">
                  By completing this purchase, you agree to our{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  . Your payment information is processed securely.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={processing || !isFormValid()}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      {paymentMethod === "googlepay"
                        ? "Redirecting..."
                        : "Processing Payment..."}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {paymentMethod === "googlepay" ? (
                        <>
                          <span className="mr-2">G</span>
                          Pay £{total.toFixed(2)}
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H3v-4L0 10l3-3V3h4l3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pay £{total.toFixed(2)}
                        </>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
