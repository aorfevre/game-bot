"use strict";

const TelegramBot = require('node-telegram-bot-api');
var async = require('async');

global.TOKEN = '1157895976:AAHCaIQmcpUqAhb9hzRBPBOPtwVaGNdF0DM';
global.isDev = __dirname.indexOf("ablock") !== -1

module.exports.setTelegram = function() {


  var telegramTest = '602801351:AAEAUmijk5htvA6_W_14cbdkkVjFuXYzT_g';

  var telegramToken = TOKEN

  if (isDev)
    telegramToken = telegramTest
  // return new TelegramBot(telegramToken, {
  //   polling: {
  //     interval: 200,
  //     limit: 75,
  //     autoStart: true,
  //     allowed_updates: ["message", "inline_query", "callback_query"]
  //   }
  // });



  var bot = null;
  if (!isDev) {
    const options = {

      webHook: {
        // Just use 443 directly
        port: 443
      }
    };
    var url = 'https://tg.ablock.io'
    // url = 'https://api.telegram.org'
    bot = new TelegramBot(telegramToken, options);
    bot.setWebHook(`${url}/bot${telegramToken}`);

    bot.on('webhook_error', (error) => {
      console.log("Webhook error", error.code, error); // => 'EPARSE'
    });
  } else {
    const options = {
      polling: {
        autoStart: true,
        allowed_updates: ["message", "inline_query", "callback_query"]
      },

    };
    bot = new TelegramBot(telegramToken, {
      polling: true
    });
  }

  return bot;
}