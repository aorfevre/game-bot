module.exports.init = async(msg) => {

    let txt = `Short description of Number Guessing Game\n\n`;

    txt += "What do you want to do ? ";
    var _markup = [];


    _markup.push([
      {
        text: "More info",
        callback_data: "GAME_NUMBER_GUESSING_INFO",
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

    let txt = `More info of Number Guessing Game\n\n`;

    txt += "What do you want to do ? ";
    var _markup = [];


    _markup.push([
      {
        text: "Go back to Number Guessing Game",
        callback_data: "GAME_NUMBER_GUESSING",
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