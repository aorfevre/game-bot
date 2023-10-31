"use strict";

const TelegramBot = require("node-telegram-bot-api");
var async = require("async");

module.exports.setTelegram = function () {
  var bot = null;
  if (process.env.NODE_ENV === "production") {
    // if(false){
    const options = {
      webHook: {
        // Just use 443 directly
        port: 443,
      },
    };
    var url = process.env.PUBLIC_API_URL;
    // url = 'https://api.telegram.org'
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
    bot.setWebHook(`${url}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

    bot.on("webhook_error", (error) => {
      console.log("Webhook error", error.code, error); // => 'EPARSE'
    });
  } else {
    console.log(
      "process.env.TELEGRAM_BOT_TOKEN",
      process.env.TELEGRAM_BOT_TOKEN,
    );
    const options = {
      polling: {
        autoStart: true,
        allowed_updates: ["message", "inline_query", "callback_query"],
      },
    };
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
  }
  return bot;
};
