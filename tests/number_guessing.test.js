// math.test.js
const ng = require("../games/number_guessing");
const helper = require("../custo/helper");
var helperJest = require("./helper.js");
var db = require("../database/mongo.js");
require("dotenv").config();

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

  // test("User can register up to 10 participants, no game launched until", async () => {
  //   const client = await db.getClient();
  //   const nums = []
  //   for (const i in [1,2,3,4,5,6,7,8,9,10]) {
  //     // random between 0 to 100
  //     let random = -1;
  //     while (random === -1){
  //       const randomNew = Math.floor(Math.random() * 100);
  //       if(!nums.includes(randomNew)){
  //         random = randomNew;
  //         nums.push(randomNew)
  //       }
  //     }
  //     const tx3 = {
  //       action: random,
  //       game: "NUMBERGUESSING",
  //       price: 0.0006,
  //       number: 1,
  //       tiers: "1",
  //       _id: i,
  //       payout_wallet: "0x1234",
  //     };

  //     await helperJest.addTx(tx3);

  //     const countBefore = await client
  //     .db("gaming")
  //     .collection("pvp")
  //     .countDocuments({});
  //       expect(countBefore).toEqual(0);
  //       await ng.payout();

      
  //   }
  //   const countAfter = await client
  //   .db("gaming")
  //   .collection("pvp")
  //   .countDocuments({});
  //   expect(countAfter).toEqual(1);

  //   const getDuel = await client
  //   .db("gaming")
  //   .collection("pvp")
  //   .findOne({})

  //   expect(getDuel.winners.length).toEqual(1);
  //   expect(getDuel.loosers.length).toEqual(9);
  //   expect(getDuel.prizePool).toEqual(((0.0006*10*9)*1000/10)/1000);

 
  // });
  test("We have 2 winners and 8 loosers", async () => {
    const client = await db.getClient();
    const nums = [];
    let iteration = 0;
    const arr = [1,1,3,3,6,6,7,8,9,10];
    for (const i in arr) {
      // random between 0 to 100
        iteration ++;
      const tx3 = {
        action: arr[i],
        game: "NUMBERGUESSING",
        price: 0.0006,
        number: 1,
        tiers: "1",
        _id: iteration,
        payout_wallet: "0x1234",
      };

      await helperJest.addTx(tx3); 

      const countBefore = await client
      .db("gaming")
      .collection("pvp")
      .countDocuments({});
        expect(countBefore).toEqual(0);
        await ng.payout();

      
    }
    const countAfter = await client
    .db("gaming")
    .collection("pvp")
    .countDocuments({});
    expect(countAfter).toEqual(1);

    const getDuel = await client
    .db("gaming")
    .collection("pvp")
    .findOne({})

    expect(getDuel.winners.length).toEqual(2);
    expect(getDuel.loosers.length).toEqual(8);
    expect(getDuel.prizePool).toEqual(((0.0006*10*9)*1000/10)/1000);

  });
  // We have 10 winners / 0 loosers 
  test("We have 10 winners and 0 loosers", async () => {
    const client = await db.getClient();
    const nums = [];
    let iteration = 0;
    const arr = [1,1,1,1,1,1,1,1,1,1];
    for (const i in arr) {
      // random between 0 to 100
        iteration ++;
      const tx3 = {
        action: arr[i],
        game: "NUMBERGUESSING",
        price: 0.0006,
        number: 1,
        tiers: "1",
        _id: iteration,
        payout_wallet: "0x1234",
      };

      await helperJest.addTx(tx3); 

      const countBefore = await client
      .db("gaming")
      .collection("pvp")
      .countDocuments({});
        expect(countBefore).toEqual(0);
        await ng.payout();

      
    }
    const countAfter = await client
    .db("gaming")
    .collection("pvp")
    .countDocuments({});
    expect(countAfter).toEqual(1);

    const getDuel = await client
    .db("gaming")
    .collection("pvp")
    .findOne({})

    expect(getDuel.winners.length).toEqual(10);
    expect(getDuel.loosers.length).toEqual(0);
    expect(getDuel.prizePool).toEqual(((0.0006*10*9)*1000/10)/1000);

  });
  // verify fee reward / calculation

});
