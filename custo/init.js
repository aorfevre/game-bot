"use strict";

const TelegramBot = require('node-telegram-bot-api');
var async = require('async');


module.exports.setTelegram = function() {

  var telegramLive = '1000558929:AAG7aAPgu9WNDjTUGRxQHQ0QG2TrP7d27Hw';
  var telegramTest = '602801351:AAEAUmijk5htvA6_W_14cbdkkVjFuXYzT_g';

  var telegramToken = telegramLive
  global.isDev = __dirname.indexOf("ablock") !== -1

  // return new TelegramBot(telegramToken, {
  //   polling: {
  //     interval: 200,
  //     limit: 75,
  //     autoStart: true,
  //     allowed_updates: ["message", "inline_query", "callback_query"]
  //   }
  // });

  const options = {

    webHook: {
      // Just use 443 directly
      port: 443
    }
  };

  //
  //   if (process.env.NODE_ENV === 'production') {
  //    bot = new TelegramBot(token);
  //    bot.setWebHook(process.env.HEROKU_URL + bot.token);
  // } else {
  //    bot = new TelegramBot(token, { polling: true });
  // }
  var url = 'https://tg.ablock.io'
  const bot = new TelegramBot(telegramLive);
  bot.setWebHook(`${url}/bot${telegramLive}`);
  bot.on('webhook_error', (error) => {
    console.log(error.code, error); // => 'EPARSE'
  });
  return bot;
}