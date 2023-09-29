"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();
//
bot.on('message', function(event) {
 
    console.log('Event', event)
      bot.sendMessage(event.chat.id, "Pong")
  
})
