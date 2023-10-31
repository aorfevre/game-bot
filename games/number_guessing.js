const { ethers } = require("ethers");
var db = require("../database/mongo.js");
var home = require("./home.js");
const helper = require("../custo/helper.js");

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

module.exports.guide = async (msg, t) => {
  const txt =
    "<b>Guide: Guess the Number</b>\n\n" +
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
};
module.exports.payout = async () => {
 
  const tiers = home.getAllTiers()
  const promises = [];
  for (const i in tiers) {
    promises.push(this.payoutByTiers(i));
  }
  await Promise.all(promises);

};

module.exports.payoutByTiers = async (tiers) => {
  try {
    const PARTICIPANTS = 10;

    const client = await db.getClient();

    // find all tx that have decoded.game = NUMBERGUESSING and verified = true and processed = false and find only one 'decoded._id' per match; limit to 10
    const tx = await helper.get_players_by_game_tiers(
      "NUMBERGUESSING",
      tiers
    );
    console.log("Start Payout => Tiers", tiers, tx.length);

    // count number of games NUMBERGUESSING in winners collection
    const count = await client
      .db("gaming")
      .collection("winners")
      .countDocuments({ game: "NUMBERGUESSING" });

    console.log("tx", tx.length);
    // Print me _id of decoded
    if (tx.length > 0 && tx.length === PARTICIPANTS) {
      // calculate prize pool
      let prizePool = 0;
      let gameFee = 0;
      // We have participants for number guessing
      // We need to find the winner

      // Sum all decoded.action
      let sum = 0;
      for (const i in tx) {
        console.log("tx[i]", tx[i]);
        sum += Number(tx[i].decoded.action);
        prizePool += ((tx[i].decoded.price * 1000) / 1000) * 0.9;
        gameFee += ((tx[i].decoded.price * 1000) / 1000) * 0.1;

        if (tx[i].iteration === undefined) {
          tx[i].iteration = 0;
        }
        tx[i].iteration++;
      }
      // Calculate average
      const avg = sum / tx.length;
      // Calculate 2/3 of average
      const twoThirds = (avg * 2) / 3;
      // Find the closest to 2/3 of average
      let closest = 0;
      let winner = null;

      for (const i in tx) {
        const diff = Math.abs(twoThirds - Number(tx[i].decoded.action));
        if (closest === 0 || diff < closest) {
          closest = diff;
          winner = tx[i];
        }

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
                  _updated_at: new Date(),
                },
              },
            );
        }
      }
      // find all loosers
      const loosers = [];
      for (const i in tx) {
        if (winner._id !== tx[i]._id) {
          loosers.push(tx[i]);
        }
      }

      winner.prizePool = prizePool;
      winner.gameFee = gameFee;
      winner._created_at = new Date();

      const result = {
        winner,
        loosers,
        game: "NUMBERGUESSING",
        prizePool,
        gameFee,
        _created_at: new Date(),
        winnerId: winner._id,
        loosersIds: loosers.map((l) => l._id),
        match: count + 1,
      };
      // // Save the winner state
      await client.db("gaming").collection("winners").insertOne(result);

      let txtWinner =
        "<b>Match results</b>\n\n" +
        "Guess the Number match #" +
        (count + 1) +
        " has finished\n\n" +
        "You won!\n\n" +
        "Prize pool: " +
        prizePool +
        " ETH\n\n" +
        "Your prize has been paid out\n\n";

      bot.sendMessage(result.winner.decoded._id, txtWinner, {
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
                text: "🔙 Back to Home",
                callback_data: "HOME",
              },
            ],
          ],
        }),
      });

      // send bot message to Loosers
      let txtLoosers =
        "<b>Match results</b>\n\n" +
        "Guess the Number match #" +
        (count + 1) +
        " has finished\n\n" +
        "You didn't win.\n\n" +
        "Prize pool: " +
        prizePool +
        " ETH\n\n" +
        "Your prize has been paid out\n\n";

      for (const i in result.loosers) {
        bot.sendMessage(result.loosers[i].decoded._id, txtLoosers, {
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
                  text: "🔙 Back to Home",
                  callback_data: "HOME",
                },
              ],
            ],
          }),
        });
      }

      // Send the prize pool in ETH to the winner pool wallet using etherjs

      // Send the game fee to the platform pool
    } else {
      // Stop looping
    }
  } catch (e) {
    console.log("Error", e);
  }
};
