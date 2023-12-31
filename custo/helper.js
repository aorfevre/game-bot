process.env["NTBA_FIX_350"] = 1;
var db = require("../database/mongo.js");

// var Wallet = require('ethereumjs-wallet');
// const EthWallet = Wallet.default.generate();
// console.log("address: " + EthWallet.getAddressString());
// console.log("privateKey: " + EthWallet.getPrivateKeyString());

// create a function to encode using a Private Key an object
module.exports.encode = (data) => {
  if (
    !data.action ||
    !data.game ||
    !data.price ||
    !data.number ||
    !data._id ||
    !data.payout_wallet
  ) {
    console.log("ERROR");
    return null;
  }
  try {
    var CryptoJS = require("crypto-js");

    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      process.env.PRIVATE_KEY
    ).toString();
  } catch (e) {
    console.log("Error while doing encoding", e, process.env.PRIVATE_KEY);
    return null;
  }
};

// create a function to decode using a public key an object
module.exports.decode = async (data) => {
  try {
    var CryptoJS = require("crypto-js");

    var bytes = await CryptoJS.AES.decrypt(data, process.env.PRIVATE_KEY);
    const d = await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (
      !d.action ||
      !d.game ||
      !d.price ||
      !d.number ||
      !d._id ||
      !d.payout_wallet
    ) {
      return null;
    } else {
      return d;
    }
  } catch (e) {
    console.log("error", e);
    return null;
  }
};

module.exports.updateUser = async (msg) => {
  const client = await db.getClient();
  const users = await client
    .db(DB_STAGE)
    .collection("users")
    .find({ _id: msg.chat.id })
    .toArray();
  if (!users.length) {
    let user = msg.chat;
    user._id = msg.chat.id;
    user._created_at = new Date();

    user._update_at = new Date();

    client.db(DB_STAGE).collection("users").insertOne(user);
    return user;
  } else {
    let user = users[0];

    user._update_at = new Date();

    client
      .db(DB_STAGE)
      .collection("users")
      .updateOne({ _id: msg.chat.id }, { $set: user });
    return user;
  }
};

module.exports.isSpam = async (msg) => {
  const client = await db.getClient();
  const users = await client
    .db(DB_STAGE)
    .collection("users")
    .find({ _id: msg.chat.id })
    .toArray();

  if (users[0]) {
    const user = users[0];

    if (user.spam && new Date() - user.spam < 500) {
      return true;
    } else {
      client
        .db(DB_STAGE)
        .collection("users")
        .updateOne({ _id: msg.chat.id }, { $set: { spam: new Date() } });
      return false;
    }
  }
};

module.exports.savePlayTransaction = async (hash, txhash) => {
  const client = await db.getClient();
  const tx = await client
    .db(DB_STAGE)
    .collection("tx")
    .find({ txhash, hash })
    .toArray();
  if (!tx.length) {
    let decoded = await this.decode(decodeURIComponent(hash));
    if (!decoded) {
      return null;
    }
    let tx = {
      txhash,
      hash,
      decoded,
      _created_at: new Date(),
      verified: false,
      processed: false,
    };
    await client.db(DB_STAGE).collection("tx").insertOne(tx);
    return tx;
  } else {
    return null;
  }
};
module.exports.isPrivate = function (msg) {
  return msg.chat.type === "private";
};
module.exports.isSuperAdmin = function (msg) {
  return (
    msg.chat.username === "AlexandreBR" || msg.chat.username === "blokcove"
  );
};

// get ETH balance of a wallet
module.exports.getBalanceOfWallet = async (wallet) => {
  const ethers = require("ethers");

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PUBLIC_RPC_URL
  );
  const balance = await provider.getBalance(wallet);
  return ethers.utils.formatUnits(balance, 18);
};

module.exports.verifyTransaction = async (obj) => {
  try {
    const ethers = require("ethers");
    // Connect to ethers RPC on Sepolia
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PUBLIC_RPC_URL
    );

    // fetch transaction by hash
    const tx = await provider.getTransaction(obj.txhash);
    console.log("tx", tx);
    if (tx) {
      const client = await db.getClient();
      await client
        .db(DB_STAGE)
        .collection("tx")
        .updateOne({ _id: obj._id }, { $set: { verified: true, tx } });

      let txt = "<b>Payment confirmation</b>\n\n";

      txt += "🤑 Your payment has been received.\n\n";

      let participation = this.getGameSummary(obj.decoded);
      participation +=
        "<a href='" +
        process.env.PUBLIC_EXPLORER_URL +
        "/tx/" +
        obj.txhash +
        "'>Txhash</a>";

      txt += participation;

      txt +=
        "We'll notify you of your payout when the match(es) finish(es)." + "\n";

      if (obj.decoded.game === "NUMBERGUESSING") {
        txt +=
          "This happens once a match receives guesses from 10 players." + "\n";
      } else if (obj.decoded.game === "ROCKPAPERSCISSORS") {
        txt += "You'll be randomly matched with other players." + "\n";
      }

      await this.sendMessage(DD_FLOOD, participation, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
      await this.sendMessage(obj.decoded._id, txt, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      txt = "For an overview of all your open games, click [My open games]";

      let _markup = [];
      _markup.push([
        {
          text: "My open games",
          callback_data: "MY_OPEN_GAMES",
        },
      ]);
      _markup.push(backHomeBtn);

      await this.sendMessage(obj.decoded._id, txt, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: _markup,
        }),
      });
    } else {
      console.log("tx not found");
    }
  } catch (e) {
    console.log("error", e);
  }
};
module.exports.findAllUnverifiedTransactions = async () => {
  const client = await db.getClient();
  const txs = await client
    .db(DB_STAGE)
    .collection("tx")
    .find({ verified: false })
    .toArray();

  let _promises = [];
  for (const i in txs) {
    _promises.push(this.verifyTransaction(txs[i]));
    if (_promises.length === 10) {
      await Promise.all(_promises);
      _promises = [];
    }
  }
  await Promise.all(_promises);
};

module.exports.home = async (msg) => {
  if (this.isPrivate(msg)) {
    let txt =
      "Welcome " +
      msg.chat.username +
      " to <b>Deduction Duel</b>, your hub for social deduction multiplayer minigames.\n\n";

    txt +=
      "🏆 Correctly guess your enemies' actions to be victorious & win prizes.\n\n";

    txt +=
      "ℹ️ All minigames are based on game theoretic concepts. You'll learn the underlying theories - and observe how humans may deviate from optimal strategies. And as we all know, you learn the best when you have skin in the game.\n\n";

    txt += "➡️ What do you want to do?";
    var _markup = [];

    _markup.push([
      {
        text: "Play Games",
        callback_data: "PLAY_MINI_GAMES",
      },
    ]);

    _markup.push([
      {
        text: "My open games",
        callback_data: "MY_OPEN_GAMES",
      },
      {
        text: "Guides",
        callback_data: "GUIDE_GAMES",
      },
    ]);

    _markup.push([
      {
        text: "Stats",
        callback_data: "STATS_USER",
      },

      {
        text: "Info",
        callback_data: "INFO_GAMES",
      },
    ]);
    _markup.push([
      {
        text: "Invite Codes",
        callback_data: "INVITE_CODES",
      },
    ]);
    var options = {
      parse_mode: "HTML",
      caption: txt,
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup,
      }),
    };
    await this.sendMessage(
      msg.chat.id,
      null,
      options,
      true,
      "./img/banner.jpeg"
    );
  }
};

module.exports.findGame = (t) => {
  // find t in allGames
  let game = null;
  for (const i in allGames) {
    if (allGames[i].name === t) {
      game = allGames[i];
      break;
    }
  }
  return game;
};
module.exports.guide_games = async (msg) => {
  const arr = [];
  for (const i in allGames) {
    arr.push([
      {
        text: allGames[i].btn,
        callback_data: "GUIDE_GAME_" + allGames[i].name,
      },
    ]);
  }
  arr.push(backHomeBtn);
  await this.sendMessage(
    msg.chat.id,
    "<b>Guides</b>\n\n➡️ Learn the rules of our minigames",
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: arr,
      }),
    }
  );
};
module.exports.info_games = async (msg) => {
  let txt = "<b>ℹ️ Info</b>\n\n";
  txt += "▶️ How are prize pools calculated?\n";
  txt +=
    "Prize pools consist of entry fees paid by players, minus a platform fee (currently set to " +
    RATE_FEE +
    "%).\n\n";

  txt += "▶️ Why do games have different wager sizes for me to choose from?\n";
  txt +=
    "We want to allow anyone to participate in the games with the amount of skin in the game they're comfortable with. Some players may prefer to make smaller but more wagers to diversify while others may want to aim for the big prize.\n\n";

  txt += "▶️ How do the payments work?\n";
  txt +=
    "Each play comes with an associated entry fee. All entry fees together make up the prize pools.\n";
  txt +=
    "After defining your strategy for a game, you'll be asked to pay the entry fee to take part in the competition. Confirm the transaction in the browser pop-up.\n";
  txt += "Payments are made in ETH on Base network.\n\n";

  txt += "▶️ Which chain are you on?\n";
  txt += "Base\n\n";

  txt += "▶️ How do I contact you?\n";
  txt += "hello.deductionduel@gmail.com";

  await this.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [backHomeBtn],
    }),
  });
};

module.exports.referralSystem = async (msg) => {
  const txt =
    "Welcome " +
    msg.chat.username +
    " to Deduction Duel, your hub for social deduction multiplayer minigames.\n\n" +
    "We're currently in closed alpha.\n\n" +
    "Please enter an invite code to play.\n\n";
  await this.sendMessage(msg.chat.id, txt, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
};
module.exports.create_5_codes = async (msg) => {
  const client = await db.getClient();

  for (const i in [1, 2, 3, 4, 5]) {
    const refCode = {
      referrer: msg.chat.id,
      code: this.generateCodes(),
      is_valid: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    // write to db
    console.log("Invite codes created", refCode);
    await client.db(DB_STAGE).collection("referral_codes").insertOne(refCode);
  }
  await this.invite_codes(msg);
};

module.exports.invite_codes = async (msg) => {
  // Count how many transaction the user has played before
  const LEVEL2_REFERRAL = 10;
  const LEVEL2_CODES = 3; // SUM LVL1 + 2

  const client = await db.getClient();
  const txs = await client
    .db(DB_STAGE)
    .collection("tx")
    .countDocuments({ "decoded._id": msg.chat.id });
  let options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [backHomeBtn],
    }),
  };
  if (this.isSuperAdmin(msg)) {
    options.reply_markup = JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "⚡️⚠️ Create 5 codes ⚡️⚠️",
            callback_data: "CREATE_5_CODES",
          },
        ],
        backHomeBtn,
      ],
    });
  }
  const referral_code = await client
    .db(DB_STAGE)
    .collection("referral_codes")
    .find({ referrer: msg.chat.id })
    .toArray();
  console.log("refer", referral_code.length, this.isSuperAdmin(msg));
  if (
    (txs === 0 && !this.isSuperAdmin(msg)) ||
    (this.isSuperAdmin(msg) && referral_code.length === 0)
  ) {
    //
    const txt =
      "You have no invite codes to share.\n\n" +
      "Play 1 game to generate 1 invite code\n\n";
    await this.sendMessage(msg.chat.id, txt, options);
  } else if (
    (txs > 0 && txs < LEVEL2_REFERRAL) ||
    (this.isSuperAdmin(msg) && referral_code.length > 0)
  ) {
    // get the referarl code or create one if it does not exist

    if (referral_code.length === 0) {
      // create one
      const refCode = {
        referrer: msg.chat.id,
        code: this.generateCodes(),
        is_valid: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      // write to db

      await client.db(DB_STAGE).collection("referral_codes").insertOne(refCode);
      // send message
      const txt =
        "You have 1 invite code to share.\n\n" +
        "Play 10 games in total to generate 2 more invite codes\n\n" +
        "Game Played : " +
        txs +
        "\n\n" +
        "Code : " +
        refCode.code +
        " (unused)\n\n";
      await this.sendMessage(msg.chat.id, txt, options);
    } else if (referral_code.length > 0) {
      console.log("Referral code", referral_code.length);
      let txt =
        "You have 1 invite code to share.\n\n" +
        "Play 10 games in total to generate 2 more invite codes\n\n" +
        "Game Played : " +
        txs +
        "\n\n" +
        "Codes \n";
      for (const i in referral_code) {
        txt +=
          referral_code[i].code +
          " " +
          (referral_code[i].is_valid ? "(unused)" : "(used)") +
          "\n";
      }
      await this.sendMessage(msg.chat.id, txt, options);
    }
  } else if (txs >= LEVEL2_REFERRAL) {
    const referral_code = await client
      .db(DB_STAGE)
      .collection("referral_codes")
      .countDocuments({ referrer: msg.chat.id });
    if (referral_code < LEVEL2_CODES) {
      for (let i = referral_code; i < LEVEL2_CODES; i++) {
        const refCode = {
          referrer: msg.chat.id,
          code: this.generateCodes(),
          is_valid: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        // write to db

        await client
          .db(DB_STAGE)
          .collection("referral_codes")
          .insertOne(refCode);
      }
    }
    const refCodes = await client
      .db(DB_STAGE)
      .collection("referral_codes")
      .find({ referrer: msg.chat.id })
      .toArray();

    let txt =
      "You have " +
      LEVEL2_CODES +
      " invite code to share.\n\n" +
      "Game Played : " +
      txs +
      "\n\n" +
      "Codes \n";
    for (const i in refCodes) {
      txt +=
        refCodes[i].code +
        " " +
        (refCodes[i].is_valid ? "(unused)" : "(used)") +
        "\n";
    }
    await this.sendMessage(msg.chat.id, txt, options);
  }
};
module.exports.generateCodes = () => {
  // generates a 12 character, alpha-numeric string, upper and lower case code for referral system
  const length = 12;
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let retVal = "";
  for (let i = 0; i < length; i++) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    // third character must be a -
    if (i === 2) {
      retVal += "-";
    }
    if (i === 7) {
      retVal += "-";
    }
  }
  return "DD-" + retVal;
};

module.exports.checkReferralSystem = async (msg) => {
  const client = await db.getClient();
  const ref = await client
    .db(DB_STAGE)
    .collection("referral_codes")
    .countDocuments({ code: msg.text, is_valid: true });

  if (ref === 1) {
    // Code is valid, register user
    // update the code usage
    await client
      .db(DB_STAGE)
      .collection("referral_codes")
      .updateOne(
        { code: msg.text, is_valid: true },
        { $set: { is_valid: false, used_by: msg.chat.id } }
      );
    // update the user
    await client
      .db(DB_STAGE)
      .collection("users")
      .updateOne(
        { _id: msg.chat.id },
        { $set: { isReferred: true, referral_code: msg.text } }
      );

    bot.sendMessage(DD_FLOOD, "New user registered with code " + msg.text);
    // send message
    this.home(msg);
  } else {
    // code is invalid or already used.
    let txt =
      "The code you entered is invalid.\n\n" +
      "If you didn't receive an invite code yet, keep an eye out on our Twitter where we'll give out codes regularly.\n\n" +
      "https://x.com/DeductionDuelGG";
    bot.sendMessage(msg.chat.id, txt, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }
};

module.exports.get_players_by_game_tiers = async (game, tiers) => {
  const client = await db.getClient();
  const txs = await client
    .db(DB_STAGE)
    .collection("tx")
    .aggregate([
      {
        $match: {
          "decoded.game": game,
          verified: true,
          processed: false,
          "decoded.tiers": tiers,
          "decoded.action": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$decoded._id",
          decoded: { $first: "$decoded" },
          tx: { $first: "$tx" },
          source: { $first: "$source" },
          primaryId: { $last: "$_id" },
        },
      },
      {
        $addFields: {
          user: "$decoded._id",
        },
      },
    ])
    .toArray();
  return txs;
};

module.exports.get_free_games = async (game, tiers) => {
  const client = await db.getClient();
  const txs = await client
    .db(DB_STAGE)
    .collection("tx")
    .aggregate([
      {
        $match: {
          "decoded.game": game,
          verified: true,
          processed: false,
          "decoded.tiers": tiers,
          "decoded.action": { $exists: false },
        },
      },
      {
        $group: {
          _id: "$decoded._id",
          decoded: { $first: "$decoded" },
          tx: { $first: "$tx" },
          source: { $first: "$source" },
          primaryId: { $last: "$_id" },
        },
      },
      {
        $addFields: {
          user: "$decoded._id",
        },
      },
    ])
    .toArray();
  return txs;
};

module.exports.get_free_games_by_user = async (id) => {
  const client = await db.getClient();

  const items = await client
    .db(DB_STAGE)
    .collection("tx")
    .aggregate([
      {
        $match: {
          "decoded._id": id,
          processed: false,
          "decoded.action": { $exists: false },
        },
      },
      {
        $group: {
          _id: { tiers: "$decoded.tiers", game: "$decoded.game" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();
  return items;
};

module.exports.get_free_games_by_user_game = async (id, game) => {
  const client = await db.getClient();

  const items = await client
    .db(DB_STAGE)
    .collection("tx")
    .aggregate([
      {
        $match: {
          "decoded._id": id,
          processed: false,
          "decoded.game": game,
          "decoded.action": { $exists: false },
        },
      },
      {
        $group: {
          _id: { tiers: "$decoded.tiers", game },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();
  return items;
};

module.exports.setIteration = async (trx) => {
  if (trx.decoded.number > 1) {
    const client = await db.getClient();
    const tx = await client
      .db(DB_STAGE)
      .collection("tx")
      .findOne({ _id: trx.primaryId });
    tx.decoded.number--;

    let copy = JSON.parse(JSON.stringify(tx));
    delete copy._id;
    copy.processed = false;
    copy._created_at = new Date();

    await client.db(DB_STAGE).collection("tx").insertOne(copy);
  } else {
    return;
  }
};

module.exports.setFreeGame = async (id) => {
  const client = await db.getClient();
  const tx = await client.db(DB_STAGE).collection("tx").findOne({ _id: id });
  let copy = JSON.parse(JSON.stringify(tx));
  delete copy._id;
  delete copy.code;
  delete copy.draw;
  delete copy.decoded.action;
  copy.processed = false;
  copy.decoded.number = 1;
  copy._created_at = new Date();
  await client.db(DB_STAGE).collection("tx").insertOne(copy);
};

module.exports.getGameSummary = (user_choice) => {
  const game = this.findGame(user_choice.game);

  let txt = "";
  txt += "Game: " + game.btn + "\n";
  txt += "Your action: " + user_choice.action + "\n\n";

  txt += "<u>Wager info</u>\n";
  txt += "Wager size per play: " + user_choice.price + " ETH\n";
  txt += "Number of plays: " + user_choice.number + " \n";
  txt +=
    "Total wager: " +
    (user_choice.price * 1000 * user_choice.number) / 1000 +
    " ETH\n";
  return txt;
};

module.exports.countGames = async () => {
  const client = await db.getClient();
  const txs = await client.db(DB_STAGE).collection("pvp").countDocuments();
  return txs;
};

module.exports.countPlayers = async () => {
  const client = await db.getClient();
  const txs = await client.db(DB_STAGE).collection("users").countDocuments();
  return txs;
};

module.exports.countPrizePaid = async () => {
  const client = await db.getClient();
  // sum all prizePool of pvp collection
  const txs = await client
    .db(DB_STAGE)
    .collection("pvp")
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$prizePool" },
        },
      },
    ])
    .toArray();
  return txs[0].total;
};

module.exports.waitMs = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
module.exports.deleteProcessingMessages = async (msg) => {
  // wait 1sec to delete the processing message
  const client = await db.getClient();

  let messages = await client.db(DB_STAGE).collection("messages").findOne({
    _id: msg.chat.id,
  });

  if (messages && messages.message) {
    const id = messages.message;
    for (let i = id; i > id - 10; i--) {
      try {
        await bot.deleteMessage(msg.chat.id, i);
      } catch (e) {}
    }
  }
};

module.exports.setProcessing = async (msg) => {
  await this.sendMessage(msg.chat.id, "🚶‍♀️Processing...");
};

module.exports.sendMessage = async (id, txt, options, isDocument, link) => {
  try {
    let message = null;
    if (isDocument) {
      message = await bot.sendPhoto(id, link, options);
    } else if (txt) {
      message = await bot.sendMessage(id, txt, options);
    }
    if (txt && txt.indexOf("🚶‍♀️Processing...") > -1) {
      const client = await db.getClient();
      await client
        .db(DB_STAGE)
        .collection("messages")
        .updateOne(
          { _id: id },
          { $set: { message: message.message_id } },
          { upsert: true }
        );
    }
  } catch (e) {
    console.log("error", e);
  }
};
