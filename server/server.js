/**
 * server.js
 * Paysafe Payments Demo. Created by Francois Neron (@francoisneron).
 *
 * This is the main file starting the Express server and enabling ngrok for https.
 */

'use strict';

const parseDomain = require("parse-domain");
const config = require('../config');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const ngrok = config.ngrok.enabled ? require('ngrok') : null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Define routes.
app.use('/', require('./routes'));

// Apple Pay Payment Processing on the Web : Domain verification.
/*app.get('/.well-known/:file', (req, res, next) => {
  res.sendFile(__dirname + '/.well-known/' + req.params.file);
})*/

// Start the server on the correct port.
const server = app.listen(config.port, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

// Turn on the ngrok tunnel in development, which provides both the mandatory HTTPS
// support for all card payments.
if (ngrok) {
  ngrok.connect(config.ngrok.port, (err, url) => {
      if (err) {
        if (err.code === 'ECONNREFUSED') {
          console.log(`Connection refused at ${err.address}:${err.port}`);
        } else {
          console.log(`${err}`);
        }
        process.exit(1);
      }
      console.log(`App URL to see the demo in your browser: ${url}`);
      process.env.NGROK_DOMAIN = parseDomain(url).subdomain + "." + parseDomain(url).domain + "." + parseDomain(url).tld;
    }
  );
}
