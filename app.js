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
http.createServer(app).listen(80);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);

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


app.post("/tokenize", function (req, res) {

	var headers = {
		'Authorization': 'Basic ' + 'T1QtNTY4OTA6Qi1wMS0wLTU1NGQwNDFhLTAtMzAyYzAyMTQ3NjdlYjk4Y2Y2ZGUxNjRmYzNiZjRiNTllM2Q1NmNkMDhmNzZlNjk2MDIxNDQ2ZGI1NDRhNTliYWM1MWRhYzNhOWI2NWVhYzVjZjU4NjNmZDNjNzY=',
		'Content-Type': 'application/json'
	};
	
	console.log(req);

	var options = {
		url: "https://api.paysafe.com/customervault/v1/applepaysingleusetokens",
		method: "post",
		headers: headers,
		body: {
			applePayPaymentToken: req.body.token.paymentData
		},
		json: true
	};

	request(options, function (err, response, body) {
		if (err) {
			console.log("Error generating Apple Pay session!");
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

app.get('/.well-known/:file', (req, res, next) => {
  logger(req);

  res.sendFile(__dirname + '/.well-known/' + req.params.file);
})


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
