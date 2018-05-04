/**
 * routes.js
 * Paysafe Payments Demo. Created by Francois Neron (@francoisneron).
 *
 * This file defines all the endpoints/services for this app.
 */

'use strict';

const config = require('../config');
const express = require('express');
const fs = require("fs");
const https = require("https");
const http = require("http");
const request = require("request");
const router = express.Router();

var APPLE_PAY_CERTIFICATE_PATH = "./certificates/applepay/merchant_id.pem";
var applePayCert = fs.readFileSync(APPLE_PAY_CERTIFICATE_PATH);

/**
 * Render the main app.
 */  
router.get('/', (req, res) => {
  res.render('index.html');
});


/**
 * Expose the Paysafe public key and other pieces of config via an endpoint.
 */  
router.get('/config', (req, res) => {
  res.json({
    paysafePublicKey: config.paysafe.publicKey
  });
});

router.post("/getApplePaySession", function (req, res) {

	// We need a URL from the client to call
	if (!req.body.url) return res.sendStatus(400);

	// We must provide our Apple Pay certificate, merchant ID, domain name, and display name
	var options = {
		url: req.body.url,
		cert: applePayCert,
		key: applePayCert,
		method: "post",
		body: {
			merchantIdentifier: process.env.APPLE_PAY_MERCHANT_IDENTIFIER,
			domainName: process.env.NGROK_DOMAIN,
			displayName: "My Store"
		},
		json: true
	};

	// Send the request to the Apple Pay server and return the response to the client
	request(options, function (err, response, body) {
		if (err) {
			console.log("Error generating Apple Pay session!");
			console.log(err, response, body);
			res.status(500).send(body);
		}
		console.log("Succesfuly generated Apple Pay session!");
		res.send(body);
	});
});

router.post("/applepaytokenize", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + new Buffer(process.env.PAYSAFE_PUBLIC_KEY).toString("base64"),
		'Content-Type': 'application/json'
	};

	var options = {
		url: "https://api.test.paysafe.com/customervault/v1/applepaysingleusetokens",
		method: "post",
		headers: headers,
		body: {
			applePayPaymentToken: req.body.token.paymentData
		},
		json: true
	};

	request(options, function (err, response, body) {
		if (err) {
			console.log("Error generating Apple Pay!");
			console.log(err, response, body);
			res.status(500).send(err);
		}else {
			console.log(body);
		}
	});

});

router.post("/googlepaytokenize", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + new Buffer(process.env.PAYSAFE_PUBLIC_KEY).toString("base64"),
		'Content-Type': 'application/json'
	};

	var options = {
		url: "https://api.test.paysafe.com/customervault/v1/paywithgooglesingleusetokens",
		method: "post",
		headers: headers,
		body: {
			payWithGooglePaymentToken: JSON.parse(req.body.paymentMethodToken.token)
		},
		json: true
	};

	request(options, function (err, response, body) {
		if (err) {
			console.log("Error generating Google Pay!");
			console.log(err, response, body);
			res.status(500).send(err);
		}else {
			console.log(response.body);
			res.send({				
				token: response.body
			});
		}
	});

});

router.post("/payment", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + new Buffer(process.env.PAYSAFE_PRIVATE_KEY).toString("base64"),
		'Content-Type': 'application/json'
	};

	var options = {
		url: "https://api.test.paysafe.com/cardpayments/v1/accounts/" + process.env.PAYSAFE_ACCOUNT_NUMBER + "/auths",
		method: "post",
		headers: headers,
		body: {
			merchantRefNum: req.body.merchantRefNum,
			amount : req.body.amount,
			settleWithAuth : true,
			card: req.body.card,
			billingDetails: req.body.billingDetails
		},
		json: true
	};

	request(options, function (err, response, body) {
		if (err) {
			console.log("Error sending payments");
			console.log(err, response, body);
			res.status(500).send(err);
		}else {
			console.log(response.body);
			res.send(body);
		}
	});

});

module.exports = router;