// math.test.js
const rps = require("../games/rock_paper_scissors");
const helper = require("../custo/helper");
const mms = require("mongodb-memory-server");
require("dotenv").config();
var db = require("../database/mongo.js");
var helperJest = require("./helper.js");

describe("Rock Paper Scissors PvP", () => {
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

  test("After a win, set the winner as winner and looser as looser", async () => {
    const client = await db.getClient();

    const tx1 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };
    const tx2 = {
      action: "PAPER",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 2,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx1);
    await helperJest.addTx(tx2);

    const transactions = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );

    expect(transactions.length).toEqual(2);
    const shuffled = rps.shuffle(transactions);
    expect(shuffled.length).toEqual(1);
    expect(shuffled[0].length).toEqual(2);

    const countBefore = await client
      .db("gaming")
      .collection("pvp")
      .countDocuments({});
    expect(countBefore).toEqual(0);

    await rps.duel();
    const count = await client
      .db("gaming")
      .collection("pvp")
      .countDocuments({});
    expect(count).toEqual(1);

    // No more game available
    const transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(0);

    // check pvp object
    const pvp = await client.db("gaming").collection("pvp").find({}).toArray();
    expect(pvp[0].winner).toEqual(tx2._id);
    expect(pvp[0].looser).toEqual(tx1._id);
  });

  //   test("After a draw, each user shall be able to play one game for free", () => {
  //     expect(1).toBe(2)

  //   });

  test("Group users by tiers", async () => {
    const client = await db.getClient();

    const tx1 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0012,
      number: 1,
      tiers: "2",
      _id: 1,
      payout_wallet: "0x123",
    };
    const tx2 = {
      action: "PAPER",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 2,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx1);
    await helperJest.addTx(tx2);

    let transactions = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions.length).toEqual(1);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "2",
    );
    expect(transactions2.length).toEqual(1);
    const tx3 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0012,
      number: 1,
      tiers: "2",
      _id: 3,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx3);

    transactions = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions.length).toEqual(1);
    transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "2",
    );

    expect(transactions2.length).toEqual(2);
  });

  test("Same player plays multiple times", async () => {
    const client = await db.getClient();

    const tx3 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 5,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx3);
    let transactions = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions.length).toEqual(1);

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 5,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(1);
  });

  test("Player has played 5 times. After a play remains 4 play", async () => {
    const client = await db.getClient();

    const tx3 = {
      action: "PAPER",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 5,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x1234",
    };

    await helperJest.addTx(tx3);

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(2);

    // Do the duel and check that the number of play remaining is 4
    await rps.duel();
    let transactions3 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions3.length).toEqual(1);

    for (let i = 0; i < 4; i++) {
      await helperJest.addTx(tx);
      let transactions6 = await helper.get_players_by_game_tiers(
        "ROCKPAPERSCISSORS",
        "1",
      );
      expect(transactions6.length).toEqual(2);
      await rps.duel();
      let transactions4 = await helper.get_players_by_game_tiers(
        "ROCKPAPERSCISSORS",
        "1",
      );
    }
    let transactions5 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions5.length).toEqual(0);
  });

  test("After a draw, the user has a free game", async () => {
    const client = await db.getClient();

    const tx3 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x1234",
    };

    await helperJest.addTx(tx3);

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(2);

    // Do the duel and check that the number of play remaining is 4
    await rps.duel();
    let transactions5 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions5.length).toEqual(0);

    //check if we have free games available

    let transactions_free = await helper.get_free_games(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions_free.length).toEqual(2);
  });

  test("After a draw, iteration is decreased", async () => {
    const client = await db.getClient();

    const tx3 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 5,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x1234",
    };

    await helperJest.addTx(tx3);

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(2);

    // Do the duel and check that the number of play remaining is 4
    await rps.duel();
    let trx_final = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(trx_final.length).toEqual(1);
    expect(trx_final[0].decoded.number).toEqual(4);
  });

  test("After a draw, the user has a free game and use it", async () => {
    const client = await db.getClient();

    const tx3 = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 5,
      tiers: "1",
      _id: 3,
      payout_wallet: "0x1234",
    };

    await helperJest.addTx(tx3);

    const tx = {
      action: "ROCK",
      game: "ROCKPAPERSCISSORS",
      price: 0.0006,
      number: 1,
      tiers: "1",
      _id: 1,
      payout_wallet: "0x123",
    };

    await helperJest.addTx(tx);
    let transactions2 = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      "1",
    );
    expect(transactions2.length).toEqual(2);

    // Do the duel and check that the number of play remaining is 4
    await rps.duel();
    let count = await helper.get_free_games_by_user_game(
      1,
      "ROCKPAPERSCISSORS",
    );
    expect(count.length).toBe(1);
    // expect(count[0]._id.tiers).toBe("1")
    expect(count[0].count).toBe(1);
    // user can play one game for free
  });
});
