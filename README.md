## Non-complimentary compliments: Stripe PaymentIntents
Ecommerce business selling compliments (well, locally, and you're responsible for fulfillment).  
Below are instructions to test this integration in your local environment.

#### 1. Create a Stripe account if you don't have one
[Register here](https://dashboard.stripe.com/register) or log into Stripe.

#### 2. Configure your .env file with API keys   
The `.env` file allows you to configure your setup. First, create your `.env` file from the template by running in the terminal shell:  
```
cp .env.example .env
```
Open this new `.env` and fill in your Stripe API keys [available here](https://stripe.com/docs/development#api-keys), *Publishable* followed by *Secret*.
```
# Stripe API keys - see https://stripe.com/docs/development#api-keys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_example_key
STRIPE_SECRET_KEY=sk_example_key
```
Save the `.env` file.

#### 3. Set up webhook and configure your .env to test webhook integration    
The simplest way to test the webhook integration is to use the Stripe CLI to spin up a local webhook. If you haven't already, [install the CLI](https://stripe.com/docs/stripe-cli) and then [link your Stripe account](https://stripe.com/docs/stripe-cli#link-account).  

In your terminal shell, run:  
```
stripe listen --forward-to localhost:4242/webhook
```

Once you've installed and linked the Stripe CLI, fill your webhook secret into `.env` here:
```
# Webhook key
STRIPE_WEBHOOK_SECRET=whsec_example_key
```
Save the `.env` file.

As you create new payments ([Step 5, Run card tests](https://github.com/emmaasmith/noncomplimentary-compliments#5-run-card-tests)), you should see events logged in the console where the CLI is running.

Stripe's documentation is [here](https://stripe.com/docs/webhooks/test). If you'd like to create a live webhook endpoint, follow Stripe's docs [here](https://stripe.com/docs/webhooks/setup#configure-webhook-settings). 


#### 4. Run the client and server  
Open your terminal and run:
```
npm install
npm start
```
Your terminal should automatically open [http://localhost:3000](http://localhost:3000). Otherwise, visit that URL in the browser.

#### 5. Run card tests
Use test cards to run purchase flows. Email address is mandatory - how else would you receive your compliment?

Below are sample card numbers:  
* *Authentication not required:* Use card `4242 4242 4242 4242` with any CVC + a future expiration date.
* *Authentication required:* Use card `4000 0025 0000 3155` with any CVC + a future expiration date.
* *Card declines codes:* Use card `4000 0000 0000 9995` with any CVC + a future expiration date.  

For more test cases and cards, visit [Stripe's testing page](https://stripe.com/docs/testing).

#### 6. Confirm log of successful payments  
Confirm `successfulPayments.csv` contains a row for each successful payment, with new lines appending to the end.   
Fields are described in the [PaymentIntent object](https://stripe.com/docs/api/payment_intents/object) docs:
```
id: ID of payment intent, format is pi_...
amount: Amount intended to be collected, in USD cents
created: Timestamp PaymentIntent was created (not completed), in seconds since Unix epoch
customer: Customer ID, format is cus_...
receipt_email: Email entered
payment_method: Payment method ID, format is pm_...
```  
A second log, `failedPayments.csv`, appends a row for each failed payment with no dedpuing. 

*Note: a configured webhook is required to test these logs.*  

In addition, you can view payments on your [Stripe dashboard](https://dashboard.stripe.com/test/payments).  
