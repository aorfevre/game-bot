"use strict";

const TelegramBot = require("node-telegram-bot-api");
var async = require("async");

global.TOKEN = "6668560974:AAHMQHW-onAsZ1-AD2waxOFgk3MP8rhVor0";
global.isDev = __dirname.indexOf("aorfevre") !== -1;

module.exports.setTelegram = function () {
  var telegramTest = "602801351:AAEAUmijk5htvA6_W_14cbdkkVjFuXYzT_g";
  var telegramToken = TOKEN;

  if (isDev) telegramToken = TOKEN;

  var bot = null;
  if (!isDev) {
    // if(false){
    const options = {
      webHook: {
        // Just use 443 directly
        port: 443,
      },
    };
    var url = process.env.PUBLIC_API_URL;
    // url = 'https://api.telegram.org'
    bot = new TelegramBot(telegramToken, options);
    bot.setWebHook(`${url}/bot${telegramToken}`);

    bot.on("webhook_error", (error) => {
      console.log("Webhook error", error.code, error); // => 'EPARSE'
    });
  } else {
    const options = {
      polling: {
        autoStart: true,
        allowed_updates: ["message", "inline_query", "callback_query"],
      },
    };
    bot = new TelegramBot(telegramToken, {
      polling: true,
    });
  }
  console.log("START isDev", isDev, telegramToken);
  return bot;
};
