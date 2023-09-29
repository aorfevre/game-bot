var helper = require("../custo/helper.js");

module.exports.init = async(msg) => {

    let txt = `Short description of Prisoner Game\n\n`;

    txt += "What do you want to do ? ";
    var _markup = [];


    _markup.push([
      {
        text: "More info",
        callback_data: "GAME_PRISONER_INFO",
      },
      
    ]);
    _markup.push([
        {
          text: "1$",
          callback_data: "GAME_PRISONER_TIERS_1",
        },
        {
            text: "10$",
            callback_data: "GAME_PRISONER_TIERS_2",
          },
          {
            text: "100$",
            callback_data: "GAME_PRISONER_TIERS_3",
          },
      ]);
    _markup.push([
        {
          text: "Home",
          callback_data: "HOME",
        },
        
      ]);
    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup,
      }),
    };

    bot.sendMessage(msg.chat.id, txt, options);

};

module.exports.info = async(msg) => {

    let txt = `More info of Prisoner Game\n\n`;

    txt += "What do you want to do ? ";
    var _markup = [];


    _markup.push([
      {
        text: "Back to Prisoner Game",
        callback_data: "GAME_PRISONER",
      },
      
    ]);
    _markup.push([
        {
          text: "Home",
          callback_data: "HOME",
        },
        
      ]);

    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup,
      }),
    };

    bot.sendMessage(msg.chat.id, txt, options);

};

module.exports.tiers = async(msg,t) => {

    let txt = `Confirm again Game of Prisoner Game\n\n`;
     txt += `You are in Tiers ${t}\n\n`;

    txt += "What do you want to do ? ";
    var _markup = [];


    _markup.push([
      {
        text: "Back to Prisoner Game",
        callback_data: "GAME_PRISONER",
      },
      {
        text: "Back to GAMES",
        callback_data: "PLAY_MINI_GAMES",
      },
    ]);

    const struct = {
      tiers : t,
      price : t == 1 ? 1 : t == 2 ? 5 : 10,
      mode : 'cooperate',
      user : msg.chat.id,
      game : 'prisoner',
      date: new Date()
    }
    const cooperateData = helper.encode(struct);

    const struct1 = {
      tiers : t,
      price : t == 1 ? 1 : t == 2 ? 5 : 10,
      mode : 'betray',
      user : msg.chat.id,
      game : 'prisoner',
      date : new Date()
    }
    const betrayData = helper.encode(struct);

    _markup.push([
      {
        text: "Cooperate",
        url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(cooperateData),
      },

      {
        text: "Betray",
        url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(betrayData),
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

    bot.sendMessage(msg.chat.id, txt, options);

};



