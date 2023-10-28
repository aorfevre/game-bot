// math.test.js
const rps = require("../games/rock_paper_scissors");
const helper = require("../custo/helper");

const mms = require("mongodb-memory-server");

describe("Rock Paper Scissors", () => {
  beforeAll(async () => {
    mongoServer = await mms.MongoMemoryServer.create();
    process.env.MONGODB_URL = mongoServer.getUri();
  });
  test("Shuffle shall be random of 1000 items", () => {
    // create an array of 1000 items from 0 to 999
    const txs = Array.from(Array(1000), (x, i) => i);
    expect(txs.length).toEqual(1000);
    const shuffled = rps.shuffle(txs);
    const shuffled2 = rps.shuffle(txs);
    expect(shuffled).not.toEqual(shuffled2);
    expect(shuffled.length).toEqual(500);
  });
  test("Shuffle shall be random of 999 items", () => {
    // create an array of 1000 items from 0 to 999
    const txs = Array.from(Array(999), (x, i) => i);
    expect(txs.length).toEqual(999);
    const shuffled = rps.shuffle(txs);
    const shuffled2 = rps.shuffle(txs);
    expect(shuffled).not.toEqual(shuffled2);
    expect(shuffled.length).toEqual(500);
  });

  test("Shuffle are paired", () => {
    // create an array of 1000 items from 0 to 999
    const txs = Array.from(Array(1000), (x, i) => i);
    expect(txs.length).toEqual(1000);
    const shuffled = rps.shuffle(txs);
    for (const i in shuffled) {
      expect(shuffled[i].length).toEqual(2);
    }
  });

  test("Shuffle are paired and last one has one", () => {
    // create an array of 1000 items from 0 to 999
    const txs = Array.from(Array(999), (x, i) => i);
    expect(txs.length).toEqual(999);
    const shuffled = rps.shuffle(txs);

    for (const i in shuffled) {
      if (Number(i) + 1 !== shuffled.length) {
        expect(shuffled[i].length).toEqual(2);
      } else {
        expect(shuffled[i].length).toEqual(1);
      }
    }
  });

  test("We have a winner ROCK vs PAPER", () => {
    const tx1 = {
      _id: {
        $oid: "6532bf8e4a63ee3a15593152",
      },
      txhash:
        "0x616e2fd9dbcbca9bc16138c5b34af7e86ece8156daaa11f2226e340f218246c2",
      hash: "U2FsdGVkX19H/DinX7jcNYRb0CzxIYzuOfH60m4J7eEefCHu9HRQh+PmhV7BYBUyaC6J64x+USSrMUMBNQi+YfCetkD6uz9lL3f6MZyog/eluhbaVpZ4UZ9Q28O+f0ttU9WPdJGvpb8zvavbL7uT4NfsnZyvtlNXSeSLZS0CKBclxhDXtPlnmBUhRq1Z0HtikVZQBrIkyfhHDq9HG9JoVilfvkScMCFNm0p3z8zePDv0/GvEW4Dga7dV4R3kd3nU75RzW0j+EfR4gtXMs01HD4rbDkEEoAN7VRK1tffXTetULioNYFPxWgaB4W7wfUiR",
      decoded: {
        _id: 517752455,
        _updated_at: "2023-10-20T17:57:25.480Z",
        action: "ROCK",
        game: "ROCKPAPERSCISSORS",
        mode: null,
        number: 1,
        price: 0.0006,
        tiers: "1",
        payout_wallet: "0x05397cd8ac640efb71317986cfac98d201e957ac",
      },
      _created_at: {
        $date: "2023-10-20T17:57:34.898Z",
      },
      verified: true,
      processed: true,
      tx: {
        hash: "0x616e2fd9dbcbca9bc16138c5b34af7e86ece8156daaa11f2226e340f218246c2",
        type: 2,
        accessList: [],
        blockHash:
          "0xcbdcd01d570e9f123984a767e3096aa9e8af8ca2c4b34b0baee6a66416207823",
        blockNumber: 11315520,
        transactionIndex: 3,
        confirmations: 33,
        from: "0x2fd47ADaD57a79DE43ECaafdF06E4047f6e13f08",
        gasPrice: {
          _hex: "0x59682f32",
          _isBigNumber: true,
        },
        maxPriorityFeePerGas: {
          _hex: "0x59682f00",
          _isBigNumber: true,
        },
        maxFeePerGas: {
          _hex: "0x59682f3c",
          _isBigNumber: true,
        },
        gasLimit: {
          _hex: "0x7b0c",
          _isBigNumber: true,
        },
        to: "0x05397cd8AC640efb71317986CfAC98D201E957AC",
        value: {
          _hex: "0x0221b262dd8000",
          _isBigNumber: true,
        },
        nonce: 8,
        data: "0x",
        r: "0x6cac6f268aae9972a629e97aed692cfa175f1cae783944344164161212bedcf0",
        s: "0x4f17ab9aca5d65be1cab94e64c7a113e5b61caa06c3b86680c5d091a65b75f02",
        v: 0,
        creates: null,
        chainId: 84531,
      },
      paid: false,
    };
    const tx2 = {
      _id: {
        $oid: "6532bfb94a63ee3a15593153",
      },
      txhash:
        "0x7608aca444d839fc335a77bc84908cea37e96c6cda04c3a81471442108d7f0fa",
      hash: "U2FsdGVkX1/9GIgh3h0bwFZO9ucblSGhHRR4Qn9qOt/HT0D5TaraXDjDxrC8zRuj7bWqKV5h/OAiHSL4ZP6Hdscf5qt0bHqKDFLkF6uvRiUuNOFP/WIqScC+IGMrszxxVsJzd4KfSkfvMH/95b5LeeWsX9vv7s0L1xSKe3td9vdwLo/p0W7dfAnR53OnickPt5u/m/d/l6YMgg34c3pV1CX6j+32JOyXfzMZuC857rTZP1LubJRCldcxTUTK0i/xWbzYfFFbKc6s9afZVq1Jg3qiauLlfhnj6/JEc9FEzx2uZR5hc850Fcjpo7Frlw18",
      decoded: {
        _id: 359774701,
        _updated_at: "2023-10-20T17:58:08.991Z",
        action: "PAPER",
        game: "ROCKPAPERSCISSORS",
        mode: null,
        number: 1,
        price: 0.0006,
        tiers: "1",
        payout_wallet: "0x05397cd8ac640efb71317986cfac98d201e957ac",
      },
      _created_at: {
        $date: "2023-10-20T17:58:17.173Z",
      },
      verified: true,
      processed: true,
      tx: {
        hash: "0x7608aca444d839fc335a77bc84908cea37e96c6cda04c3a81471442108d7f0fa",
        type: 2,
        accessList: [],
        blockHash:
          "0xef6f55fe19ac42c81d300596f41d2a3878b3350e5124412036abea14f06395a2",
        blockNumber: 11315541,
        transactionIndex: 5,
        confirmations: 13,
        from: "0x2fd47ADaD57a79DE43ECaafdF06E4047f6e13f08",
        gasPrice: {
          _hex: "0x59682f32",
          _isBigNumber: true,
        },
        maxPriorityFeePerGas: {
          _hex: "0x59682f00",
          _isBigNumber: true,
        },
        maxFeePerGas: {
          _hex: "0x59682f3c",
          _isBigNumber: true,
        },
        gasLimit: {
          _hex: "0x7b0c",
          _isBigNumber: true,
        },
        to: "0x05397cd8AC640efb71317986CfAC98D201E957AC",
        value: {
          _hex: "0x0221b262dd8000",
          _isBigNumber: true,
        },
        nonce: 9,
        data: "0x",
        r: "0x8e39b82f1fda8f926ae1bf65d3ac9788ec8e4753ac55b4f11162cf47b05bca9c",
        s: "0x7fd4ceee8fc7f5059dc875759ad2996aed4d9cee5afbc74970809a23d1bfc09b",
        v: 0,
        creates: null,
        chainId: 84531,
      },
      paid: false,
    };

    const wl = rps.getWinnerLooser(tx1, tx2);
    expect(wl.winner._id).toEqual(359774701);
    expect(wl.looser._id).toEqual(517752455);
    expect(wl.draw).toEqual(false);
  });

  test("We have a draw PAPER vs PAPER", () => {
    const tx1 = {
      _id: {
        $oid: "6532bf8e4a63ee3a15593152",
      },
      txhash:
        "0x616e2fd9dbcbca9bc16138c5b34af7e86ece8156daaa11f2226e340f218246c2",
      hash: "U2FsdGVkX19H/DinX7jcNYRb0CzxIYzuOfH60m4J7eEefCHu9HRQh+PmhV7BYBUyaC6J64x+USSrMUMBNQi+YfCetkD6uz9lL3f6MZyog/eluhbaVpZ4UZ9Q28O+f0ttU9WPdJGvpb8zvavbL7uT4NfsnZyvtlNXSeSLZS0CKBclxhDXtPlnmBUhRq1Z0HtikVZQBrIkyfhHDq9HG9JoVilfvkScMCFNm0p3z8zePDv0/GvEW4Dga7dV4R3kd3nU75RzW0j+EfR4gtXMs01HD4rbDkEEoAN7VRK1tffXTetULioNYFPxWgaB4W7wfUiR",
      decoded: {
        _id: 517752455,
        _updated_at: "2023-10-20T17:57:25.480Z",
        action: "PAPER",
        game: "ROCKPAPERSCISSORS",
        mode: null,
        number: 1,
        price: 0.0006,
        tiers: "1",
        payout_wallet: "0x05397cd8ac640efb71317986cfac98d201e957ac",
      },
      _created_at: {
        $date: "2023-10-20T17:57:34.898Z",
      },
      verified: true,
      processed: true,
      tx: {
        hash: "0x616e2fd9dbcbca9bc16138c5b34af7e86ece8156daaa11f2226e340f218246c2",
        type: 2,
        accessList: [],
        blockHash:
          "0xcbdcd01d570e9f123984a767e3096aa9e8af8ca2c4b34b0baee6a66416207823",
        blockNumber: 11315520,
        transactionIndex: 3,
        confirmations: 33,
        from: "0x2fd47ADaD57a79DE43ECaafdF06E4047f6e13f08",
        gasPrice: {
          _hex: "0x59682f32",
          _isBigNumber: true,
        },
        maxPriorityFeePerGas: {
          _hex: "0x59682f00",
          _isBigNumber: true,
        },
        maxFeePerGas: {
          _hex: "0x59682f3c",
          _isBigNumber: true,
        },
        gasLimit: {
          _hex: "0x7b0c",
          _isBigNumber: true,
        },
        to: "0x05397cd8AC640efb71317986CfAC98D201E957AC",
        value: {
          _hex: "0x0221b262dd8000",
          _isBigNumber: true,
        },
        nonce: 8,
        data: "0x",
        r: "0x6cac6f268aae9972a629e97aed692cfa175f1cae783944344164161212bedcf0",
        s: "0x4f17ab9aca5d65be1cab94e64c7a113e5b61caa06c3b86680c5d091a65b75f02",
        v: 0,
        creates: null,
        chainId: 84531,
      },
      paid: false,
    };
    const tx2 = {
      _id: {
        $oid: "6532bfb94a63ee3a15593153",
      },
      txhash:
        "0x7608aca444d839fc335a77bc84908cea37e96c6cda04c3a81471442108d7f0fa",
      hash: "U2FsdGVkX1/9GIgh3h0bwFZO9ucblSGhHRR4Qn9qOt/HT0D5TaraXDjDxrC8zRuj7bWqKV5h/OAiHSL4ZP6Hdscf5qt0bHqKDFLkF6uvRiUuNOFP/WIqScC+IGMrszxxVsJzd4KfSkfvMH/95b5LeeWsX9vv7s0L1xSKe3td9vdwLo/p0W7dfAnR53OnickPt5u/m/d/l6YMgg34c3pV1CX6j+32JOyXfzMZuC857rTZP1LubJRCldcxTUTK0i/xWbzYfFFbKc6s9afZVq1Jg3qiauLlfhnj6/JEc9FEzx2uZR5hc850Fcjpo7Frlw18",
      decoded: {
        _id: 359774701,
        _updated_at: "2023-10-20T17:58:08.991Z",
        action: "PAPER",
        game: "ROCKPAPERSCISSORS",
        mode: null,
        number: 1,
        price: 0.0006,
        tiers: "1",
        payout_wallet: "0x05397cd8ac640efb71317986cfac98d201e957ac",
      },
      _created_at: {
        $date: "2023-10-20T17:58:17.173Z",
      },
      verified: true,
      processed: true,
      tx: {
        hash: "0x7608aca444d839fc335a77bc84908cea37e96c6cda04c3a81471442108d7f0fa",
        type: 2,
        accessList: [],
        blockHash:
          "0xef6f55fe19ac42c81d300596f41d2a3878b3350e5124412036abea14f06395a2",
        blockNumber: 11315541,
        transactionIndex: 5,
        confirmations: 13,
        from: "0x2fd47ADaD57a79DE43ECaafdF06E4047f6e13f08",
        gasPrice: {
          _hex: "0x59682f32",
          _isBigNumber: true,
        },
        maxPriorityFeePerGas: {
          _hex: "0x59682f00",
          _isBigNumber: true,
        },
        maxFeePerGas: {
          _hex: "0x59682f3c",
          _isBigNumber: true,
        },
        gasLimit: {
          _hex: "0x7b0c",
          _isBigNumber: true,
        },
        to: "0x05397cd8AC640efb71317986CfAC98D201E957AC",
        value: {
          _hex: "0x0221b262dd8000",
          _isBigNumber: true,
        },
        nonce: 9,
        data: "0x",
        r: "0x8e39b82f1fda8f926ae1bf65d3ac9788ec8e4753ac55b4f11162cf47b05bca9c",
        s: "0x7fd4ceee8fc7f5059dc875759ad2996aed4d9cee5afbc74970809a23d1bfc09b",
        v: 0,
        creates: null,
        chainId: 84531,
      },
      paid: false,
    };

    const wl = rps.getWinnerLooser(tx1, tx2);
    expect(wl.winner).toEqual(null);
    expect(wl.looser).toEqual(null);
    expect(wl.draw).toEqual(true);
  });

  test("No participants", async () => {
    const users = await helper.get_players_by_game_tiers(
      "ROCKPAPERSCISSORS",
      1
    );
    expect(users.length).toEqual(0);
  });

//   test("Adding 2 partipants and drawing a game", async () => {
//     const users = await helper.get_players_by_game_tiers(
//       "ROCKPAPERSCISSORS",
//       1
//     );
//     expect(users.length).toEqual(0);
//     const shuffled = rps.shuffle(users);
//     console.log('Shuffled',shuffled)
//     expect(shuffled.length).toEqual(1);
//   });
  
});
