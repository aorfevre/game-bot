"use strict";
require("dotenv").config();

process.env["NTBA_FIX_319"] = 1;
var init = require("./custo/init.js");

var helper = require("./custo/helper.js");
var crypto = require("./custo/crypto.js");
var games = require("./games/home.js");

global.bot = init.setTelegram();
global.DD_FLOOD = -1001865974274;

bot.on("message", async (msg) => {
  const user = await helper.updateUser(msg);
  if (helper.isPrivate(msg)) {
    if (user.isReferred) {
      games.check_input(msg);
    } else {
      helper.checkReferralSystem(msg);
    }
  }
});

bot.onText(/^\/[start](.+|\b)/, async (msg, match) => {
  if (helper.isPrivate(msg)) {
    try {
      const user = await helper.updateUser(msg);
      if (user.isReferred) {
        helper.home(msg);
      } else {
        helper.referralSystem(msg);
      }
    } catch (e) {
      console.log("error", e);
    }
  }
});

// callback queries
bot.on("callback_query", async (callbackQuery) => {
  var msg = callbackQuery.message;
  var control = callbackQuery.data;
  const isSpam = await helper.isSpam(msg);
  if (!isSpam) {
    if (control.indexOf("GAME_INIT_") !== -1) {
      control = "GAME_INIT";
    } else if (control.indexOf("GAME_PRICE_") !== -1) {
      control = "GAME_PRICE";
    } else if (control.indexOf("GAME_ACTION_") !== -1) {
      control = "GAME_ACTION";
    } else if (control.indexOf("GAME_SUMMARY_") !== -1) {
      control = "GAME_SUMMARY";
    } else if (control.indexOf("GUIDE_GAME_") !== -1) {
      control = "GUIDE_GAME";
    } else if (control.indexOf("FREE_") !== -1) {
      control = "FREE";
    } else if (control.indexOf("FREEGAME_") !== -1) {
      control = "FREEGAME";
    } else if (control.indexOf("FREETIERSGAME_") !== -1) {
      control = "FREETIERSGAME";
    }

    switch (control) {
      case "VERIFY_PENDING_TRANSACTIONS":
        helper.findAllUnverifiedTransactions();
        break;
      case "HOME":
        helper.home(msg);
        break;
      case "PLAY_MINI_GAMES":
        games.init(msg);
        break;
      case "MY_OPEN_GAMES":
        games.myOpenGAMES(msg);
        break;
      case "STATS_USER":
        bot.sendMessage(msg.chat.id, "TODO Stats - Under construction");
        break;
      case "GUIDE_GAMES":
        helper.guide_games(msg);

        break;
      case "GUIDE_GAME":
        var t = callbackQuery.data.split("GUIDE_GAME_")[1];
        games.guide(msg, t);
        break;

      case "INFO_GAMES":
        helper.info_games(msg);
        break;
      case "GAME_INIT":
        var t = callbackQuery.data.split("GAME_INIT_")[1];
        games.initGame(msg, t);
        break;
      case "GAME_PRICE":
        var t = callbackQuery.data.split("GAME_PRICE_")[1].split("_");
        games.price(msg, t[0], t[1]);
        break;
      case "GAME_ACTION":
        var t = callbackQuery.data.split("GAME_ACTION_")[1].split("_");
        if (t[2] === "INPUT") {
          bot.sendMessage(msg.chat.id, "Type the number of your choice");
          break;
        } else {
          games.action(msg, t[0], t[1], t[2]);
        }
        break;
      case "GAME_SUMMARY":
        var t = callbackQuery.data.split("GAME_SUMMARY_")[1].split("_");

        if (t[3] === "INPUT") {
          games.frequencyInput(msg);
          break;
        }
        games.summary(msg, t[0], t[1], t[2], t[3]);
        break;
      case "INVITE_CODES":
        helper.invite_codes(msg);
        break;
      case "CREATE_5_CODES":
        helper.create_5_codes(msg);
        break;
      case "FREE":
        var t = callbackQuery.data.split("FREE_")[1];
        games.freeGame(msg, t);
        console.log("Free games", t);
        break;
      case "FREEGAME":
        var game = callbackQuery.data.split("FREEGAME_")[1].split("_")[0];
        var tiers = callbackQuery.data.split("FREEGAME_")[1].split("_")[1];
        var choice = callbackQuery.data.split("FREEGAME_")[1].split("_")[2];

        games.freeGamePlayed(msg, game, tiers, choice);
        break;
      case "FREETIERSGAME":
        var game = callbackQuery.data.split("FREETIERSGAME_")[1];
        var tiers = callbackQuery.data.split("FREETIERSGAME_")[1];
        games.freeGame(msg, game, tiers);
        console.log("Free games", t);
        break;
    }
  } else {
    bot.sendMessage(msg.chat.id, "You are spamming the bot, please stop");
  }
});
