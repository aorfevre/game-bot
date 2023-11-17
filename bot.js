"use strict";
require("dotenv").config();

process.env["NTBA_FIX_319"] = 1;
var init = require("./custo/init.js");

global.bot = init.setTelegram();
global.DD_FLOOD = -1001865974274;
global.RATE_FEE = 5;

bot.on("message", async (msg) => {
  var helper = require("./custo/helper.js");

  if (helper.isPrivate(msg)) {
  const processing = await helper.setProcessing(msg);

    if (msg.text !== "/start") {
      var games = require("./games/home.js");

      const user = await helper.updateUser(msg);
      if (helper.isPrivate(msg)) {
        if (user.isReferred) {
          games.check_input(msg);
        } else {
          helper.checkReferralSystem(msg);
        }
      }
    } else {

      var helper = require("./custo/helper.js");

      try {
        const user = await helper.updateUser(msg);


        if (user.isReferred) {
          await helper.home(msg);
        } else {
          await helper.referralSystem(msg);
        }
      } catch (e) {
        console.log("error", e);
      }
    }


    helper.deleteProcessingMessages(msg, processing);
  }
});

// callback queries
bot.on("callback_query", async (callbackQuery) => {
  var helper = require("./custo/helper.js");

  var msg = callbackQuery.message;
  const processing = await helper.setProcessing(msg);

  var control = callbackQuery.data;

  const isSpam = await helper.isSpam(msg);
  if (!isSpam) {
    var games = require("./games/home.js");

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
    console.log("CONTROL", control);
    switch (control) {
      case "VERIFY_PENDING_TRANSACTIONS":
        await helper.findAllUnverifiedTransactions();
        break;
      case "HOME":
        await helper.home(msg);
        break;
      case "PLAY_MINI_GAMES":
        await games.init(msg);
        break;
      case "MY_OPEN_GAMES":
        await games.myOpenGAMES(msg);
        break;
      case "STATS_USER":
        await bot.sendMessage(msg.chat.id, "TODO Stats - Under construction");
        break;
      case "GUIDE_GAMES":
        await helper.guide_games(msg);

        break;
      case "GUIDE_GAME":
        var t = callbackQuery.data.split("GUIDE_GAME_")[1];
        await games.guide(msg, t);
        break;

      case "INFO_GAMES":
        await helper.info_games(msg);
        break;
      case "GAME_INIT":
        var t = callbackQuery.data.split("GAME_INIT_")[1];
        await games.initGame(msg, t);
        break;
      case "GAME_PRICE":
        var t = callbackQuery.data.split("GAME_PRICE_")[1].split("_");
        await games.price(msg, t[0], t[1]);
        break;
      case "GAME_ACTION":
        var t = callbackQuery.data.split("GAME_ACTION_")[1].split("_");
        if (t[2] === "INPUT") {
          await bot.sendMessage(msg.chat.id, "Type the number of your choice");
        } else {
          await games.action(msg, t[0], t[1], t[2]);
        }
        break;
      case "GAME_SUMMARY":
        var t = callbackQuery.data.split("GAME_SUMMARY_")[1].split("_");

        if (t[3] === "INPUT") {
          await games.frequencyInput(msg);
          break;
        } else {
          await games.summary(msg, t[0], t[1], t[2], t[3]);
        }
        break;
      case "INVITE_CODES":
        await helper.invite_codes(msg);
        break;
      case "CREATE_5_CODES":
        await helper.create_5_codes(msg);
        break;
      case "FREE":
        var t = callbackQuery.data.split("FREE_")[1];
        await games.freeGame(msg, t);
        break;
      case "FREEGAME":
        var game = callbackQuery.data.split("FREEGAME_")[1].split("_")[0];
        var tiers = callbackQuery.data.split("FREEGAME_")[1].split("_")[1];
        var choice = callbackQuery.data.split("FREEGAME_")[1].split("_")[2];

        await games.freeGamePlayed(msg, game, tiers, choice);
        break;
      case "FREETIERSGAME":
        var game = callbackQuery.data.split("FREETIERSGAME_")[1];
        var tiers = callbackQuery.data.split("FREETIERSGAME_")[1];
        await games.freeGame(msg, game, tiers);
        break;
    }
  } else {
    await bot.sendMessage(msg.chat.id, "You are spamming the bot, please stop");
  }
  console.log("Delete from callback");
  helper.deleteProcessingMessages(msg, processing);
});
