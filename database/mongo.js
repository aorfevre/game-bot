const { MongoClient, ServerApiVersion } = require("mongodb");

const mongo = this;
require("dotenv").config();

global.mongoClient = null;
module.exports.getClient = async () => {
  const uri = process.env.MONGODB_URL;
  // var mongojs = require("mongojs");
  if (mongoClient === null) {
    mongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }
  return new Promise(async (resolve, reject) => {
    try {
      if (!mongoClient || !mongoClient.topology || !mongoClient.topology.isConnected()) {

        await run(mongoClient).catch(console.dir);
      }
      resolve(mongoClient);
    } catch (e) {
      console.log("ERROR", e);
      reject(null);
    }
  });
};

async function createIndexes(client) {
  const users = await client.db(DB_STAGE).collection("users");
  users.createIndex({ _id: 1, _update_at: 1 }, { unique: true });
  const tx = await client.db(DB_STAGE).collection("tx");
  tx.createIndex({ txhash: 1, hash: 1 }, {});
  tx.createIndex({ _id: 1 }, {});
  tx.createIndex(
    {
      verified: 1,
      "decoded.game": 1,
      processed: 1,
      paid: 1,
      "decoded.tiers": 1,
      "decoded.action": 1,
    },
    {},
  );
  tx.createIndex({ txhash: 1, hash: 1 }, {});
  tx.createIndex({ "decoded._id": 1 }, {});

  const user_choice = await client.db(DB_STAGE).collection("user_choice");
  user_choice.createIndex({ user_choice: 1 }, {});
  user_choice.createIndex({ "decoded._id": 1, verified: 1, processed: 1 }, {});

  const refCodes = await client.db(DB_STAGE).collection("user_choice");
  refCodes.createIndex({ code: 1, is_valid: 1 }, {});
  refCodes.createIndex({ referrer: 1, is_valid: 1 }, {});

  const messages = await client.db(DB_STAGE).collection("messages");
  messages.createIndex({ _id: 1 }, {});

  const referral_codes = await client.db(DB_STAGE).collection("referral_codes");
  referral_codes.createIndex({ referrer: 1 }, {});
  referral_codes.createIndex({ code: 1, is_valid: 1 }, {});

  const pvp = await client.db(DB_STAGE).collection("pvp");
  pvp.createIndex({ _id: 1, prizePool: 1 }, {});
  pvp.createIndex({ code: 1, processed: 1 }, {});
}

async function run(client) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    await client.db(DB_STAGE).command({ ping: 1 });

    // createIndexes(client);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
