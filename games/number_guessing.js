const { ethers } = require("ethers");
var db = require("../database/mongo.js");
var home = require("./home.js");
const helper = require("../custo/helper.js");
const crypto = require("../custo/crypto.js");

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

module.exports.guide =  (msg, t) => {
  const txt =
    "<b>Guide: Guess the Number</b>\n\n" +
    "10 players join a match.\n" +
    "Each player guesses a number between 0 and 100.\n\n" +
    "Whoever is closest to the average number guessed * 2/3 wins the prize pool.\n\n" +
    "The prize pool is made up of all entry fees paid by players. minus a platform fee (currently set to "+RATE_FEE+"%).\n\n";
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
    prizePool += ((tx[i].decoded.price * 1000) / 1000) * (100 - RATE_FEE)/100;
    gameFee += ((tx[i].decoded.price * 1000) / 1000) * RATE_FEE/100;
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
    const diff = Math.abs(twoThirds - Number(tx[i].decoded.action));
    if (closest === 100 || diff < closest) {
      closest = diff;
    }
  }
  for (const i in tx) {
    if (
      Number(tx[i].decoded.action) === twoThirds - closest ||
      Number(tx[i].decoded.action) === twoThirds + closest
    ) {
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
    const PARTICIPANTS = 2;

    const client = await db.getClient();

    // find all tx that have decoded.game = NUMBERGUESSING and verified = true and processed = false and find only one 'decoded._id' per match; limit to 10
    const txs = await helper.get_players_by_game_tiers("NUMBERGUESSING", tiers);
    const tx = txs.splice(0,PARTICIPANTS);

    // Print me _id of decoded
    if (tx.length > 0 && tx.length === PARTICIPANTS) {
      const result = await this.getWinnersLoosers(tx);
      console.log('result',result)
      // // Save the winner state
      await client.db(DB_STAGE).collection("pvp").insertOne(result);

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
        const pot = result.prizePool ;

      const promises = [];

      if (process.env.JEST_TEST !== "1") {
        let receiptWinner = null;
        // pay winners
        if (result.winners.length > 1) {
          // disperse

          const disperse = require("../custo/disperse.js");
          const arrWinners = [];
          for (const i in result.winners) {
            arrWinners.push({
              address: result.winners[i].tx.from,
              value: pot / result.winners.length,
            });
          }
          receiptWinner = disperse.pay(
            arrWinners,
            process.env.PK_NUMBERGUESSING
          );
        } else if (result.winners.length === 1) {
          receiptWinner = await crypto.transferTo(
            result.winners[0].tx.from,
            pot,
            result.winners[0].decoded.game
          );
        } else {
          receiptWinner = { transactionHash: "0x123" };
        }

        // save receipt
        promises.push(
          client
            .db(DB_STAGE)
            .collection("pvp")
            .updateOne(
              { code: result.code, processed: true },
              { $set: { receiptWinner } }
            )
        );

        for (const i in result.winners) {
          promises.push(
            client
              .db(DB_STAGE)
              .collection("tx")
              .updateOne(
                { _id: result.winners[i].primaryId },
                {
                  $set: {
                    processed: true,
                    paid: true,
                    status: "winner",
                    pot,
                    code: result.code,
                  },
                }
              )
          );
          promises.push(helper.setIteration(result.winners[i]));

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
                backHomeBtn
              ],
            }),
          });
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
            promises.push(
              client
                .db(DB_STAGE)
                .collection("tx")
                .updateOne(
                  { _id: result.loosers[i].primaryId },
                  {
                    $set: {
                      processed: true,
                      status: "looser",
                      paid: false,
                      code: result.code,
                    },
                  }
                )
            );
            promises.push(helper.setIteration(result.loosers[i]));

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
                  backHomeBtn
                ],
              }),
            });
          }
          promises.push(crypto.looserPotTransfer("NUMBERGUESSING"));
        }

        await Promise.all(promises);

      } else {
        // Stop looping
      }
    }
  } catch (e) {
    console.log("Error", e);
  }
};
