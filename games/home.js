var db = require("../database/mongo.js");
var prisoner = require("./prisoner.js");
var number_guessing = require("./number_guessing.js");
var centipede = require("./centipede.js");
var helper = require("../custo/helper.js");

module.exports.structChoice = () => {
  return {
    game: null,
    mode: null,
    price: null,
    tiers: null,
    action: null,
    number: null,
    _updated_at: new Date(),
  };
};
module.exports.getPriceByTiers = (tiers) => {
  // Price by tiers
  let priceEth = 0.0006;
  switch (tiers) {
    case "1":
      priceEth = 0.0006;
      break;
    case "2":
      priceEth = 0.003;
      break;
    case "3":
      priceEth = 0.012;
      break;
  }
  return priceEth;
};

module.exports.init = async (msg) => {
  let txt = `➡️ Which game would you like to play?`;
  var _markup = [];

  _markup.push([
    {
      text: "🚨 Prisoner's Dilemma",
      callback_data: "GAME_INIT_PRISONER",
    },
  ]);

  _markup.push([
    {
      text: "🤔 Guess the Number",
      callback_data: "GAME_INIT_NUMBERGUESSING",
    },
  ]);

  //   _markup.push([
  //     {
  //       text: "🐛 Centipede game",
  //       callback_data: "GAME_INIT_CENTIPEDE",
  //     },
  //   ]);

  _markup.push([
    {
      text: "Learn more about the games",
      callback_data: "GUIDE_GAMES",
    },
  ]);
  _markup.push([
    {
      text: "🔙 Back to Home",
      callback_data: "HOME",
    },
  ]);
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  };

  await bot.sendMessage(msg.chat.id, txt, options);
};

module.exports.initGame = async (msg, t) => {
  // save in db user choice
  const client = await db.getClient();

  let curData = this.structChoice();
  curData.game = t;
  const user_choice = await client
    .db("gaming")
    .collection("user_choice")
    .updateOne(
      { _id: msg.chat.id },
      {
        $set: curData,
      },
      { upsert: true }
    );
  let intro = "";
  switch (t) {
    case "PRISONER":
      intro = await prisoner.getIntroText();
      break;
    case "NUMBERGUESSING":
      intro = await number_guessing.getIntroText();
      break;
    case "CENTIPEDE":
      intro = await centipede.getIntroText();
      break;
  }

  await bot.sendMessage(msg.chat.id, intro, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  let txt = "➡️  How much would you like to bet per play?\n\n";
  txt += "(Tournaments are divided by bet amounts)";
  var _markup = [];

  _markup.push([
    {
      text: "0,0006 ETH",
      callback_data: "GAME_PRICE_" + t + "_1",
    },
    {
      text: "0,003 ETH",
      callback_data: "GAME_PRICE_" + t + "_2",
    },
    {
      text: "0,012 ETH",
      callback_data: "GAME_PRICE_" + t + "_3",
    },
  ]);
  _markup.push([
    {
      text: "🔙 Back to game selection",
      callback_data: "PLAY_MINI_GAMES",
    },
  ]);
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  };

  bot.sendMessage(msg.chat.id, txt, options);
};
module.exports.price = async (msg, t, tiers) => {
  const client = await db.getClient();

  let priceEth = this.getPriceByTiers(tiers);

  let curData = this.structChoice();
  curData.game = t;
  curData.tiers = tiers;
  curData.price = priceEth;

  // Presenting user actions
  let txt = `➡️  What in-game action would you like to make?`;
  var _markup = [];
  switch (t) {
    case "PRISONER":
      _markup = await prisoner.getActions(tiers);
      break;
    case "NUMBERGUESSING":
        curData.mode = 'INPUT_NUMBERGUESSING';
      txt += "\n\n" + number_guessing.getSpecificActionMsg();
      _markup = await number_guessing.getActions(tiers);
      break;
    case "CENTIPEDE":
      _markup = await centipede.getActions(tiers);
      break;
  }

  _markup.push([
    {
      text: "🔙 Back to bet size",
      callback_data: "GAME_INIT_" + t,
    },
  ]);



  //Saving user choice
  const user_choice = await client
    .db("gaming")
    .collection("user_choice")
    .updateOne(
      { _id: msg.chat.id },
      {
        $set: curData,
      },
      { upsert: true }
    );

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};

module.exports.frequency = async (msg, t, tiers) => {
  const client = await db.getClient();

  let priceEth = this.getPriceByTiers(tiers);

  // Presenting user actions
  let txt = `➡️  What in-game action would you like to make?`;
  var _markup = [];
  let mode = "choice";
  switch (t) {
    case "PRISONER":
      _markup = await prisoner.getActions();
      break;
    case "NUMBERGUESSING":
      mode = "input";
      txt += "\n\n" + number_guessing.getSpecificActionMsg();
      _markup = await number_guessing.getActions();
      break;
    case "CENTIPEDE":
      _markup = await centipede.getActions();
      break;
  }

  _markup.push([
    {
      text: "🔙 Back to bet size",
      callback_data: "GAME_INIT_" + t,
    },
  ]);

  let curData = this.structChoice();
  curData.game = t;
  curData.tiers = tiers;
  curData.price = priceEth;
  curData.mode = mode;
  //Saving user choice
  const user_choice = await client
    .db("gaming")
    .collection("user_choice")
    .updateOne(
      { _id: msg.chat.id },
      {
        $set: curData,
      },
      { upsert: true }
    );

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};

module.exports.action = async (msg, t, tiers, action) => {
  const client = await db.getClient();

  let priceEth = this.getPriceByTiers(tiers);
  let curData = this.structChoice();
  curData.game = t;
  curData.tiers = tiers;
  curData.price = priceEth;
  curData.action = action;
  const user_choice = await client
    .db("gaming")
    .collection("user_choice")
    .updateOne({ _id: msg.chat.id }, { $set: curData }, { upsert: true });

  // Presenting user actions
  let txt = "➡️ How often do you want to make this play?\n\n";

  switch (t) {
    case "PRISONER":
      txt += prisoner.actionText();
      break;
    case "NUMBERGUESSING":
      txt += number_guessing.actionText();
      break;
    case "CENTIPEDE":
      txt += centipede.actionText();
      break;
  }

  var _markup = [];
  _markup.push([
    {
      text: "1",
      callback_data: "GAME_SUMMARY_" + t + "_" + tiers + "_" + action + "_1",
    },
  ]);
  _markup.push([
    {
      text: "5",
      callback_data: "GAME_SUMMARY_" + t + "_" + tiers + "_" + action + "_5",
    },
  ]);
  _markup.push([
    {
      text: "Type in number",
      callback_data:
        "GAME_SUMMARY_" + t + "_" + tiers + "_" + action + "_INPUT",
    },
  ]);
  _markup.push([
    {
      text: "🔙 Back to in-game action",
      callback_data: "GAME_PRICE_" + t + "_" + tiers,
    },
  ]);

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};

module.exports.summary = async (msg, t, tiers, action, number) => {
  const client = await db.getClient();

  let priceEth = this.getPriceByTiers(tiers);
  let curData = this.structChoice();
  curData.game = t;
  curData.tiers = tiers;
  curData.price = priceEth;
  curData.action = action;
  curData.number = Number(number);
  await client
    .db("gaming")
    .collection("user_choice")
    .updateOne({ _id: msg.chat.id }, { $set: curData }, { upsert: true });

  const user_choice = await client
    .db("gaming")
    .collection("user_choice")
    .findOne({ _id: msg.chat.id });

   user_choice.payout_wallet = process.env['PAYOUT_WALLET_'+user_choice.game];

   
  const userData = await helper.encode(user_choice);

  if(userData === null){
    await bot.sendMessage(msg.chat.id, "Error occured while preparing the Confirmation Data. Please try..",{
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
            inline_keyboard: [[
                {
                  text: "🔙 Retry",
                  callback_data: "HOME",
                },
              ]],

        })
    });
    return;
  }

  let txt = "<b>Summary</b>\n\n";

  txt += "Game: " + user_choice.game + "\n\n";
  txt += "Action: " + user_choice.action + "\n\n";
  txt += "Bet size per play: " + user_choice.price + " ETH\n\n";
  txt += "Number of plays: " + user_choice.number + " \n\n";
  txt += "Total bet: " + (user_choice.price * 1000 * user_choice.number)/1000 + " ETH\n\n";

  var _markup = [];
  _markup.push([
    {
      text: "Confirm - Proceed to payment",
      url: process.env.PUBLIC_URL + "?hash=" + encodeURIComponent(userData),
    },
  ]);

  _markup.push([
    {
      text: "🔙 Back to in-game frequency",
      callback_data: "GAME_ACTION_" + t + "_" + tiers + "_" + action,
    },
  ]);

  bot.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};


module.exports.guide = (msg,t)=>{
    console.log('t',t)
    switch(t){
        case 'PRISONER':
            prisoner.guide(msg);
            break;
        case 'NUMBERGUESSING':
            number_guessing.guide(msg);
            break;
        case 'CENTIPEDE':
            centipede.guide(msg);
            break;
    }
}

module.exports.myOpenGAMES = async (msg) => {

  var txt = "<b>My open games</b>\n\n";
  txt += "TODO My open games - Under construction";
  // *Your open games*


  // <List of games the player
  // participated in which are
  // not finished yet>
  
  // Example:
  
  // Game: Prisoner's Dilemma
  // Tournament #<number in db>
  // Bet size: <bet size number>
  // Your bets: <number of bets>
  // Current prize pool:
  // <prize pool in database>
  // Your current points:
  // <points in db>
  // Your current leaderboard position:
  // <leaderboard position in db>
  // Tournament ends in:
  // <xx hours yy minutes>
  
  // Game: Guess the Number
  // Match #number in db>
  // Bet size: <bet size number>
  // Your bets: <number guessed>
  // Players remaining until match ends:
  // <10 - players currently in the match>
  
  // We'll notify you when a game 
  // finishes!

  bot.sendMessage(msg.chat.id, "TODO My open games - Under construction");
}
module.exports.frequencyInput = async (msg)=>{
    const client = await db.getClient();

   
    await client
      .db("gaming")
      .collection("user_choice")
      .updateOne({ _id: msg.chat.id }, { $set: {mode:'INPUT_FREQUENCY'} }, { upsert: true });
  
        // User wants to input a number
        bot.sendMessage(msg.chat.id, "Type the number of your choice\n\n<b>Only numbers greater than 0 are allowed</b>",{
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
    
}

module.exports.check_input = async (msg) => {
    const client = await db.getClient();

    const user = await client
        .db("gaming")
        .collection("user_choice")
        .findOne({ _id: msg.chat.id });

    if(user.mode && user.mode.indexOf('INPUT_') !== -1){
        // user is in input mode 
        let number = msg.text;
        if(isNaN(number) || Number(number) < 0 || number.indexOf('.') !== -1 || number.indexOf(',') !== -1){
            bot.sendMessage(msg.chat.id, "Please enter a valid number or a number greater than 0");
            return;
        }else{

            // save the number of the user 
            if(user.mode === 'INPUT_FREQUENCY'){
                if(Number(number) <= 0 ){
                    bot.sendMessage(msg.chat.id, "Please enter a number greater than 0");
                    return;
                }
                await client
                  .db("gaming")
                  .collection("user_choice")
                  .updateOne({ _id: msg.chat.id }, { $set: {number:Number(number),mode:null} }, { upsert: true });
               this.summary(msg,user.game,user.tiers,user.action,number);
            } else if(user.mode === 'INPUT_NUMBERGUESSING'){
                if(Number(number) > 100 || Number(number) < 0){
                    bot.sendMessage(msg.chat.id, "Please enter a number between 0 and 100");
                    return;
                }else{
                    await client
                    .db("gaming")
                    .collection("user_choice")
                    .updateOne({ _id: msg.chat.id }, { $set: {action:Number(number),mode:null} }, { upsert: true });  
                    this.action(msg, user.game, user.tiers, Number(number));
                }
            }
        }

    }
}
