"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();

var admin = require('./admin/ux.js')
var callback_queries = require('./admin/callback_queries.js')
var received_text = require('./admin/received_text.js')
var cron = require('./admin/cron.js')
var cron_calculate_aum = require('./admin/cron_calculate_aum.js')
var cron_all_balances = require('./admin/cron_all_balances.js')

var _db = require('./database/mongo_db.js')
var configChains = require('./chains/config.js')

_db.init()
//
bot.on('message', function(event) {
  if (event.text !== undefined &&
    event.text.toLowerCase().indexOf("@team") !== -1 && event.chat.id === -1001162960241) {
    var _txt = "☝️☝️☝️☝️☝️☝️☝️\n" + "@Simosss @solutionniste @aorfevrebr @blokcove"
    bot.sendMessage(event.chat.id, _txt)
  }
})