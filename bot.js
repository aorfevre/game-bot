"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();
const checkBalance = require('./custo/checkBalance.js')
//
bot.on('message', function(event) {
  if (event.text !== undefined &&
    event.text.toLowerCase().indexOf("@team") !== -1 && event.chat.id === -1001746527561) {
    var _txt = "☝️☝️☝️☝️☝️☝️☝️\n" + "@jr_yellow @Cryptoswiss108 @charlym04 @cto_rp"
    bot.sendMessage(event.chat.id, _txt,{reply_to_message_id: event.message_id})
  }

})
