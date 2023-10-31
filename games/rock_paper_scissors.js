const { ethers } = require("ethers");
var db = require("../database/mongo.js");
const helper = require("../custo/helper.js");
const crypto = require("../custo/crypto.js");
var home = require("./home.js");

module.exports.getIntroText = async (msg) => {
  let txt = "🤔 <b>Rock Paper Scissors</b>\n\n";

  // Define the rules of rock paper scissors
  txt += "Rock beats scissors, scissors beats paper, paper beats rock.\n\n";
  txt += "If there is a draw, you can play another game for FREE! \n\n";

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

module.exports.duel = async () => {
  const tiers = home.getAllTiers();
  const promises = [];
  for (const i in tiers) {
    promises.push(this.duelByTiers(i));
  }
  await Promise.all(promises);
};

module.exports.shuffle = (txs) => {
  const shuffle = txs.sort(() => 0.5 - Math.random());
  const paired = [];
  for (let i = 0; i < shuffle.length; i += 2) {
    paired.push(shuffle.slice(i, i + 2));
  }
  return paired;
};
module.exports.getWinnerLooser = (tx1, tx2) => {
  let winner = null;
  let looser = null;
  let winnerTx = null;
  let looserTx = null;
  let draw = false;
  if (tx1.decoded?.action === tx2.decoded?.action) {
    // We have a draw
    draw = true;
  } else if (tx1.decoded?.action === "ROCK") {
    if (tx2.decoded?.action === "PAPER") {
      winner = tx2.decoded;
      looser = tx1.decoded;
      winnerTx = tx2;
      looserTx = tx1;
    } else if (tx2.decoded?.action === "SCISSORS") {
      winner = tx1.decoded;
      looser = tx2.decoded;
      winnerTx = tx1;
      looserTx = tx2;
    }
  } else if (tx1.decoded?.action === "PAPER") {
    if (tx2.decoded?.action === "ROCK") {
      winner = tx1.decoded;
      looser = tx2.decoded;
      winnerTx = tx1;
      looserTx = tx2;
    } else if (tx2.decoded?.action === "SCISSORS") {
      winner = tx2.decoded;
      looser = tx1.decoded;
      winnerTx = tx2;
      looserTx = tx1;
    }
  } else if (tx1.decoded?.action === "SCISSORS") {
    if (tx2.decoded?.action === "ROCK") {
      winner = tx2.decoded;
      looser = tx1.decoded;
      winnerTx = tx2;
      looserTx = tx1;
    } else if (tx2.decoded?.action === "PAPER") {
      winner = tx1.decoded;
      looser = tx2.decoded;
      winnerTx = tx1;
      looserTx = tx2;
    }
  }
  return { winner, looser, winnerTx, looserTx, draw };
};
module.exports.setIteration = async (trx) => {
  if (trx.decoded.number > 1) {
    const client = await db.getClient();
    const tx = await client
      .db("gaming")
      .collection("tx")
      .findOne({ _id: trx.primaryId });
    tx.decoded.number--;

    let copy = JSON.parse(JSON.stringify(tx));
    delete copy._id;
    copy.processed = false;
    copy._created_at = new Date();

    await client.db("gaming").collection("tx").insertOne(copy);
  } else {
    return;
  }
};

module.exports.setFreeGame = async (trx) => {
  const client = await db.getClient();
  const tx = await client
    .db("gaming")
    .collection("tx")
    .findOne({ _id: trx.primaryId });
  let copy = JSON.parse(JSON.stringify(tx));
  delete copy._id;
  delete copy.code;
  delete copy.draw;
  delete copy.decoded.action;
  copy.processed = false;
  copy.decoded.number = 1;
  copy._created_at = new Date();
  await client.db("gaming").collection("tx").insertOne(copy);
};
module.exports.duelByTiers = async (tiers) => {
  // find 2 unplayed game of rock paper scissors

  const client = await db.getClient();
  const txs = await helper.get_players_by_game_tiers(
    "ROCKPAPERSCISSORS",
    tiers,
  );
  // shuffle all txs
  const paired = this.shuffle(txs);
  for (const i in paired) {
    if (paired[i].length === 2 && paired[i][0].user !== paired[i][1].user) {
      // We have a duel
      // Compare the 2 txs
      const tx1 = paired[i][0];
      const tx2 = paired[i][1];

      const wl = this.getWinnerLooser(tx1, tx2);

      let winner = wl.winner;
      let looser = wl.looser;
      let winnerTx = wl.winnerTx;
      let looserTx = wl.looserTx;
      let draw = wl.draw;
      if (draw) {
        // We have a draw
        const txt = "You draw the duel! You can play another game for free!";
        const options_txt1 = {
          parse_mode: "HTML",
          disable_web_page_preview: true,

          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "🤔 PLAY A GAME FOR FREE ",
                  callback_data: "FREE_ROCKPAPERSCISSORS",
                },
              ],
            ],
          }),
        };
        const options_txt2 = {
          parse_mode: "HTML",
          disable_web_page_preview: true,

          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "🤔 PLAY A GAME FOR FREE ",
                  callback_data: "FREE_ROCKPAPERSCISSORS",
                },
              ],
            ],
          }),
        };
        if (process.env.JEST_TEST !== "1") {
          bot.sendMessage(tx1.decoded._id, txt, options_txt1);
          bot.sendMessage(tx2.decoded._id, txt, options_txt2);
        }
        const code = helper.generateCodes();

        const c = await client
          .db("gaming")
          .collection("tx")
          .countDocuments({ _id: tx1.primaryId });
        const c2 = await client
          .db("gaming")
          .collection("tx")
          .countDocuments({ _id: tx2.primaryId });

        const promises = [];
        promises.push(
          client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: tx1.primaryId },
              { $set: { processed: true, draw: true, code } },
            ),
        );
        promises.push(
          client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: tx2.primaryId },
              { $set: { processed: true, draw: true, code } },
            ),
        );

        promises.push(
          client
            .db("gaming")
            .collection("pvp")
            .insertOne({
              winner: null,
              looser: null,
              players: [tx1, tx2],
              date: new Date(),
              processed: true,
              draw: true,
              code,
            }),
        );
        promises.push(this.setIteration(tx1));
        promises.push(this.setIteration(tx2));
        promises.push(this.setFreeGame(tx1));
        promises.push(this.setFreeGame(tx2));
        await Promise.all(promises);
      } else if (winner && looser) {
        // pot size
        const pot = Number(winner.price + looser.price) * 0.9;
        const restPot = (Number(winner.price + looser.price) - pot) * 0.9;
        // send the money to the winner wallet* 0.9

        // Create pvp winner + looser in a new collection
        // Create a new collection for pvp
        const code = helper.generateCodes();
        await client.db("gaming").collection("pvp").insertOne({
          winner: winner._id,
          looser: looser._id,
          txWinner: winnerTx,
          txLooser: looserTx,
          pot: pot,
          restPot: restPot,
          date: new Date(),
          processed: false,
          code,
          draw: false,
        });

        // Send the money to the winner
        let receiptWinner = null;
        if (process.env.JEST_TEST !== "1") {
          receiptWinner = await crypto.transferTo(
            winnerTx.tx.from,
            pot,
            winnerTx.decoded.game,
          );
        } else {
          receiptWinner = { transactionHash: "0x123" };
        }
        const promises = [];
        promises.push(
          client
            .db("gaming")
            .collection("pvp")
            .updateOne({ code, processed: true }, { $set: { receiptWinner } }),
        );
        promises.push(
          client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: winnerTx.primaryId },
              {
                $set: {
                  processed: true,
                  paid: true,
                  status: "winner",
                  pot,
                  code,
                },
              },
            ),
        );
        promises.push(
          client
            .db("gaming")
            .collection("tx")
            .updateOne(
              { _id: looserTx.primaryId },
              {
                $set: { processed: true, status: "looser", paid: false, code },
              },
            ),
        );

        promises.push(this.setIteration(winnerTx));
        promises.push(this.setIteration(looserTx));
        await Promise.all(promises);

        if (process.env.JEST_TEST !== "1") {
          bot.sendMessage(
            winner._id,
            "You won the duel! You get " +
              pot +
              " ETH\n" +
              "<a href='" +
              process.env.PUBLIC_EXPLORER_URL +
              "/tx/" +
              receiptWinner.transactionHash +
              "'>View on Explorer</a>",
            { parse_mode: "HTML" },
          );
          bot.sendMessage(looser._id, "You loose the duel!");
        }

        crypto.looserPotTransfer("ROCKPAPERSCISSORS");
      }
    } else {
      // We have a single player
      // Do nothing
    }
  }
};

module.exports.freeGameByTiers = async (msg, game, tiers) => {
  // Need to group by tiers

  const options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,

    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "Rock",
            callback_data: "FREEGAME_" + game + "_" + tiers + "_ROCK",
          },
        ],
        [
          {
            text: "Paper",
            callback_data: "FREEGAME_" + game + "_" + tiers + "_PAPER",
          },
        ],
        [
          {
            text: "Scissors",
            callback_data: "FREEGAME_" + game + "_" + tiers + "_SCISSORS",
          },
        ],
      ],
    }),
  };
  bot.sendMessage(
    msg.chat.id,
    "Select the game you want to play for free!\n",
    options,
  );
};

module.exports.freeGamePlayed = async (msg, game, tiers, choice) => {
  const client = await db.getClient();

  const txs = await client
    .db("gaming")
    .collection("tx")
    .updateOne(
      {
        "decoded.game": game,
        "decoded._id": msg.chat.id,
        processed: false,
        "decoded.action": { $exists: false },
        "decoded.tiers": tiers,
      },
      { $set: { "decoded.action": choice, _created_at: new Date() } },
    );
  bot.sendMessage(
    msg.chat.id,
    "Free registration saved.\nWaiting for the other player to play",
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "🔙 Back to Home",
              callback_data: "HOME",
            },
          ],
        ],
      }),
    },
  );

  // update the last draw tx to be processed
};
