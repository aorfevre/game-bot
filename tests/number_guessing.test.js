// math.test.js
const ng = require("../games/number_guessing");
const helper = require("../custo/helper");
var helperJest = require("./helper.js");
var db = require("../database/mongo.js");

const mms = require("mongodb-memory-server");

describe("Rock Paper Scissors", () => {
  beforeAll(async () => {
    mongoServer = await mms.MongoMemoryServer.create();
    process.env.MONGODB_URL = mongoServer.getUri();
    process.env.JEST_TEST = "1";
  });
  beforeEach(async () => {
    const client = await db.getClient();
    await client.db("gaming").collection("tx").deleteMany({});
    await client.db("gaming").collection("pvp").deleteMany({});
  });

  test("User can register up to 10 participants, no game launched until", async () => {
    const client = await db.getClient();

    for (const i in [1]) {
      // random between 0 to 100
      const random = Math.floor(Math.random() * 100);
      console.log("random", random, i);
      const tx3 = {
        action: random,
        game: "NUMBERGUESSING",
        price: 0.0006,
        number: 1,
        tiers: "1",
        _id: i,
        payout_wallet: "0x1234",
      };
      console.log("tx3", tx3);

      await helperJest.addTx(tx3);
    }

    const countBefore = await client
      .db("gaming")
      .collection("pvp")
      .countDocuments({});
    expect(countBefore).toEqual(0);

    //   await ng.payout();
  });
});
