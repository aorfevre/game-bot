"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();
console.log("start")
//
bot.on('message', function(event) {
  console.log("event message", event)
  if (event.text !== undefined &&
    event.text.toLowerCase().indexOf("@team") !== -1 && event.chat.id === -1001162960241) {
    var _txt = "☝️☝️☝️☝️☝️☝️☝️\n" + "@Simosss @solutionniste @aorfevrebr @blokcove"
    bot.sendMessage(event.chat.id, _txt)
  }

})