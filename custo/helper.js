var db = require("../database/mongo.js");
const ethers = require("ethers");

var CryptoJS = require("crypto-js");

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
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      process.env.PRIVATE_KEY,
    ).toString();
  } catch (e) {
    console.log("Error while doing encoding", e, process.env.PRIVATE_KEY);
    return null;
  }
};

// create a function to decode using a public key an object
module.exports.decode = async (data) => {
  try {
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
    .db("gaming")
    .collection("users")
    .find({ _id: msg.chat.id })
    .toArray();
  if (!users.length) {
    let user = msg.chat;
    user._id = msg.chat.id;
    user._created_at = new Date();

    user._update_at = new Date();

    await client.db("gaming").collection("users").insertOne(user);
    return user;
  } else {
    let user = users[0];

    user._update_at = new Date();

    await client
      .db("gaming")
      .collection("users")
      .updateOne({ _id: msg.chat.id }, { $set: user });
    return user;
  }
};

module.exports.isSpam = async (msg) => {
  const client = await db.getClient();
  const users = await client
    .db("gaming")
    .collection("users")
    .find({ _id: msg.chat.id })
    .toArray();

  if (users[0]) {
    const user = users[0];

    if (user.spam && new Date() - user.spam < 500) {
      return true;
    } else {
      await client
        .db("gaming")
        .collection("users")
        .updateOne({ _id: msg.chat.id }, { $set: { spam: new Date() } });
      return false;
    }
  }
};

module.exports.savePlayTransaction = async (hash, txhash) => {
  const client = await db.getClient();
  const tx = await client
    .db("gaming")
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
    await client.db("gaming").collection("tx").insertOne(tx);
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
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PUBLIC_RPC_URL,
  );
  const balance = await provider.getBalance(wallet);
  return ethers.utils.formatUnits(balance, 18);
};

module.exports.verifyTransaction = async (obj) => {
  // Connect to ethers RPC on Sepolia
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PUBLIC_RPC_URL,
  );

  // fetch transaction by hash
  const tx = await provider.getTransaction(obj.txhash);
  if (tx) {
    const client = await db.getClient();
    await client
      .db("gaming")
      .collection("tx")
      .updateOne({ _id: obj._id }, { $set: { verified: true, tx } });

    let txt = "<b>Payment confirmation</b>\n\n";

    txt += "Your payment has been received.\n\n";

    txt += "You joined tournament #XXX\n\n";

    txt +=
      "Current prize pool: " +
      (await this.getBalanceOfWallet(
        process.env["PAYOUT_WALLET_" + obj.decoded.game],
      )) +
      " ETH\n\n";

    txt += "Tournament ends in: XXX HOURS\n\n";

    txt += "We'll notify you of your payout when the torunament finishes\n\n";

    txt += "Summary of your participation:\n";
    let participation = "Game : " + obj.decoded.game + "\n";
    participation += "Action : " + obj.decoded.action + "\n";
    participation += "Bet size per play : " + obj.decoded.price + "\n";
    participation += "Number of plays : " + obj.decoded.number + "\n";
    participation +=
      "Total bet : " + obj.decoded.price * obj.decoded.number + "\n";
    participation +=
      "<a href='" +
      process.env.PUBLIC_EXPLORER_URL +
      "/tx/" +
      obj.txhash +
      "'>Txhash</a>";
    txt += participation;

    await bot.sendMessage(DD_FLOOD, participation, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    await bot.sendMessage(obj.decoded._id, txt, {
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
    _markup.push([
      {
        text: "🔙 Back to Home",
        callback_data: "HOME",
      },
    ]);

    await bot.sendMessage(obj.decoded._id, txt, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup,
      }),
    });
  } else {
    console.log("tx not found");
  }
};
module.exports.findAllUnverifiedTransactions = async () => {
  const client = await db.getClient();
  const txs = await client
    .db("gaming")
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
      "Welcome to " +
      msg.chat.username +
      ", your hub for social deduction multiplayer minigames.\n\n";

    txt +=
      "Correctly guess your enemies' actions to be victorious & win prizes.\n\n";

    txt +=
      "All mini games are based on game theoretic concepts. You'll learn the  underlying theories - and observe how humans may deviate from optimal strategies.\n\n";

    txt += "And as we all know you learn the best with skin in the game.\n\n";

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
        text: "Guide",
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
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup,
      }),
    };

    bot.sendMessage(msg.chat.id, txt, options);
  }
};
module.exports.guide_games = (msg) => {
  bot.sendMessage(msg.chat.id, "<b>Guides</b>\n\n➡️ Select game", {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        // [
        //   {
        //     text: "🚨 Prisoner's Dilemma",
        //     callback_data: "GUIDE_GAME_PRISONER",
        //   },
        // ],
        [
          {
            text: "🤔 Guess the Number",
            callback_data: "GUIDE_GAME_NUMBERGUESSING",
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
module.exports.info_games = (msg) => {
  let txt = "<b>Info</b>\n\n";
  txt += "How are prize pools calculated?\n";
  txt +=
    "Prize pools consist of entry fees paid by players, minus a platform fee (currently set to 10%).\n\n";

  txt += "Why do games have different bet sizes for me to chose from?\n";
  txt +=
    "We want to allow anyone to participate in the games with the amount of skin in the game they're comfortable with. Some players may prefer to make smaller but more bets to diversify while others may want to aim for the big prize\n\n";

  txt += "How do the payments work?\n";
  txt +=
    "Each play comes with an associated entry fee. All entry fees together make up the prize pools.\n";
  txt +=
    "After defining your strategy for a game, you'll be asked to pay the entry fee to take part in the competition.\n";
  txt += "Confirm the transaction in the browser pop-up. \n";
  txt += "Payments are made in ETH on Base network.\n\n";

  txt += "Which chain are you on?\n";
  txt += "Base\n\n";

  txt += "How do I contact you?\n";
  txt += "TODO ADD A MAIL BOX";

  bot.sendMessage(msg.chat.id, txt, {
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
  });
};

module.exports.referralSystem = async (msg) => {
  const txt =
    "Welcome to Deduction Duel, your hub for social deduction multiplayer minigames.\n\n" +
    "We're currently in closed alpha.\n\n" +
    "Please enter an invite code to play.\n\n";
  bot.sendMessage(msg.chat.id, txt, {
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

    await client.db("gaming").collection("referral_codes").insertOne(refCode);
  }
  this.invite_codes(msg);
};

module.exports.invite_codes = async (msg) => {
  // Count how many transaction the user has played before
  const LEVEL2_REFERRAL = 10;
  const LEVEL2_CODES = 3; // SUM LVL1 + 2
  const client = await db.getClient();
  const txs = await client
    .db("gaming")
    .collection("tx")
    .countDocuments({ "decoded._id": msg.chat.id });
  let options = {
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
        [
          {
            text: "🔙 Back to Home",
            callback_data: "HOME",
          },
        ],
      ],
    });
  }
  if (txs === 0) {
    //
    const txt =
      "You have no invite codes to share.\n\n" +
      "Play 1 game to generate 1 invite code\n\n";
    bot.sendMessage(msg.chat.id, txt, options);
  } else if (txs > 0 && txs < LEVEL2_REFERRAL) {
    // get the referarl code or create one if it does not exist
    const referral_code = await client
      .db("gaming")
      .collection("referral_codes")
      .find({ referrer: msg.chat.id })
      .toArray();
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

      await client.db("gaming").collection("referral_codes").insertOne(refCode);
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
      bot.sendMessage(msg.chat.id, txt, options);
    } else if (referral_code.length > 0) {
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
      bot.sendMessage(msg.chat.id, txt, options);
    }
  } else if (txs >= LEVEL2_REFERRAL) {
    const referral_code = await client
      .db("gaming")
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
          .db("gaming")
          .collection("referral_codes")
          .insertOne(refCode);
      }
    }
    const refCodes = await client
      .db("gaming")
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
    bot.sendMessage(msg.chat.id, txt, options);
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
  console.log("msg", msg);
  const client = await db.getClient();
  const ref = await client
    .db("gaming")
    .collection("referral_codes")
    .countDocuments({ code: msg.text, is_valid: true });

  if (ref === 1) {
    // Code is valid, register user
    // update the code usage
    await client
      .db("gaming")
      .collection("referral_codes")
      .updateOne(
        { code: msg.text, is_valid: true },
        { $set: { is_valid: false, used_by: msg.chat.id } },
      );
    // update the user
    await client
      .db("gaming")
      .collection("users")
      .updateOne(
        { _id: msg.chat.id },
        { $set: { isReferred: true, referral_code: msg.text } },
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
  }
};

module.exports.get_players_by_game_tiers = async (game, tiers) => {
  const client = await db.getClient();
  const txs = await client
    .db("gaming")
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
    .db("gaming")
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
    .db("gaming")
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
    .db("gaming")
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
