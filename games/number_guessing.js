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
  return txt;
};
module.exports.payout = async () => {
  const tiers = home.getAllTiers();
  const promises = [];
  for (const i in tiers) {
    promises.push(this.payoutByTiers(i));
  }
  await Promise.all(promises);
};

module.exports.getWinnersLoosers = async (tx) => {
  // calculate prize pool
  let prizePool = 0;
  let gameFee = 0;
  let sum = 0;

  // We have participants for number guessing
  // We need to find the winner

  // Sum all decoded.action
  for (const i in tx) {
    sum += Number(tx[i].decoded.action);
    prizePool += ((tx[i].decoded.price * 1000) / 1000) * 0.9;
    gameFee += ((tx[i].decoded.price * 1000) / 1000) * 0.1;
  }
  // Calculate average
  const avg = sum / tx.length;
  // Calculate 2/3 of average
  const twoThirds = (avg * 2) / 3;
  // Find the closest to 2/3 of average
  let closest = 100;
  const winners = [];
  const loosers = [];
  for (const i in tx) {
    const diff = Math.abs(twoThirds - Number(tx[i].decoded.action)) ;
    if (closest === 100 || diff < closest) {

      closest = diff;
    }
  }
  for (const i in tx) {
    if ((Number(tx[i].decoded.action) === (twoThirds- closest)) || 
        (Number(tx[i].decoded.action) === (twoThirds+ closest))) {
      winners.push(tx[i]);
    } else {
      loosers.push(tx[i]);
    }
  }


  const code = helper.generateCodes();

  const result = {
    winners,
    loosers,
    game: "NUMBERGUESSING",
    prizePool,
    avg,
    twoThirds,
    closest,
    gameFee,
    _created_at: new Date(),
    code,
  };
  return result;
};
module.exports.payoutByTiers = async (tiers) => {
  try {
    const PARTICIPANTS = 10;

    const client = await db.getClient();

    // find all tx that have decoded.game = NUMBERGUESSING and verified = true and processed = false and find only one 'decoded._id' per match; limit to 10
    const tx = await helper.get_players_by_game_tiers("NUMBERGUESSING", tiers);

    // count number of games NUMBERGUESSING in winners collection
    const count = await client
      .db("gaming")
      .collection("winners")
      .countDocuments({ game: "NUMBERGUESSING" });

    // Print me _id of decoded
    if (tx.length > 0 && tx.length === PARTICIPANTS) {
      const result = await this.getWinnersLoosers(tx);

      console.log("Result", result);
      // // Save the winner state
      await client.db("gaming").collection("pvp").insertOne(result);

      let txtWinner =
        "<b>Match results</b>\n\n" +
        "Guess the Number match #" +
      result.code +
        " has finished\n\n" +
        "You won!\n\n" +
        "Prize pool: " +
        result.prizePool +
        " ETH\n\n" +
        "Your prize has been paid out\n\n";

      if (process.env.JEST_TEST !== "1") {
        for(const i in result.winners){
          bot.sendMessage(result.winners[i].decoded._id, txtWinner, {
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
        
      }

      // send bot message to Loosers
      let txtLoosers =
        "<b>Match results</b>\n\n" +
        "Guess the Number match #" +
       result.code +
        " has finished\n\n" +
        "You didn't win.\n\n" +
        "Prize pool: " +
        result.prizePool +
        " ETH\n\n" +
        "Your prize has been paid out\n\n";

      if (process.env.JEST_TEST !== "1") {
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
