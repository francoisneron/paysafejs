var express = require("express");
var fs = require("fs");
var https = require("https");
var http = require("http");
var bodyParser = require("body-parser");
var request = require("request");

var app = express();

var paysafeKeys = require('./config');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('json spaces', 2);

app.set('port', (process.env.PORT || 8080))

//the view, client key is passed to ejs template
app.get("/", function (req, res) {
  res.sendFile("index.html");
});

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

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
