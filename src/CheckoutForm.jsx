import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [email, setEmail] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  // Immediately as the checkout page loads, request from server
  // to create a new PaymentIntent. This returns and stores a clientSecret
  useEffect(() => {
    window
      .fetch("/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({items: [{ id: "lifechanging-compliment" }]})
      })
      .then(res => {
        return res.json();
      })
      .then(data => {
        setClientSecret(data.clientSecret);
      }
    );
  }, []);

  // Style object, passed into CardElement
  const cardInputStyle = {
    style: {
      base: {
        color: "#3A5174",
        fontFamily: 'Roboto, Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontWeight:500,
        fontSize: "14px",
        "::placeholder": {
          color: "#A9A9A9"
        }
      },
      invalid: {
        color: "#9C2C14",
        iconColor: "#9C2C14"
      }
    }
  };

  // Handler passed into CardElement to listen for changes in
  // the CardElement and display any errors as the customer types
  const handleChange = async (ev) => {
    setDisabled(ev.empty);
    setError(ev.error ? ev.error.message : "");
  };

  // Handler for when user clicks pay button. Use useStripe and useEleemnts hooks
  const handleSubmit = async ev => {
    // Stop page from refreshing upon form submit
    ev.preventDefault();

    // Disable form submission until stripe.js has loaded
    if (!stripe || !elements) {
        return;
    }

    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      receipt_email: email,
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: ev.target.name.value
        }
      }
    });

    if (payload.error) {
      setError(`Payment failed. ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <input
        className="FormRowInput"
        id="email"
        type="email"
        placeholder="Email to receive compliment"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <CardElement id="card-element" options={cardInputStyle} onChange={handleChange} />
      <button
        disabled={processing || disabled || succeeded}
        id="submit"
      >
        <span id="button-text">
          {processing ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            "Purchase for $1 USD"
          )}
        </span>
      </button>

      {/* Show any error that happens when processing the payment */}
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}

      {/* Show a success message upon completion */}
      <p className={succeeded ? "result-message" : "result-message hidden"}>
        Thank you! Here's a freebie while we fulfill your order:
        <br /><br />
        You're doing exceedingly well, and I'm so proud of you. Even in these tough times,
        your spirit and tenacity shine through. Your energy is infectious,
        and helps those around you feel better about themselves too. You're amazing,
        keep thriving!
        <br /><br />
        Hey, since you paid for a compliment, consider sharing a few with
        friends and family?
      </p>
    </form>
  );
}
