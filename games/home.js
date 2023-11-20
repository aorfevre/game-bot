var db = require("../database/mongo.js");
var number_guessing = require("./number_guessing.js");
var rock_paper_scissors = require("./rock_paper_scissors.js");
var helper = require("../custo/helper.js");
var ObjectId = require("mongodb").ObjectId;


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
const allTiers = {
  1: 0.0006,
  2: 0.003,
  3: 0.012,
};

module.exports.getAllTiers = () => {
  return allTiers;
};

module.exports.getPriceByTiers = (tiers) => {
  // Price by tiers
  let priceEth = 0.0006;
  if (allTiers[tiers]) {
    priceEth = allTiers[tiers];
  }
  return priceEth;
};

module.exports.init = async (msg) => {
  let txt = `➡️ Which game would you like to play?`;
  var _markup = [];

  for (const i in allGames) {
    _markup.push([
      {
        text: allGames[i].btn,
        callback_data: "GAME_INIT_" + allGames[i].name,
      },
    ]);
  }

  _markup.push([
    {
      text: "Learn more about the games",
      callback_data: "GUIDE_GAMES",
    },
  ]);
  _markup.push(backHomeBtn);
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  };

  await helper.sendMessage(msg.chat.id, txt, options);
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
    case "NUMBERGUESSING":
      intro = await number_guessing.getIntroText();
      break;
    case "ROCKPAPERSCISSORS":
      intro = await rock_paper_scissors.getIntroText();
      break;
  }

  // await helper.sendMessage(msg.chat.id, intro, {
  //   parse_mode: "HTML",
  //   disable_web_page_preview: true,
  // });

  let txt = intro + "\n\n" + "➡️  How much would you like to wager per play?\n\n";
  txt += "(Tournaments are divided by wager amounts)";
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
  _markup.push(backHomeBtn);
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  };

  await helper.sendMessage(msg.chat.id, txt, options);
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
    case "NUMBERGUESSING":
      curData.mode = "INPUT_NUMBERGUESSING";
      txt += "\n\n" + number_guessing.getSpecificActionMsg();
      _markup = await number_guessing.getActions(tiers);
      break;

    case "ROCKPAPERSCISSORS":
      _markup = await rock_paper_scissors.getActions(tiers);
      break;
  }

  _markup.push([
    {
      text: "🔙 Back to wager size",
      callback_data: "GAME_INIT_" + t,
    },
  ]);
  _markup.push(backHomeBtn);
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

  await helper.sendMessage(msg.chat.id, txt, {
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
    case "NUMBERGUESSING":
      mode = "input";
      txt += "\n\n" + number_guessing.getSpecificActionMsg();
      _markup = await number_guessing.getActions();
      break;
    case "ROCKPAPERSCISSORS":
      _markup = await rock_paper_scissors.getActions();
      break;
  }

  _markup.push([
    {
      text: "🔙 Back to wager size",
      callback_data: "GAME_INIT_" + t,
    },
  ]);
  _markup.push(backHomeBtn);
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

  await helper.sendMessage(msg.chat.id, txt, {
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
    case "NUMBERGUESSING":
      txt += number_guessing.actionText();
      break;

    case "ROCKPAPERSCISSORS":
      txt += rock_paper_scissors.actionText();
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
  _markup.push(backHomeBtn);
  await helper.sendMessage(msg.chat.id, txt, {
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

  user_choice.payout_wallet = process.env["PAYOUT_WALLET_" + user_choice.game];
  const userData = await helper.encode(user_choice);

  if (userData === null) {
    await helper.sendMessage(
      msg.chat.id,
      "Error occured while preparing the Confirmation Data. Please try..",
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "🔙 Retry",
                callback_data: "HOME",
              },
            ],
          ],
        }),
      }
    );
    return;
  }

  let txt = "<b>Game Summary</b>\n\n";

  txt += helper.getGameSummary(user_choice)

  // console.log(
  //   "Payment link ",
  //   "http://localhost:3000/payment?hash=" + encodeURIComponent(userData)
  // );

  // console.log(
  //   "Payment link v2",
  //   "https://00f3-2a01-cb00-111b-2f00-94b6-9c3f-baef-3c5b.ngrok-free.app/payment?hash=" + encodeURIComponent(userData)
  // );

  
  var _markup = [];
  _markup.push([
    {
      text: "Confirm - Proceed to payment",
      url:
        process.env.PUBLIC_URL +
        "/payment?hash=" +
        encodeURIComponent(userData),
    },
  ]);

  _markup.push([
    {
      text: "🔙 Back to in-game frequency",
      callback_data: "GAME_ACTION_" + t + "_" + tiers + "_" + action,
    },
  ]);
  // await helper.sendMessage(msg.chat.id, "https://00f3-2a01-cb00-111b-2f00-94b6-9c3f-baef-3c5b.ngrok-free.app/payment?hash=" + encodeURIComponent(userData), {
  //   parse_mode: "HTML",
  //   disable_web_page_preview: true,
   
  // });

  _markup.push(backHomeBtn);
  await helper.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};

module.exports.guide = async(msg, t) => {
  let txt = "";
  switch (t) {
    case "NUMBERGUESSING":
      txt = number_guessing.guide(msg);
      break;

    case "ROCKPAPERSCISSORS":
      txt = rock_paper_scissors.guide(msg);
      break;
  }
  const game = helper.findGame(t);

  await helper.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: game.btn,
            callback_data: "GAME_INIT_" + t,
          },
        ],
        [
          {
            text: "🔙 Back to Guides",
            callback_data: "GUIDE_GAMES",
          },
        ],
        backHomeBtn
      ],
    }),
  });
};

module.exports.myOpenGAMES = async (msg) => {
  var txt = "<b>My open games</b>\n\n";

  const client = await db.getClient();

  const openGames = await client
    .db("gaming")
    .collection("tx")
    .find({ "decoded._id": msg.chat.id, verified: true, processed: false })
    .toArray();

  if (openGames.length === 0) {
    txt += "You don't have any open games";
    // add buttons
  } else {
    for (const i in openGames) {
      txt += "🔹 🔹 🔹 🔹\n\n";
    
      txt += helper.getGameSummary(openGames[i].decoded)
      txt += "\n";

      if (i % 2 === 0 && Number(i) !== 0 && i !== openGames.length) {
        await helper.sendMessage(msg.chat.id, txt, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
        txt = "";
      }
    }
    txt += "We'll notify you when a game finishes!";
  }

  var _markup = [];
  // add a button to play games
  _markup.push([
    {
      text: "🚀 Play games",
      callback_data: "PLAY_MINI_GAMES",
    },
  ]);

  _markup.push(backHomeBtn);
  await helper.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup,
    }),
  });
};
module.exports.frequencyInput = async (msg) => {
  const client = await db.getClient();

  await client
    .db("gaming")
    .collection("user_choice")
    .updateOne(
      { _id: msg.chat.id },
      { $set: { mode: "INPUT_FREQUENCY" } },
      { upsert: true }
    );

  // User wants to input a number
  await helper.sendMessage(
    msg.chat.id,
    "Type the number of your choice\n\n<b>Only numbers greater than 0 are allowed</b>",
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
};

module.exports.check_input = async (msg) => {
  const client = await db.getClient();

  const user = await client
    .db("gaming")
    .collection("user_choice")
    .findOne({ _id: msg.chat.id });

  if (user && user.mode && user.mode.indexOf("INPUT_") !== -1) {
    // user is in input mode
    let number = msg.text;
    if (
      isNaN(number) ||
      Number(number) < 0 ||
      number.indexOf(".") !== -1 ||
      number.indexOf(",") !== -1
    ) {
      await helper.sendMessage(
        msg.chat.id,
        "Please enter a valid number or a number greater than 0"
      );
      return;
    } else {
      // save the number of the user
      if (user.mode === "INPUT_FREQUENCY") {
        if (Number(number) <= 0) {
          await helper.sendMessage(msg.chat.id, "Please enter a number greater than 0");
          return;
        }
        await client
          .db("gaming")
          .collection("user_choice")
          .updateOne(
            { _id: msg.chat.id },
            { $set: { number: Number(number), mode: null } },
            { upsert: true }
          );
        await this.summary(msg, user.game, user.tiers, user.action, number);
      } else if (user.mode === "INPUT_NUMBERGUESSING") {
        if (Number(number) > 100 || Number(number) < 0) {
          await helper.sendMessage(
            msg.chat.id,
            "Please enter a number between 0 and 100"
          );
          return;
        } else {
          await client
            .db("gaming")
            .collection("user_choice")
            .updateOne(
              { _id: msg.chat.id },
              { $set: { action: Number(number), mode: null } },
              { upsert: true }
            );
          await this.action(msg, user.game, user.tiers, Number(number));
        }
      }
    }
  }
};

module.exports.freeGame = async (msg, game) => {
  // User has a free game following t id
  const client = await db.getClient();
  // getting tx of id

  const items = await helper.get_free_games_by_user_game(msg.chat.id, game);
  if (items.length > 0) {
    // User has a free game
    const totalGames = items.reduce((a, b) => a + b.count, 0);
    if (items.length === 1) {
      switch (game) {
        case "ROCKPAPERSCISSORS":
          rock_paper_scissors.freeGameByTiers(msg, game, items[0]._id.tiers);
          break;
      }
    } else {
      const arr = [];
      const _markup = [];
      let txt =
        "You have more than one free game, please select the tiers you want to play\nmais pas ";
      for (const i in items) {
        if (items[i]._id.tiers === "1") {
          txt += "\nTier 1: 0,0006 ETH - " + items[i].count + " free game";
          arr.push({
            text: "0,0006 ETH",
            callback_data: "FREETIERSGAME_" + game + "_1",
          });
        } else if (items[i]._id.tiers === "2") {
          txt += "\nTier 2: 0,003 ETH - " + items[i].count + " free game";

          arr.push({
            text: "0,003 ETH",
            callback_data: "FREETIERSGAME_" + game + "_2",
          });
        } else if (items[i]._id.tiers === "3") {
          txt += "\nTier 3: 0,012 ETH - " + items[i].count + " free game";

          arr.push({
            text: "0,012 ETH",
            callback_data: "FREETIERSGAME_" + game + "_3",
          });
        }
      }
      _markup.push(arr);
      var options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: _markup,
        }),
      };

      await helper.sendMessage(msg.chat.id, txt, options);
    }
  }
};

module.exports.freeGamePlayed = async (msg, game, tiers, choice) => {
  // User has a free game following t id
  const client = await db.getClient();
  // getting tx of id

  const count = await client
    .db("gaming")
    .collection("tx")
    .countDocuments({
      "decoded.game": game,
      "decoded._id": msg.chat.id,
      processed: false,
      "decoded.action": { $exists: false },
      "decoded.tiers": tiers,
    });

  console.log("Game", game, "Tiers", tiers, "Count", count, "Choice", choice);
  if (count > 0) {
    // User must select the free game he wants to play

    switch (game) {
      case "ROCKPAPERSCISSORS":
        await rock_paper_scissors.freeGamePlayed(msg, game, tiers, choice);
        break;
    }
  } else {
   await helper.sendMessage(msg.chat.id, "You don't have any free game for this tiers");
  }
};
