const { ethers } = require("ethers");
var db = require("../database/mongo.js");
const helper = require('../custo/helper.js')
const crypto = require('../custo/crypto.js')
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


  // find 2 unplayed game of rock paper scissors

  const client = await db.getClient();
  const txs = await client.db("gaming").collection("tx").find({ 'decoded.game': "ROCKPAPERSCISSORS", verified: true, processed: false }).toArray();

  // shuffle all txs 
  const shuffled = txs.sort(() => 0.5 - Math.random());

  //  pair every shuffled txs 
  const paired = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    paired.push(shuffled.slice(i, i + 2));
  }
  console.log('Paired',paired )
  for(const i in paired){
    if (paired[i].length === 2){
      // We have a duel 
      // Compare the 2 txs
      const tx1 = paired[i][0];
      const tx2 = paired[i][1];
      let winner =null;
      let looser =null;
      let winnerTx =null;
      let looserTx =null;
      if(tx1.decoded?.action === tx2.decoded?.action){
        // We have a draw
        // Do nothing
        // Inform user of the draw AND that he can play a game for free.  
        // TODO Free Credits. 
        bot.sendMessage(tx1.decoded._id, "You draw the duel! You can play another game for free!");
        bot.sendMessage(tx2.decoded._id, "You draw the duel! You can play another game for free!");
      }else if(tx1.decoded?.action === 'ROCK'){
        if(tx2.decoded?.action === 'PAPER'){
          winner = tx2.decoded;
          looser = tx1.decoded;
          winnerTx = tx2;
          looserTx = tx1;
        }else if(tx2.decoded?.action === 'SCISSORS'){
          winner = tx1.decoded;
          looser = tx2.decoded;
          winnerTx = tx1;
          looserTx = tx2;
        }
      }else if(tx1.decoded?.action === 'PAPER'){
        if(tx2.decoded?.action === 'ROCK'){
          winner = tx1.decoded;
          looser = tx2.decoded;
          winnerTx = tx1;
          looserTx = tx2;
        }else if(tx2.decoded?.action === 'SCISSORS'){
          winner = tx2.decoded;
          looser = tx1.decoded;
          winnerTx = tx2;
          looserTx = tx1;
        }
      }else if(tx1.decoded?.action === 'SCISSORS'){
        if(tx2.decoded?.action === 'ROCK'){
          winner = tx2.decoded;
          looser = tx1.decoded;
          winnerTx = tx2;
          looserTx = tx1;
        }else if(tx2.decoded?.action === 'PAPER'){
          winner = tx1.decoded;
          looser = tx2.decoded;
          winnerTx = tx1;
          looserTx = tx2;
        }
      }
      
      if(winner && looser){
        // pot size 
        const pot = Number(winner.price + looser.price)*0.9;
        const restPot = pot - Number(winner.price + looser.price);
        // send the money to the winner wallet* 0.9

        // Create pvp winner + looser in a new collection
        // Create a new collection for pvp
        const code = helper.generateCodes();
        await client.db("gaming").collection("pvp").insertOne({ winner: winner._id, looser: looser._id, txWinner:winnerTx, txLooser: looserTx, pot: pot, restPot: restPot, date: new Date(),processed:false,code});

        const receiptWinner = await crypto.transferTo(winnerTx.tx.to, pot, winnerTx.decoded.game);
        const receiptUs = await crypto.transferTo(process.env.MSIG_TEAM, restPot, winnerTx.decoded.game);
        await client.db('gaming').collection('pvp').updateOne({code,processed:false},{$set:{receiptWinner,receiptUs,processed:true}})
        client.db("gaming").collection("tx").updateOne({ _id: tx2._id }, { $set: { processed: true } });
        client.db("gaming").collection("tx").updateOne({ _id: tx1._id }, { $set: { processed: true } });
      
        bot.sendMessage(winner._id, "You won the duel! You will receive your prize shortly.");
        bot.sendMessage(looser._id, "You loose the duel!");
      }

    }else{
      // We have a single player
      // Do nothing
    }
  }






}
