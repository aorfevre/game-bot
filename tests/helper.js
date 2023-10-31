var db = require("../database/mongo.js");
const helper = require("../custo/helper");

module.exports.addTx = async (tx) => {
  const client = await db.getClient();

  const hash1 = await helper.encode(tx);
  await helper.savePlayTransaction(hash1, "txhash");
  await client
    .db("gaming")
    .collection("tx")
    .updateMany({ verified: false }, { $set: { verified: true } });
  await client
    .db("gaming")
    .collection("tx")
    .updateMany({ tx: null }, { $set: { tx: { hash: "123" } } });
};
