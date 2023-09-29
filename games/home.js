 // const struct = {
    //   price : 5,
    //   mode : 'rock',
    //   user : msg.chat.id,
    //   game : 'RockPaperScissors'
    // }
    // const data5 = helper.encode(struct);

    // const struct1 = {
    //   price : 1,
    //   mode : 'rock',
    //   user : msg.chat.id,
    //   game : 'RockPaperScissors'
    // }
    // const data1 = helper.encode(struct);

    // _markup.push([
    //   {
    //     text: "Pay 1 Rock",
    //     url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(data1),
    //   },

    //   {
    //     text: "Pay 5 Rock",
    //     url: process.env.PUBLIC_URL +"?hash="+encodeURIComponent(data5),
    //   },

    // ]);
    // _markup.push([
    //   {
    //     text: "Verify pending transactions",
    //     callback_data: "VERIFY_PENDING_TRANSACTIONS",
    //   }

    // ]);

    module.exports.init = async(msg) => {

        let txt = `Short description of the games\n\n`;
  
        txt += "What do you want to do ? ";
        var _markup = [];
  
        _markup.push([
          {
            text: "Prisoner’s Dilemma",
            callback_data: "GAME_PRISONER",
          },
        ]);
  
        _markup.push([
          {
            text: "Number Guessing",
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