const express = require("express");
const fs = require("fs");
const app = express();
const { resolve } = require("path");
const port = 4242;
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.use(express.static("."));
app.use(
  express.json({
    // Compute raw body to verify webhook sig when hitting webhook endpoint
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);

// Return item price in cents
const calculatePrice = items => {
  return 100;
};

app.post("/create-payment-intent", async (req, res) => {
  // Items are passed in as the request
  const { items } = req.body;

  // Alternatively, set up a webhook to listen for the payment_intent.succeeded event
  // and attach the PaymentMethod to a new Customer
  const customer = await stripe.customers.create();

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    setup_future_usage: 'off_session',
    amount: calculatePrice(items),
    currency: "usd",
    statement_descriptor: 'Compliment factory'
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

// Match the raw body to content type application/json
app.post("/webhook", async (req, res) => {
  let data, eventType;

  if (endpointSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Fallback to retrieve event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    console.log("💰 Payment captured!");

    // Write to log file for payments to fulfill
    let content = data.object.id.concat(', ', data.object.amount, ', ',
      data.object.created, ', ', data.object.customer, ', ',
      data.object.receipt_email, ', ', data.object.payment_method + '\r\n')

    fs.appendFile('successfulPayments.csv', content, 'utf8', err => {
      if (err) {
        console.error(err)
        return
      }
    });

  } else if (eventType === "payment_intent.payment_failed") {
    console.log("❌ Payment failed");

    // Write to log file for failed payments to follow up on
    let content = data.object.id.concat(', ', data.object.amount, ', ',
      data.object.created, ', ', data.object.customer, ', ',
      data.object.receipt_email, ', ', data.object.payment_method + '\r\n')

    fs.appendFile('failedPayments.csv', content, 'utf8', err => {
      if (err) {
        console.error(err)
        return
      }
    });
  }

  res.sendStatus(200);
});


app.listen(port, () => console.log(`Node server listening at http://localhost:${port}`))
