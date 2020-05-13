import React from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import './App.css';

// Configure stripe library with public key
const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css?family=Helvetica+Neue',
    },
  ],
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-title">
          Non-complimentary compliments
        </div>
        <p>
          Purchase a compliment below to complement your day. Unfortunately, compliments are non-complimentary.
        </p>

        <Elements stripe={promise} options={ELEMENTS_OPTIONS}>
          <CheckoutForm />
        </Elements>
      </header>
    </div>
  );
}

export default App;
