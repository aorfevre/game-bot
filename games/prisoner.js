var helper = require("../custo/helper.js");
var home = require("./home.js");

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
  await bot.sendMessage(msg.chat.id, txt, {
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

module.exports.duel = async () => {
  const tiers = home.getAllTiers()
  const promises = [];
  for (const i in tiers) {
    promises.push(this.duelByTiers(i));
  }
  await Promise.all(promises);

};

module.exports.duelByTiers = async (tiers) => {
  try {
    const PARTICIPANTS = 2;

    const client = await db.getClient();

    // find all tx that have decoded.game = NUMBERGUESSING and verified = true and processed = false and find only one 'decoded._id' per match; limit to 10
    const tx = await client
      .db("gaming")
      .collection("tx")
      .aggregate([
        {
          $match: {
            "decoded.game": "PRISONER",
            verified: true,
            processed: false,
            "decoded.tiers": tiers,
          },
        },
        {
          $group: {
            _id: "$_id",
            decoded: { $first: "$decoded" },
            iteration: { $first: "$iteration" },
            score: { $first: "$score" },
          },
        },
        // add a variable called user with 'decoded._id' as value
        {
          $addFields: {
            user: "$decoded._id",
          },
        },
        {
          $limit: PARTICIPANTS,
        },
      ])
      .toArray();
    console.log("Start Duel => Tiers", tiers, tx.length);

    // count number of games NUMBERGUESSING in winners collection
    const count = await client
      .db("gaming")
      .collection("winners")
      .countDocuments({ game: "PRISONER" });

    // Print me _id of decoded
    if (tx.length > 0 && tx.length === PARTICIPANTS) {
      //
      //     if A.action === 'COOPERATE'
      //     Refund in full A & B
      //      Question : Do we take a fee?
      // else
      //     Loose everything

      // else
      // if A.action === 'COOPERATE'
      //     Send money to B
      // else
      //    Send Money to A

      if (tx[0].score === undefined) {
        tx[0].score = 0;
      }
      if (tx[1].score === undefined) {
        tx[1].score = 0;
      }
      const options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "🤔 Play Prisoner",
                callback_data: "GAME_INIT_PRISONER",
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
      };
      if (tx[0].decoded.action === tx[1].decoded.action) {
        // Both players cooperate or both players betray
        if (tx[0].decoded.action === "COOPERATE") {
          tx[0].score += 1;
          tx[1].score += 1;
          const txt =
            "<b>Prisoner Battle</b>\n\n" +
            "Both players cooperated\n\n" +
            "Both players get 1 point\n\n";
          bot.sendMessage(tx[0].decoded._id, txt, options);
          bot.sendMessage(tx[1].decoded._id, txt, options);
        } else {
          tx[0].score += 0;
          tx[1].score += 0;
          const txt =
            "<b>Prisoner Battle</b>\n\n" +
            "Both players betrayed\n\n" +
            "Both players get 0 point\n\n";
          bot.sendMessage(tx[0].decoded._id, txt, options);
          bot.sendMessage(tx[1].decoded._id, txt, options);
        }
      } else {
        // Choice are different
        if (tx[0].decoded.action === "COOPERATE") {
          tx[0].score += 0;
          tx[1].score += 2;
          bot.sendMessage(
            tx[0].decoded._id,
            "<b>Prisoner Battle</b>\n\n" +
              "You Cooperated and the other player Betrayed you!\n\n" +
              "You get 0 point. The other player get 2 points\n\n",
            options,
          );
          bot.sendMessage(
            tx[1].decoded._id,
            "<b>Prisoner Battle</b>\n\n" +
              "You Betrayed the other player that has cooperated!\n\n" +
              "You get 2 points. The other player get 0 point\n\n",
            options,
          );
        } else {
          tx[0].score += 2;
          tx[1].score += 0;
          bot.sendMessage(tx[0].decoded._id, txt, options);
          bot.sendMessage(
            tx[1].decoded._id,
            "<b>Prisoner Battle</b>\n\n" +
              "You Cooperated and the other player Betrayed you!\n\n" +
              "You get 0 point. The other player get 2 points\n\n",
            options,
          );
        }
      }

      for (const i in tx) {
        if (tx[i].iteration === undefined) {
          tx[i].iteration = 0;
        }
        tx[i].iteration += 1;

        if (tx[i].iteration === Number(tx[i].decoded.number)) {
          await client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: tx[i]._id },
              {
                $set: {
                  iteration: tx[i].iteration,
                  processed: true,
                  score: tx[i].score,
                  _updated_at: new Date(),
                },
              },
            );
        } else {
          await client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: tx[i]._id },
              {
                $set: {
                  iteration: tx[i].iteration,
                  processed: false,
                  score: tx[i].score,
                  _updated_at: new Date(),
                },
              },
            );
        }
      }
    } else {
      // Stop looping
    }
  } catch (e) {
    console.log("Error", e);
  }
};
