/**
 * config.js
 * Paysafe Payments Demo. Created by Francois Neron (@francoisneron).
 */

'use strict';

// Load environment variables from the `.env` file.
require('dotenv').config();

module.exports = {
  // Configuration for Paysafe.
  // Storing these keys as environment variables is a good practice.
  // You can fill them in your own `.env` file.
  paysafe: {
    // The two-letter country code of your Stripe account (required for Payment Request).
    account: process.env.PAYSAFE_ACCOUNT_NUMBER,
    // Use your test keys for development and live keys for real charges in production.
    // For non-card payments like iDEAL, live keys will redirect to real banking sites.
    publicKey: process.env.PAYSAFE_PUBLIC_KEY,
    privateKey: process.env.PAYSAFE_PRIVATE_KEY,
  },

  apple: {
    merchantId: process.env.APPLE_PAY_MERCHANT_IDENTIFIER
  },
  
  // Server port.
  port: process.env.PORT || 8000,

  // Tunnel to serve the app over HTTPS and be able to test apple pay and google pay.
  // Optionally, if you have a paid ngrok account, you can specify your `subdomain`
  // and `authtoken` in your `.env` file to use it.
  ngrok: {
    enabled: process.env.NODE_ENV !== 'production',
    port: process.env.PORT || 8000,
    subdomain: process.env.NGROK_SUBDOMAIN,
    authtoken: process.env.NGROK_AUTHTOKEN,
  },
};