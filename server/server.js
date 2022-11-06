const express = require("express");
const app = express();
const { resolve } = require("path");
const { ethers } = require("ethers");
// Copy the .env.example in the root into a .env file in this folder
require("dotenv").config({ path: "./.env" });

// Ensure environment variables are set.
checkEnv();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  appInfo: {
    // For sample support and debugging, not required for production:
    name: "stripe-samples/checkout-one-time-payments",
    version: "0.0.1",
    url: "https://github.com/stripe-samples/checkout-one-time-payments",
  },
});
const axios = require("axios");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { OpenSeaSDK, Network } = require("opensea-js");

const provider = new HDWalletProvider(
  "135fa61e2e0aab82210d18bb8d2c23d4871efd078b0e725bfad560d2e14f7ac8",
  "https://eth-goerli.g.alchemy.com/v2/ZvpUdy99Sg-5s6Jx5bcJyAswfxOJjEdH"
);

const openseaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Goerli,
  apiKey: "",
});

const POOL_WALLET_ADDRESS = "0x9D0f35B74902759019DbB88E523550724f3d7FDf";

app.use(express.static(process.env.STATIC_DIR));
app.use(express.urlencoded());
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", async (req, res) => {
  const price = await stripe.prices.retrieve(process.env.PRICE);

  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    unitAmount: price.unit_amount,
    currency: price.currency,
  });
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const order = await openseaSDK.api.getOrder({
    assetContractAddress: session.metadata.tokenAddress,
    tokenId: session.metadata.tokenID,
    side: "ask",
  });

  const transactionHash = await openseaSDK.fulfillOrder({
    order,
    accountAddress: POOL_WALLET_ADDRESS,
  });

/*  const transferTX = await openseaSDK.transfer({
    asset: {
      tokenId: session.metadata.tokenID,
      tokenAddress: session.metadata.tokenAddress,
    },
    fromAddress: POOL_WALLET_ADDRESS,
    toAddress: session.metadata.userAddress,
  });
  console.log(`success ${transferTX}`);*/

  res.send(session);
});

app.post("/create-product-from-nft", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  console.log(req.body);
  const { data, price, address } = req.body;

  const product = await stripe.products.create({
    name: data.name,
    default_price_data: {
      currency: "USD",
      //this can include gas price + platfrom fee for now
      unit_amount_decimal: Math.trunc(price),
    },
    description: data.description,
    metadata: {
      tokenAddress: data.tokenAddress,
      tokenID: data.tokenID,
      userAddress: address,
    },
  });

  if (!product) {
    console.log("could not create product");
  }

  console.log(product.default_price);
  const price_id = product.default_price;
  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the Checkout page
  // [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
  // For full details see https://stripe.com/docs/api/checkout/sessions/create

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: price_id,
        quantity: 1,
      },
    ],
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/canceled.html`,
    // automatic_tax: {enabled: true},
  });

  console.log(session.url);

  return res.json({ url: session.url });
});

// Webhook handler for asynchronous events.
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));

function checkEnv() {
  const price = process.env.PRICE;
  if (price === "price_12345" || !price) {
    console.log(
      "You must set a Price ID in the environment variables. Please see the README."
    );
    process.exit(0);
  }
}
