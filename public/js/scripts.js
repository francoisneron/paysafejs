// Base 64 encoded version the Single-Use Token API key.
// Create the key below by concatenating the API username and password
// separated by a colon and Base 64 encoding the result
var apiKey = "ZnJhbmNvaXNuZXJvbjpCLXFhMi0wLTU3OTkwYzA5LTAtMzAyYzAyMTQyNWMyNzE1ZGRjNGQ5MGMwZTFlYjgzMTFiMTFmZmRkYjJlZWQ0YjY1MDIxNDUzOTU0MjVlYTdmODljOTc0ZWMzNjRmODA3NGNkMWY2M2Q0NzlkNzU=";
var timer = 0;

$(document).ready(function() {

	var $form = $('#payment-form');
	$form.find('.subscribe').prop('disabled', true);

	var options = {

		// select the Paysafe test / sandbox environment
		environment: "TEST",

		// set the CSS selectors to identify the payment field divs above
		// set the placeholder text to display in these fields
		fields: {
			cardNumber: {
				selector: "#cardNumber",
				placeholder: "Card Number"
			},
			expiryDate: {
				selector: "#cardExpiry",
				placeholder: "MM / YY"
			},
			cvv: {
				selector: "#cardCVC",
				placeholder: "CVV"
			}
		}
	};
	
	// initalize the hosted iframes using the SDK setup function
	paysafe.fields.setup(apiKey, options, function(instance, error) {
		if (error) {
			console.log(error);
		}
		
		var subscribeButton = $form.find('.subscribe');

		instance.fields("cvv cardNumber expiryDate").valid(function (eventInstance, event) {
			$(event.target.containerElement).closest('.form-control').removeClass('error').addClass('success');

			if (paymentFormReady()) {
				$form.find('.subscribe').prop('disabled', false);
			}
		});

		instance.fields("cvv cardNumber expiryDate").invalid(function (eventInstance, event) {
			$(event.target.containerElement).closest('.form-control').removeClass('success').addClass('error');
			if (!paymentFormReady()) {
				$form.find('.subscribe').prop('disabled', true);
			}
		});
		
		instance.on("CardBrandRecognition", function(instance, event) {
            if (instance.getCardBrand()) {
				var cardBrand = instance.getCardBrand().replace(/\s+/g, '');
				
				switch (cardBrand) {
					case "AmericanExpress":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-amex');
					  break;
					case "MasterCard":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-mastercard');
					  break;
					case "Visa":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-visa');
					  break;
					case "Diners":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-diners-club');
					  break;
					case "JCB":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-jcb');
					  break;
					case "Maestro":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-discover');
					  break;
				}
			} else {
				$form.find(".fa").removeClass().addClass('fa fa-credit-card');
            }
		});
		
		subscribeButton.bind("click", function (event) {
			instance.tokenize(function(instance, error, result) {
				if (error) {
					console.log(error);
					$form.find('.subscribe').html('Try again').prop('disabled', false);

					/* Show Paysafe errors on the form */
					$form.find('.payment-errors').text(error.detailedMessage);
					$form.find('.payment-errors').closest('.row').show();
				} else {
					/* Visual feedback */
					$form.find('.subscribe').html('Processing <i class="fa fa-spinner fa-pulse"></i>');

					/* Hide Paysafe errors on the form */
					$form.find('.payment-errors').closest('.row').hide();
					$form.find('.payment-errors').text("");
                
					// response contains token          
					console.log("Card tokenization successful, token " + result.token);
                
					// AJAX - you would send 'token' to your server here and invoke Authorization agains Paysafe's Card API
					delay(function(){                
						// do stuff
						$form.find('.subscribe').html('Payment successful <i class="fa fa-check"></i>');
					});
				}
			});
		});
	});
});

function paymentFormReady() {
    return $('#cardNumber').hasClass("success") 
			&& $('#cardExpiry').hasClass("success") 
			&& $('#cardCVC').hasClass("success");
}


function delay(callback) {
	clearTimeout(timer);
	timer = setTimeout(callback, 2000);
}

/**
* This method is called when the page is loaded.
* We use it to show the Apple Pay button as appropriate.
* Here we're using the ApplePaySession.canMakePayments() method,
* which performs a basic hardware check. 
**/

document.addEventListener('DOMContentLoaded', () => {
	var MERCHANT_IDENTIFIER = "merchant.com.paysafe.atlas";
	if (window.ApplePaySession) {
		ApplePaySession.canMakePaymentsWithActiveCard(MERCHANT_IDENTIFIER).then(function(canMakePayments) {
			if (canMakePayments) {
				showApplePayButton();
			}
		});
	}
});

function showApplePayButton() {
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	const buttons = document.getElementsByClassName("apple-pay-button");
	for (let button of buttons) {
		button.className += " visible";
	}
}


/**
* Apple Pay Logic
* Our entry point for Apple Pay interactions.
* Triggered when the Apple Pay button is pressed
*/
function applePayButtonClicked() {
	const paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        shippingMethods: [
            {
                label: 'Free Shipping',
                amount: '0.00',
                identifier: 'free',
                detail: 'Delivers in five business days',
            },
            {
                label: 'Express Shipping',
                amount: '5.00',
                identifier: 'express',
                detail: 'Delivers in two business days',
            },
        ],
 
        lineItems: [
            {
                label: 'Shipping',
                amount: '0.00',
            }
        ],
 
        total: {
            label: 'Apple Pay Example',
            amount: '8.99',
        },
 
        supportedNetworks:[ 'amex', 'discover', 'masterCard', 'visa'],
        merchantCapabilities: [ 'supports3DS' ],
 
        //requiredShippingContactFields: [ 'postalAddress', 'email' ],
    };

	const session = new ApplePaySession(2, paymentRequest);
	
	/**
	* Merchant Validation
	* We call our merchant session endpoint, passing the URL to use
	*/
	session.onvalidatemerchant = (event) => {
		console.log("Validate merchant");
		getApplePaySession(event.validationURL).then(function(response) {
  			session.completeMerchantValidation(response);
		});
	};

	/**
	* Payment Authorization
	* Here you receive the encrypted payment data. You would then send it
	* on to your payment provider for processing, and return an appropriate
	* status in session.completePayment()	
	*/
	session.onpaymentauthorized = (event) => {
		// Send payment for processing...
		const payment = event.payment;
		printProperties(event, "event");

		// ...return a status and redirect to a confirmation page
		session.completePayment(ApplePaySession.STATUS_SUCCESS);
	
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/tokenize');			
		xhr.setRequestHeader("Content-Type", "application/json");
	
		xhr.send(JSON.stringify(payment));
	}

	// All our handlers are setup - start the Apple Pay payment
	session.begin();
}

function getApplePaySession(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/getApplePaySession');
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({url: url}));
  });
}

function printProperties(target, path) {
  for (var property in target) {
	var value = target[property];
	if (typeof value === "object") {
	  printProperties(value, path + "." + property);
	} else {
	  printMessage(path + "." + property + ": " + value);
	}
  }
}

function printMessage(data) {
  var div = document.createElement("div");
  div.innerHTML = data;
  document.body.appendChild(div);
}
