"use strict";

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')
global.bot = init.setTelegram();
//
bot.on('message', function(event) {
 
  
})

bot.onText(/^\/[p]ay(.+|\b)/, (msg, match) => {
  console.log('msg',msg)
  var _markup = [];
  _markup.push([
    {
      text: "Pay 5 Rock",
      url: "https://game-payment-urphktcmtq-ew.a.run.app?price=5&mode=rock",
    },
    
  ]);

  

  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
          };
  bot.sendMessage(msg.chat.id, "Let's create a payment link",options)

});