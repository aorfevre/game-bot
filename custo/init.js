"use strict";

const TelegramBot = require('node-telegram-bot-api');
var async = require('async');

global.TOKEN = '1157895976:AAHCaIQmcpUqAhb9hzRBPBOPtwVaGNdF0DM';
global.isDev = __dirname.indexOf("ablock") !== -1

module.exports.setTelegram = function() {


  var telegramTest = '602801351:AAEAUmijk5htvA6_W_14cbdkkVjFuXYzT_g';

  var telegramToken = TOKEN


  // return new TelegramBot(telegramToken, {
  //   polling: {
  //     interval: 200,
  //     limit: 75,
  //     autoStart: true,
  //     allowed_updates: ["message", "inline_query", "callback_query"]
  //   }
  // });

  const options = {
    polling: {
      interval: 200,
      limit: 75,
      autoStart: true,
      allowed_updates: ["message", "inline_query", "callback_query"]
    },
    webHook: {
      // Just use 443 directly
      port: 443
    }
  };

  var bot = null;
  if (!isDev) {
    var url = 'https://tg.ablock.io'
    // url = 'https://api.telegram.org'
    bot = new TelegramBot(TOKEN, options);
    bot.setWebHook(`${url}/bot${TOKEN}`);

    bot.on('webhook_error', (error) => {
      console.log("Webhook error", error.code, error); // => 'EPARSE'
    });
  } else {
    console.log("IS DEV START")
    bot = new TelegramBot(TOKEN, {
      polling: true
    });
  }

  return bot;
}