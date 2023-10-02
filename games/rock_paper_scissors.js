const { ethers } = require("ethers");
var db = require("../database/mongo.js");

module.exports.getIntroText = async (msg) => {
  let txt = "🤔 <b>Rock Paper Scissors</b>\n\n";

  // Define the rules of rock paper scissors 
  txt += "Rock beats scissors, scissors beats paper, paper beats rock.\n\n";
  txt += "If there is a draw, you can play another game for FREE! \n\n"

  return txt;
};
module.exports.getSpecificActionMsg = () => {
  return "";
};
module.exports.getActions = async (tiers) => {
  return [
    [
      {
        text: "Rock",
        callback_data: "GAME_ACTION_ROCKPAPERSCISSORS_" + tiers + "_ROCK",
      },
    ],
    [
      {
        text: "Paper",
        callback_data: "GAME_ACTION_ROCKPAPERSCISSORS_" + tiers + "_PAPER",
      },
    ],
    [
      {
        text: "Scissors",
        callback_data: "GAME_ACTION_ROCKPAPERSCISSORS_" + tiers + "_SCISSORS",
      },
    ],
  ];
};
module.exports.actionText = () => {
  return (
    "(You can select multiple plays to save gas costs)\n\n" +
    "(Your plays will be randomly matched with other players.Only one guess of yours will be used on every match)"
  );
};

module.exports.guide = async (msg, t) => {
  const txt =
    "<b>Guide: Rock Paper Scissors</b>\n\n" +
    "2 players join a match.\n" +
    "Each player guesses a Rock, Paper or Scissors.\n\n" +
    "Rock beats scissors, scissors beats paper, paper beats rock.\n\n" + 
    "Whoever is closest to the average number guessed * 2/3 wins the prize pool.\n\n";

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "🤔 Play Guess the Number",
            callback_data: "GAME_INIT_ROCKPAPERSCISSORS",
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
};
