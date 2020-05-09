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
    polling: false,
    webHook: {
      // Just use 443 directly
      port: 443
    }
  };
  var url = 'https://tg.ablock.io'
  const bot = new TelegramBot(telegramLive, options);
  bot.setWebHook(`${url}/bot${telegramLive}`);

  return bot;
}