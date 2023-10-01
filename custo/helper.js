var db = require("../database/mongo.js");
const ethers = require("ethers");

var CryptoJS = require("crypto-js");

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
    return null;
  }
  try {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      process.env.PRIVATE_KEY
    ).toString();
  } catch (e) {
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

module.exports.verifyTransaction = async (obj) => {
  // Connect to ethers RPC on Sepolia
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PUBLIC_RPC_URL
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

    txt += "Current prize pool: XXX ETH\n\n";

    txt += "Tournament ends in: XXX HOURS\n\n";

    txt += "We'll notify you of your payout when the torunament finishes\n\n";

    txt += "Summary of your participation:\n";
    txt += "Game : " + obj.decoded.game + "\n";
    txt += "Action : " + obj.decoded.action + "\n";
    txt += "Bet size per play : " + obj.decoded.price + "\n";
    txt += "Number of plays : " + obj.decoded.number + "\n";
    txt += "Total bet : " + obj.decoded.price * obj.decoded.number + "\n";
    txt += "<a href='https://basescan.org/tx/"+obj.txhash+"'>Txhash</a>n";

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

    await bot.sendMessage(obj.decoded.user, txt, {
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
        [
          {
            text: "🚨 Prisoner's Dilemma",
            callback_data: "GUIDE_GAME_PRISONER",
          },
        ],
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
