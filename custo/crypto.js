const ethers = require("ethers");
var db = require("../database/mongo.js");

module.exports.transferTo = async (to, amount, game) => {
  try {
    // do a token transfer from private key wallet to to of 1000 USDT on Arbitrum
    // https://docs.ethers.io/v5/api/signer/#Signer-sendTransaction
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PUBLIC_RPC_URL,
    );
    const wallet = new ethers.Wallet(process.env["PK_" + game], provider);

    console.log('wallet',wallet)
    const tx = {
      to: to,
      value: ethers.utils.parseEther(amount.toString()),
    };

    console.log('tx',process.env["PK_" + game],tx)

    const sendPromise = await wallet.sendTransaction(tx);

    const receipt = await sendPromise.wait();

    bot.sendMessage(
      DD_FLOOD,
      `Transfered ${amount} to ${to} for ${game} <a href="${process.env.PUBLIC_EXPLORER_URL}/tx/${receipt.transactionHash}">View on Explorer</a>`,
      { parse_mode: "HTML" },
    );
    return receipt;
  } catch (e) {
    console.log("Error while doing a transfer", e);
    return null;
  }
};

module.exports.looserPotTransfer = async (game) => {
  const client = await db.getClient();

  // Verify if looser put can be processed
  const txsLoosers = await client
    .db(DB_STAGE)
    .collection("tx")
    .find({
      verified: true,
      "decoded.game": game,
      processed: true,
      paid: false,
    })
    .toArray();
  let sumLoosers = 0;
  const ids = [];
  for (const i in txsLoosers) {
    sumLoosers += Number(txsLoosers[i].decoded.price) * 1000;
    ids.push(txsLoosers[i]._id);
  }
  sumLoosers = sumLoosers / 1000;
  if (sumLoosers > 0.1) {
    // Send us the money
    let receiptUs = null;
    if (process.env.JEST_TEST !== "1") {
      receiptUs = await this.transferTo(
        process.env.MSIG_TEAM,
        sumLoosers,
        winnerTx.decoded.game,
      );
      await client
        .db(DB_STAGE)
        .collection("tx")
        .updateMany({ _id: { $in: ids } }, { $set: { paid: true } });

      bot.sendMessage(
        DD_FLOOD,
        "POT send to us from " +
          game +
          " => " +
          sumLoosers +
          " ETH\n" +
          "<a href='" +
          process.env.PUBLIC_EXPLORER_URL +
          "/tx/" +
          receiptUs.transactionHash +
          "'>View on Explorer</a>",
        { parse_mode: "HTML" },
      );
    } else {
      receiptUs = { transactionHash: "0x123" };
    }
  } else {
    if (process.env.JEST_TEST !== "1") {
      bot.sendMessage(
        DD_FLOOD,
        "Game Paper Scissors pot size : " + sumLoosers + " ETH ",
      );
    }
  }
};
