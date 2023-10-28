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
  const tiers = ["1","2","3"];
  for (const i in tiers) {
    await this.duelByTiers(tiers[i]);
  }
};

module.exports.shuffle = (txs) => {
  const shuffle  = txs.sort(() => 0.5 - Math.random());
  const paired = [];
  for (let i = 0; i < shuffle.length; i += 2) {
    paired.push(shuffle.slice(i, i + 2));
  }
  return paired;
}
module.exports.getWinnerLooser = (tx1,tx2) => {
  let winner =null;
  let looser =null;
  let winnerTx =null;
  let looserTx =null;
  let draw=false;
  if(tx1.decoded?.action === tx2.decoded?.action){
    // We have a draw
    draw=true;
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
  return {winner, looser, winnerTx, looserTx, draw};
}
module.exports.setIteration = async(trx)=>{
  if(trx.decoded.number > 1){
    const client = await db.getClient();
    const tx = await client.db("gaming").collection("tx").findOne({ _id:trx.primaryId });
    tx.decoded.number -- ;
  
    let copy = JSON.parse(JSON.stringify(tx));
    delete copy._id; 
    copy.processed = false

    await client.db("gaming").collection("tx").insertOne(copy);

  }else{
    return;
  }
}
module.exports.duelByTiers = async (tiers) => {


  // find 2 unplayed game of rock paper scissors

  const client = await db.getClient();
  const txs = await helper.get_players_by_game_tiers("ROCKPAPERSCISSORS", tiers);
 
  // shuffle all txs 
  const paired = this.shuffle(txs);
  for(const i in paired){
    if (paired[i].length === 2 && paired[i][0].user !== paired[i][1].user){

      // We have a duel 
      // Compare the 2 txs
      const tx1 = paired[i][0];
      const tx2 = paired[i][1];

      const wl = this.getWinnerLooser(tx1,tx2);

      let winner =wl.winner;
      let looser =wl.looser;
      let winnerTx =wl.winnerTx;
      let looserTx =wl.looserTx;
      let draw =wl.draw;
      if(draw){
        console.log('Draw')
        // We have a draw
        const txt = "You draw the duel! You can play another game for free!";
        const options_txt1 = {
          parse_mode:'HTML',
          disable_web_page_preview:true,
          
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "🤔 PLAY A GAME FOR FREE ",
                  callback_data: "FREE_" + tx1._id,
                },
              ],
            
            ],
          })
        }
        const options_txt2 = {
          parse_mode:'HTML',
          disable_web_page_preview:true,
          
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "🤔 PLAY A GAME FOR FREE ",
                  callback_data: "FREE_" + tx2._id,
                },
              ],
            ],
          })
        }
        if(process.env.JEST_TEST !== '1'){

          bot.sendMessage(tx1.decoded._id,txt ,options_txt1);
          bot.sendMessage(tx2.decoded._id,txt ,options_txt2);
        }
        client.db("gaming").collection("tx").updateOne({ _id:tx1._id }, { $set: {  processed:true,draw:true,draw_processed:false } });
        client.db("gaming").collection("tx").updateOne({ _id:tx2._id }, { $set: {  processed:true,draw:true,draw_processed:false } });

      }else if(winner && looser){
        // pot size 
        const pot = Number(winner.price + looser.price)*0.9;
        const restPot = (Number(winner.price + looser.price) - pot)*0.9;
        // send the money to the winner wallet* 0.9

        // Create pvp winner + looser in a new collection
        // Create a new collection for pvp
        const code = helper.generateCodes();
        await client.db("gaming").collection("pvp").insertOne({ winner: winner._id, looser: looser._id, txWinner:winnerTx, txLooser: looserTx, pot: pot, restPot: restPot, date: new Date(),processed:false,code});

        // Send the money to the winner
        let receiptWinner = null
        if(process.env.JEST_TEST !== '1'){
           receiptWinner = await crypto.transferTo(winnerTx.tx.from, pot, winnerTx.decoded.game);
        }else {
          receiptWinner = {transactionHash:'0x123'}
        }
        await client.db('gaming').collection('pvp').updateOne({code,processed:false},{$set:{receiptWinner,processed:'partially'}})
        await client.db("gaming").collection("tx").updateOne({ _id: winnerTx.primaryId }, { $set: { processed: true, status : 'winner' , pot } });
        await client.db("gaming").collection("tx").updateOne({ _id: looserTx.primaryId }, { $set: { processed: true, status : 'looser', paid:false } });
       
        this.setIteration(winnerTx);
        this.setIteration(looserTx);
        // check if it is necessary to send us the money. 
        
        // Sum all tx of loosers that are not processed
        // console.log('GAME IS PROCESSED LOOSERS')

        // const txsLoosers = await client.db("gaming").collection("tx").find({ verified: true, 'decoded.game': 'ROCKPAPERSCISSORS', processed:true,paid:false }).toArray();
        // let sumLoosers = 0;
        // for(const i in txsLoosers){
        //   sumLoosers += Number(txsLoosers[i].price);
        // }
        // console.log('sumLoosers',txsLoosers,sumLoosers)
        // if(sumLoosers > 0.1){
        //   // // Send us the money
        //   // let receiptUs = null
        //   // if(process.env.JEST_TEST !== '1'){
        //   //    receiptUs = await crypto.transferTo(process.env.MSIG_TEAM, sumLoosers, winnerTx.decoded.game);

        //   //   bot.sendMessage(DD_FLOOD,"POT send to us => " + sumLoosers + " ETH\n" + "<a href='" + process.env.PUBLIC_EXPLORER_URL + "/tx/" + receiptUs.transactionHash + "'>View on Explorer</a>",{parse_mode:'HTML'});
        //   // }else{
        //   //   receiptUs = {transactionHash:'0x123'}
        //   // }

        //   // await client.db('gaming').collection('pvp').updateOne({code,processed:false},{$set:{receiptUs,processed:true}})
        //   // for(const i in txsLoosers){
        //   //   client.db("gaming").collection("tx").updateOne({ _id: txsLoosers[i]._id }, { $set: {  paid:true } });
        //   // }
        // }else{
        //   client.db("gaming").collection("tx").updateOne({ _id: looserTx._id }, { $set: { processed: true, paid:false } });
        //   if(process.env.JEST_TEST !== '1'){
         
        //     bot.sendMessage(DD_FLOOD,"Game Paper Scissors pot size : " + sumLoosers + " ETH ");
        //   }
        // }
        if(process.env.JEST_TEST !== '1'){
          bot.sendMessage(winner._id, "You won the duel! You get " + pot + " ETH\n" + "<a href='" + process.env.PUBLIC_EXPLORER_URL + "/tx/" + receiptWinner.transactionHash + "'>View on Explorer</a>",{parse_mode:'HTML'});
          bot.sendMessage(looser._id, "You loose the duel!");
        }
      }

    }else{
      // We have a single player
      // Do nothing
    }
  }






}


module.exports.freeGame = async (msg,tx)=>{
  if(tx.draw_processed === true){
    return;
  }
  const client = await db.getClient();

  const options = {
    parse_mode:'HTML',
    disable_web_page_preview:true,
    
    reply_markup: JSON.stringify({
      inline_keyboard: 
        [
          [
            {
              text: "Rock",
              callback_data: "FREEGAME_" + tx._id + "_ROCK",
            },
          ],
          [
            {
              text: "Paper",
              callback_data: "FREEGAME_" + tx._id + "_PAPER",
            },
          ],
          [
            {
              text: "Scissors",
              callback_data: "FREEGAME_" + tx._id + "_SCISSORS",
            },
          ],
      
      
      ],
    })
  }
  await client.db("gaming").collection("tx").updateOne({ _id:tx._id }, { $set: {  draw_processed:true } });
  
  bot.sendMessage(msg.chat.id,"Select the game you want to play for free!",options);
}

module.exports.freeGamePlayed = async (msg,tx,choice) =>{
  
  const client = await db.getClient();

  let txFree = {
    txhash: tx.txhash,
    hash : tx.hash,
    decoded_source:tx.decoded,
    decoded:{
      game: tx.decoded.game,
      tiers: tx.decoded.tiers,
      price: tx.decoded.price,
      number : 1,
      action: choice,
      _id: msg.chat.id,
    },
    tx,
    _created_at: new Date(),
    verified: true,
    processed: false,
    source:'free_draw'
  };

  const txs = await client.db("gaming").collection("tx").insertOne(txFree);
  bot.sendMessage(tx.decoded._id, "Free registration saved.\nWaiting for the other player to play", { parse_mode: "HTML" ,disable_web_page_preview:true, 
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "🔙 Back to Home",
          callback_data: "HOME",
        },
      ],
    ],
  })});

  // update the last draw tx to be processed 
}