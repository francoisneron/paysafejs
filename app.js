var express = require("express");
var fs = require("fs");
var https = require("https");
var http = require("http");
var bodyParser = require("body-parser");
var request = require("request");

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('./certificates/keys/client-key.pem'),
  cert: fs.readFileSync('./certificates/keys/client-cert.pem')
};

/*
Environment variables
process.env.PAYSAFE_PUBLICKEY
process.env.PAYSAFE_PRIVATEKEY
process.env.PAYSAFE_ACCOUNTNUMBER
process.env.PAYSAFE_URL
process.env.PAYSAFE_ENVIRONMENT
*/

var encoded64_publickey = new Buffer("francoisneron:B-qa2-0-57990c09-0-302c021425c2715ddc4d90c0e1eb8311b11ffddb2eed4b6502145395425ea7f89c974ec364f8074cd1f63d479d75").toString('base64');
var encoded64_privatekey = new Buffer("18987-1000032307:B-qa2-0-55660eb1-0-302c02144d6da16eaaf344d779c9027d879b3fc0988e17b4021418ad7b6cf28df7f8f08e1a7d9d64264d490c7f38").toString('base64');
var paysafe_accountnumber = "1001134270";

//var APPLE_PAY_CERTIFICATE_PATH = "./certificates/merch.pem";
//var SSL_CERTIFICATE_PATH = "./certificates/domain.crt";
//var SSL_KEY_PATH = "./certificates/domain.key";
//var MERCHANT_IDENTIFIER = "merchant.com.paysafe.integrations.mtl";
//var MERCHANT_DOMAIN = "applepayintegration-env.w5pfnavnqi.ca-central-1.elasticbeanstalk.com";

//var privateKey  = fs.readFileSync(SSL_KEY_PATH);
//var certificate = fs.readFileSync(SSL_CERTIFICATE_PATH);
//var applePayCert = fs.readFileSync(APPLE_PAY_CERTIFICATE_PATH);

var config = require('./config');
//var credentials = {key: privateKey, cert: certificate};

var app = express();

// Create an HTTP service.
//http.createServer(app).listen(80);

// Create an HTTPS service identical to the HTTP service.
//https.createServer(options, app).listen(443);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('json spaces', 2);

app.set('port', (process.env.PORT || 8080))

app.get("/", function (req, res) {
  res.sendFile("./views/index.html");
});

/*
app.post("/getApplePaySession", function (req, res) {
	// We need a URL from the client to call
	if (!req.body.url) return res.sendStatus(400);
	// We must provide our Apple Pay certificate, merchant ID, domain name, and display name
	var options = {
		url: req.body.url,
		cert: applePayCert,
		key: applePayCert,
		method: "post",
		body: {
			merchantIdentifier: MERCHANT_IDENTIFIER,
			domainName: MERCHANT_DOMAIN,
			displayName: "My Store"
		},
		json: true
	};
	console.log(options);

	// Send the request to the Apple Pay server and return the response to the client
	request(options, function (err, response, body) {
		if (err) {
			console.log("Error generating Apple Pay session!");
			console.log(err, response, body);
			res.status(500).send(body);
		}
		res.send(body);
	});
});
*/


app.post("/applepaytokenize", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + encoded64_publickey,
		'Content-Type': 'application/json'
	};
	
	console.log(req);

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
			console.log(response.body);
			res.send({				
				token: response.body
			});
		}
	});

});


app.post("/googlepaytokenize", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + encoded64_publickey,
		'Content-Type': 'application/json'
	};
	
	console.log(req);

	var options = {
		url: "https://api.test.paysafe.com/customervault/v1/paywithgooglesingleusetokens",
		method: "post",
		headers: headers,
		body: {
			payWithGooglePaymentToken: req.body.token.paymentData
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

/*

curl -X POST https://api.test.paysafe.com/cardpayments/v1/accounts/89987201/auths \
  -u devcentre322:B-qa2-0-53625f86-302c021476f52bdc9deab7aea876bb28762e62f92fc6712d0214736abf501e9675e55940e83ef77f5c304edc7968 \
  -H 'Content-Type: application/json' \
  -d ' {
         "merchantRefNum" : "demo-1",
         "amount" : 10098,
         "settleWithAuth":true,
         "card" : {
           "cardNum" : "4111111111111111",
           "cardExpiry":{
             "month":2,
             "year":2027
            },
            "cvv":123
          },
          "billingDetails":{
             "street":"100 Queen Street West",
             "city":"Toronto",
             "state":"ON",
             "country":"CA",
             "zip":"M5H 2N2"
          }
        } '

        */

app.post("/payment", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + encoded64_privatekey,
		'Content-Type': 'application/json'
	};
	
	console.log(req);

	var options = {
		url: "https://api.test.paysafe.com/cardpayments/v1/accounts/" + paysafe_accountnumber + "/auths",
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

// Apple pay server verification (need to enable SSL)
app.get('/.well-known/:file', (req, res, next) => {
  logger(req);

  res.sendFile(__dirname + '/.well-known/' + req.params.file);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

/*
var server = https.createServer(options, app).listen(app.get('port'), () => {
  console.log('server running at ' + app.get('port'))
})
*/
