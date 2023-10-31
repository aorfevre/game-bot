// math.test.js
var db = require("../database/mongo.js");
const mms = require("mongodb-memory-server");
const helper = require("../custo/helper");
require("dotenv").config();

describe("Mongdb tests", () => {
  beforeAll(async () => {
    mongoServer = await mms.MongoMemoryServer.create();
    process.env.MONGODB_URL = mongoServer.getUri();
  });
  beforeEach(async () => {
    const client = await db.getClient();
    await client.db("gaming").collection("tx").deleteMany({});
  });
  test("Get Mongo Client", async () => {
    // create an array of 1000 items from 0 to 999
    const client = await db.getClient();
    expect(client).not.toBeNull();
  });
  test("Add a participation ", async () => {
    const client = await db.getClient();

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.1,
      number: 1,
      _id: 1,
      payout_wallet: "0x123",
    };

    const hash = await helper.encode(tx);
    const countBefore = await client
      .db("gaming")
      .collection("tx")
      .countDocuments({});
    expect(countBefore).toEqual(0);
    const status = await helper.savePlayTransaction(hash, "txhash");
    const countAfter = await client
      .db("gaming")
      .collection("tx")
      .countDocuments({});
    expect(countAfter).toEqual(1);
  });
  test("Add 2 participations of the same user, pick participants ", async () => {
    const client = await db.getClient();

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };

    const hash = await helper.encode(tx);
    await helper.savePlayTransaction(hash, "txhash");
    await helper.savePlayTransaction(hash, "txhash2");
    const countAfter = await client
      .db("gaming")
      .collection("tx")
      .countDocuments({});
    expect(countAfter).toEqual(2);

    await client
      .db("gaming")
      .collection("tx")
      .updateMany({ verified: false }, { $set: { verified: true } });
    await client
      .db("gaming")
      .collection("tx")
      .updateMany({ tx: null }, { $set: { tx: { hash: "123" } } });
    const txs = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(txs.length).toEqual(1);

    const tx2 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 2,
      payout_wallet: "0x123",
    };

    const hash2 = await helper.encode(tx2);
    await helper.savePlayTransaction(hash2, "txhash");
    await client
      .db("gaming")
      .collection("tx")
      .updateMany({ verified: false }, { $set: { verified: true } });
    await client
      .db("gaming")
      .collection("tx")
      .updateMany({ tx: null }, { $set: { tx: { hash: "123" } } });

    const countAfter2 = await client
      .db("gaming")
      .collection("tx")
      .countDocuments({});
    expect(countAfter2).toEqual(3);
    const txs2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(txs2.length).toEqual(2);
  });
});
