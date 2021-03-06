// Base 64 encoded version the Single-Use Token API key.
// Create the key below by concatenating the API username and password
// separated by a colon and Base 64 encoding the result
var apiKey = "ZnJhbmNvaXNuZXJvbjpCLXFhMi0wLTU3OTkwYzA5LTAtMzAyYzAyMTQyNWMyNzE1ZGRjNGQ5MGMwZTFlYjgzMTFiMTFmZmRkYjJlZWQ0YjY1MDIxNDUzOTU0MjVlYTdmODljOTc0ZWMzNjRmODA3NGNkMWY2M2Q0NzlkNzU=";

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

					processPayment(result.token);
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

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Initialize Apple Pay session.
 */
function onApplePayLoaded() {
	var MERCHANT_IDENTIFIER = "merchant.com.paysafe.integrations.mtl"; 
	if (window.ApplePaySession) {
		ApplePaySession.canMakePaymentsWithActiveCard(MERCHANT_IDENTIFIER).then(function(canMakePayments) {
			if (canMakePayments) {
				addApplePayButton();
			}
		});
	}
}

/**
 * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
 */
function onGooglePayLoaded() {
  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.isReadyToPay({allowedPaymentMethods: allowedPaymentMethods})
      .then(function(response) {
        if (response.result) {}
          addGooglePayButton();
          prefetchGooglePaymentData(); 
      }).catch(function(err) {
        	console.error(err);
      });
}

/**
 * On page load initialize our supported payments for Apple Pay or Google Pay.
 */
document.addEventListener('DOMContentLoaded', () => {
	onGooglePayLoaded();
	onApplePayLoaded();
});

/**
 * Add a Google Pay purchase button alongside an existing checkout button
 *
 * @see {@link https://developers.google.com/pay/api/brand-guidelines|Google Pay brand guidelines}
 */
function addGooglePayButton() {
  var button = document.createElement('button');
  // identify the element to apply Google Pay branding in related CSS
  button.className = 'google-pay-button';
  button.addEventListener('click', onGooglePaymentButtonClicked);
  document.getElementsByClassName('google-pay')[0].appendChild(button);
}

/**
 * Add a Apple Pay purchase button alongside an existing checkout button
 */
function addApplePayButton() {
  var button = document.createElement('button');
  // identify the element to apply Apple Pay branding in related CSS
  button.className = 'apple-pay-button';
  button.addEventListener('click', onApplePayPaymentButtonClicked);
  document.getElementsByClassName('apple-pay')[0].appendChild(button);
}
/**
* Apple Pay Logic
* Our entry point for Apple Pay interactions.
* Triggered when the Apple Pay button is pressed
*/
function applePayButtonClicked() {
	const paymentRequest = {
        countryCode: 'CA',
        currencyCode: 'CAD',
        shippingMethods: [
            {
                label: 'Free Shipping',
                amount: '0.00',
                identifier: 'free',
                detail: 'Delivers in five business days',
            },
            {
                label: 'Express Shipping',
                amount: '1.00',
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
            amount: '5.00',
        },
 
        supportedNetworks:['masterCard', 'visa']
        //merchantCapabilities: [ 'supports3DS' ],
 
        //requiredShippingContactFields: [ 'postalAddress', 'email' ],
    };

	const session = new ApplePaySession(2, paymentRequest);
	
	/**
	* Merchant Validation
	* We call our merchant session endpoint, passing the URL to use
	*/
	session.onvalidatemerchant = (event) => {
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
		xhr.open('POST', '/applepaytokenize');			
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

/**
 * Payment methods accepted by your gateway
 *
 * @todo confirm support for both payment methods with your gateway
 */
var allowedPaymentMethods = ['CARD', 'TOKENIZED_CARD'];

/**
 * Card networks supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/object-reference#CardRequirements|CardRequirements}
 * @todo confirm card networks supported by your site and gateway
 */
var allowedCardNetworks = ['MASTERCARD', 'VISA'];

/**
 * Identify your gateway and your site's gateway merchant identifier
 *
 * The Google Pay API response will return an encrypted payment method capable of
 * being charged by a supported gateway after shopper authorization
 * 'gateway': 'paysafe',
 * 'gatewayMerchantId': apiKey
 * @todo check with your gateway on the parameters to pass
 * @see {@link https://developers.google.com/pay/api/web/object-reference#Gateway|PaymentMethodTokenizationParameters}
 */
var tokenizationParameters = {
  tokenizationType: 'PAYMENT_GATEWAY',
  parameters: {
		gateway: 'paysafe',
    gatewayMerchantId: apiKey
  }
}

/**
 * Initialize a Google Pay API client
 *
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
  return new google.payments.api.PaymentsClient({environment: 'TEST'});
}

/**
 * Configure support for the Google Pay API
 *
 * @see {@link https://developers.google.com/pay/api/web/object-reference#PaymentDataRequest|PaymentDataRequest}
 * @returns {object} PaymentDataRequest fields
 */
function getGooglePaymentDataConfiguration() {
  return {
    // @todo a merchant ID is available for a production environment after approval by Google
    // @see {@link https://developers.google.com/pay/api/web/test-and-deploy|Test and deploy}
    //merchantId: '01234567890123456789',
    paymentMethodTokenizationParameters: tokenizationParameters,
    allowedPaymentMethods: allowedPaymentMethods,
    cardRequirements: {
      allowedCardNetworks: allowedCardNetworks
    }
  };
}

/**
 * Provide Google Pay API with a payment amount, currency, and amount status
 *
 * @see {@link https://developers.google.com/pay/api/web/object-reference#TransactionInfo|TransactionInfo}
 * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
 */
function getGoogleTransactionInfo() {
  return {
    currencyCode: 'cad',
    totalPriceStatus: 'FINAL',
    // set to cart total
    totalPrice: '100'
  };
}

/**
 * Prefetch payment data to improve performance
 */
function prefetchGooglePaymentData() {
  var paymentDataRequest = getGooglePaymentDataConfiguration();
  // transactionInfo must be set but does not affect cache
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    currencyCode: 'CAD'
  };
  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.prefetchPaymentData(paymentDataRequest);
}

/**
 * Show Google Pay chooser when Google Pay purchase button is clicked
 */
function onGooglePaymentButtonClicked() {
  var paymentDataRequest = getGooglePaymentDataConfiguration();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest)
      .then(function(paymentData) {
        // handle the response
        googlePayTokenize(paymentData);
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
}

/**
 * Process payment data returned by the Google Pay API
 *
 * @param {object} paymentData response from Google Pay API after shopper approves payment
 * @see {@link https://developers.google.com/pay/api/web/object-reference#PaymentData|PaymentData object reference}
 */
function googlePayTokenize(paymentData) {
  // show returned data in developer console for debugging
	console.log(paymentData);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/googlepaytokenize');			
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.send(JSON.stringify(paymentData));

}

/**
 * Process payment data returned by the Google Pay API
 *
 * @param {object} paymentData response from Google Pay API after shopper approves payment
 * @see {@link https://developers.google.com/pay/api/web/object-reference#PaymentData|PaymentData object reference}
 */
function processPayment(paymentToken) {
  // show returned data in developer console for debugging
	var paymentData = {
     merchantRefNum : ID(),
     amount : 100,
     card : {
       paymentToken : paymentToken,
      },
     billingDetails:{
         street:"100 Queen Street West",
         city:"Toronto",
         state:"ON",
         country:"CA",
         zip:"M5H 2N2"
      }
	};

	var $form = $('#payment-form');

	var xhr = new XMLHttpRequest();

	xhr.open('POST', '/payment');			
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.send(JSON.stringify(paymentData));

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState === 4) {
	      	if (xhr.status === 200) {
	       		// Code here for the server answer when successful
	       		$form.find('.subscribe').html('Payment successful <i class="fa fa-check"></i>');
	       		console.log("Payment succesful from server.");
	       		console.log(xhr.response);
	      	} else {
	       		// Code here for the server answer when not successful
	       		$form.find('.subscribe').html('Payment successful <i class="fa fa-exclamation"></i>');
	       		console.log("Payment was not succesful from server.");
	       		console.log(xhr.response);
	      	}
		}
	}

	xhr.ontimeout = function () {
    // Well, it took to long do some code here to handle that
    console.log("Payment timeout from server.");
	}

}
