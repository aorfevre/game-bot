"use strict";
require('dotenv').config()

process.env["NTBA_FIX_319"] = 1;
var init = require('./custo/init.js')

var helper = require('./custo/helper.js')

global.bot = init.setTelegram();

bot.on('message', async(msg) => {
  helper.updateUser(msg);
});


bot.onText(/^\/[start](.+|\b)/, (msg, match) => {
  try{

  
  var _markup = [];

  const struct = {
    price : 5,
    mode : 'rock', 
    user : msg.chat.id,
    game : 'RockPaperScissors'
  }
  const data5 = helper.encode(struct);


  const struct1 = {
    price : 1,
    mode : 'rock', 
    user : msg.chat.id,
    game : 'RockPaperScissors'
  }
  const data1 = helper.encode(struct);

  _markup.push([
    {
      text: "Pay 1 Rock",
      url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(data1),
    },
    
    {
      text: "Pay 5 Rock",
      url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(data5),
    },
    
  ]);
  _markup.push([
    {
      text: "Verify pending transactions",
      callback_data: "VERIFY_PENDING_TRANSACTIONS",
    }
    
  ]);
  

  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
          };
  bot.sendMessage(msg.chat.id, "Let's create a payment link",options)
}catch(e){
  console.log('error',e);
}

});

// callback queries
bot.on("callback_query", async (callbackQuery) => {
    var msg = callbackQuery.message;
    var control = callbackQuery.data;

    

  switch(control){
    case "VERIFY_PENDING_TRANSACTIONS":
      helper.findAllUnverifiedTransactions()
      break; 
  }
})