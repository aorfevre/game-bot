"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();
//
bot.on('message', function(event) {
 
})
