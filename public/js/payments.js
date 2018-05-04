/**
 * payments.js
 * Paysafe Payments Demo. Created by Francois Neron (@francoisneron).
 *
 * This file handles the checkout process using Paysafe.
 */

(async () => {
  'use strict';

  // Create references to the payment form and the pay button.
  const form = document.getElementById('payment-form');
  const payButton = form.querySelector('button[type=submit]');

  // Get paysafe public key.
  const publicKey = config.paysafePublicKey;

  // Initialize Paysafe
  const paysafeInstance = null;

  // Prepare the options for our payment form to be styled accordingly.
  const options = {
        // select the Paysafe test / sandbox environment
        environment: "TEST",

        // set the CSS selectors to identify the payment field divs above
        // set the placeholder text to display in these fields
        fields: {
	        cardNumber: {
	        	selector: "#cardNumber",
	        	placeholder: "Card number",
	        },
	        expiryDate: {
	        	selector: "#expiryDate",
	        	placeholder: "Expiry date"
	        },
	        cvv: {
	        	selector: "#cvv",
	        	placeholder: "CVV",
	      }
	   }
  	};

	// initalize the hosted iframes using the SDK setup function
	paysafe.fields.setup(publicKey, options, function(instance, error) {
		if (error) {
			console.log(error);
		} else {
			paysafeInstance = instance;
		}
	});

	paysafeInstance.fields("cvv cardNumber expiryDate").valid(function (eventInstance, event) {
	});
          
   	paysafeInstance.fields("cvv cardNumber expiryDate").invalid(function (eventInstance, event) {
	});
	          
   	paysafeInstance.fields.cardNumber.on("FieldValueChange", function(instance, event) {           
		if (!instance.fields.cardNumber.isEmpty()) {
			var cardBrand = instance.getCardBrand().replace(/\s+/g, '');
		switch (cardBrand) {
			case "AmericanExpress":
			break;
			case "MasterCard":
			break;
			case "Visa":
			break;
			case "Diners":
			break;
			case "JCB":
			break;
			case "Maestro":
			break;
			}
		} else {
		}
	});
});

  /**
   * Handle the form submission.
   *
   * This creates an order and either sends the card information from the Element
   * alongside it, or creates a Source and start a redirect to complete the purchase.
   *
   * Please note this form is not submitted when the user chooses the "Pay" button
   * or Apple Pay since they provide name and shipping information directly.
   */

  // Listen to changes to the user-selected country.
  form
    .querySelector('select[name=country]')
    .addEventListener('change', event => {
      event.preventDefault();
      const country = event.target.value;
      const zipLabel = form.querySelector('label.zip');
      // Only show the state input for the United States.
      zipLabel.parentElement.classList.toggle('with-state', country === 'US');
      // Update the ZIP label to make it more relevant for each country.
      form.querySelector('label.zip span').innerText =
        country === 'US'
          ? 'ZIP'
          : country === 'UK'
            ? 'Postcode'
            : 'Postal Code';
      event.target.parentElement.className = `field ${country}`;
      showRelevantPaymentMethods(country);
    });

	// Submit handler for our payment form.
	form.addEventListener('submit', async event => {
	event.preventDefault();

	// Retrieve the user information from the form.
	const payment = form.querySelector('input[name=payment]:checked').value;
	const name = form.querySelector('input[name=name]').value;
	const country = form.querySelector('select[name=country] option:checked').value;
	const email = form.querySelector('input[name=email]').value;
	const shipping = {
		name,
		address: {
		line1: form.querySelector('input[name=address]').value,
		city: form.querySelector('input[name=city]').value,
		postal_code: form.querySelector('input[name=postal_code]').value,
		state: form.querySelector('input[name=state]').value,
		country,
		},
	};

	// Disable the Pay button to prevent multiple click events.
	submitButton.disabled = true;

   if (payment === 'card') {
		paysafeInstance.tokenize({
			vault: {
			holderName: "John Smith",
			billingAddress: {
				country: "CA",
				zip: "M5H 2N2",
				state: "ON",
				city: "Toronto",
				street: "100 Queen Street",
				street2: "201"
				}
			}
		}, function(instance, error, result) {
		if (error) {
		} else {
			console.log(result.token);
		}
	});
	await handleOrder(order, token);
	} else {
	await handleOrder(order, token, error);
	}
  });

  // Handle the order and source activation if required
  const handleOrder = async (order, token, error = null) => {
    const mainElement = document.getElementById('main');
    const confirmationElement = document.getElementById('confirmation');
    if (error) {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      confirmationElement.querySelector('.error-message').innerText =
        error.message;
      mainElement.classList.add('error');
    }
})();