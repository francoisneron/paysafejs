var config = {};

config.paysafe = {};

config.paysafe.user_name = process.env.PAYSAFE_PUBLIC_KEY || 'username';
config.paysafe.password=  process.env.TWITTER_PASSWORD || 'password';

config.web.port = process.env.WEB_PORT || 8080;

module.exports = config;
