var helper = require("../custo/helper.js");

module.exports.getIntroText = async (msg) => {
  let txt = "🚨  <b>Prisoner's Dilemma</b>\n\n";

  txt +=
    "Cooperate with or betray the other player to earn points for the tournament leaderboard.\n\n";

  txt +=
    "The tournament prize pool will be paid out to players based on their points and leaderboard position.\n\n";

  txt += "The next tournament ends in: xx hours yy minutes";
  return txt;
};

module.exports.getActions = async (tiers) => {
  return [
    [
      {
        text: "Cooperate",
        callback_data: "GAME_ACTION_PRISONER_" + tiers + "_COOPERATE",
      },
    ],
    [
      {
        text: "Betray",
        callback_data: "GAME_ACTION_PRISONER_" + tiers + "_BETRAY",
      },
    ],
  ];
};

module.exports.actionText = () => {
  return (
    "(You can select multiple plays to save gas costs)\n\n" +
    "(Your plays will be randomly matched with other players)\n\n" +
    "(You can make additional plays later while the tournament is running)\n\n"
  );
};

module.exports.guide = async (msg) => {
  let txt = "<b>Guide: Prisoner's Dilemma</b>\n\n";

  txt +=
    "Each match is played 1v1. You can select 1 of 2  potential actions: \n" +
    "1) Cooperate \n2) Betray\n\n" +
    "Points are distributed based on this payoff matrix";
  await bot.sendMessage(msg.chat.id, txt,{
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  await bot.sendPhoto(msg.chat.id, "./images/prisoner_guide_image.png");

  txt =
    "All matches within a period are part of a tournament.\n\n" +
    "All points a player accrues during this period count towards the tournament leaderboard. \n\n" +
    "All entry fees paid by players are collected in the tournament prize pool, minus a platform fee (currently set to 10%).\n\n" +
    "After the tournament period ends, players will be paid from the prize pool.\n\n" +
    "A new tournament will start automatically";

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "🚨 Play Prisoner's Dilemma",
            callback_data: "GAME_INIT_PRISONER",
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
