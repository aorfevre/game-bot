module.exports.getIntroText = async (msg) => {
  let txt = "🤔 <b>Guess the Number</b>\n\n";

  txt += "Guess a number between 0 and 100.\n\n";

  txt +=
    "The winner is whoever is closest to 2/3 * the average guess and takes home the prize pool.\n\n";

  txt += "Players per game: 10";
  return txt;
};
module.exports.getSpecificActionMsg = () => {
  return "(Remember: You want to be close to 2/3 of the average)";
};
module.exports.getActions = async (tiers) => {
  return [
    [
      {
        text: "Input guess",
        callback_data: "GAME_ACTION_NUMBERGUESSING_" + tiers + "_INPUT",
      },
    ],
  ];
};
module.exports.actionText = () => {
  return (
    "(You can select multiple plays to save gas costs)\n\n" +
    "(Your plays will be randomly matched with other players.Only one guess of yours will be used per 10-player match)"
  );
};

module.exports.guide = async (msg,t) => {

    const txt = "<b>Guide: Guess the Number</b>\n\n" +
    "10 players join a match.\n" +
    "Each player guesses a number between 0 and 100.\n\n" +
    "Whoever is closest to the average number guessed * 2/3 wins the prize pool.\n\n" +
    "The prize pool is made up of all entry fees paid by players. minus a platform fee (currently set to 10%).\n\n";
    
    bot.sendMessage(msg.chat.id, txt, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "🤔 Play Guess the Number",
                callback_data: "GAME_INIT_NUMBERGUESSING",
              },
            ],
            [
              {
                text: "🔙 Back to Guides",
                callback_data: "GUIDE_GAMES",
              },
            ],
            [
              {
                text: "🔙 Back to Home",
                callback_data: "HOME",
              },
            ],
          ],
        }),
      });
}

// module.exports.init = async(msg) => {

//     let txt = `Short description of Number Guessing Game\n\n`;

//     txt += "What do you want to do ? ";
//     var _markup = [];

//     _markup.push([
//       {
//         text: "More info",
//         callback_data: "GAME_NUMBERGUESSING_INFO",
//       },

//     ]);
//     _markup.push([
//         {
//           text: "🔙 Back to Home",
//           callback_data: "HOME",
//         },

//       ]);
//     var options = {
//       parse_mode: "HTML",
//       disable_web_page_preview: true,
//       reply_markup: JSON.stringify({
//         inline_keyboard: _markup,
//       }),
//     };

//     bot.sendMessage(msg.chat.id, txt, options);

// };

// module.exports.info = async(msg) => {

//     let txt = `More info of Number Guessing Game\n\n`;

//     txt += "What do you want to do ? ";
//     var _markup = [];

//     _markup.push([
//       {
//         text: "Go back to Number Guessing Game",
//         callback_data: "GAME_NUMBERGUESSING",
//       },

//     ]);
//     _markup.push([
//         {
//           text: "🔙 Back to Home",
//           callback_data: "HOME",
//         },

//       ]);

//     var options = {
//       parse_mode: "HTML",
//       disable_web_page_preview: true,
//       reply_markup: JSON.stringify({
//         inline_keyboard: _markup,
//       }),
//     };

//     bot.sendMessage(msg.chat.id, txt, options);

// };
