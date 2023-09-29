"use strict";
require("dotenv").config();

process.env["NTBA_FIX_319"] = 1;
var init = require("./custo/init.js");

var helper = require("./custo/helper.js");
var games = require("./games/home.js");
var game_prisoner = require("./games/prisoner.js");
var game_number_guessing = require("./games/number_guessing.js");

global.bot = init.setTelegram();

bot.on("message", async (msg) => {
  helper.updateUser(msg);
});


bot.onText(/^\/[start](.+|\b)/, (msg, match) => {
  try {
    helper.home(msg);
   

  } catch (e) {
    console.log("error", e);
  }
});

// callback queries
bot.on("callback_query", async (callbackQuery) => {
  var msg = callbackQuery.message;
  var control = callbackQuery.data;

  if(control.indexOf('GAME_PRISONER_TIERS_') !== -1){
    control = "GAME_PRISONER_TIERS"
  }
  
  switch (control) {
    case "VERIFY_PENDING_TRANSACTIONS":
      helper.findAllUnverifiedTransactions();
      break;
    case "HOME":
      helper.home(msg);
      break;
    case "PLAY_MINI_GAMES":
      games.init(msg)
      break;
    case "STATS_USER":
      bot.sendMessage(msg.chat.id, "Stats - Under construction");
      break;
    case "GUIDE_GAMES":
      bot.sendMessage(msg.chat.id, "Guide - Under construction");
      break;
    case "INFO_GAMES":
      bot.sendMessage(msg.chat.id, "Info - Under construction");
      break;
    case "GAME_PRISONER":
      game_prisoner.init(msg)
      break;
    case "GAME_NUMBER_GUESSING":
      game_number_guessing.init(msg)
      break;
    case "GAME_PRISONER_INFO":
      console.log('Prisoner info')

      game_prisoner.info(msg)
      break;
    case "GAME_NUMBER_GUESSING_INFO":
      game_number_guessing.info(msg)
      break;
    case "GAME_PRISONER_TIERS":
      var t = callbackQuery.data.split('_')[3]
      game_prisoner.tiers(msg,t)
      break;

       
  }

});
