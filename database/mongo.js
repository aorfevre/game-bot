const { MongoClient, ServerApiVersion } = require("mongodb");

module.exports.getClient = async () => {
  const uri = process.env.MONGODB_URL;
  // var mongojs = require("mongojs");
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  return new Promise(async (resolve, reject) => {
    try {
      if (!client || !client.topology || !client.topology.isConnected()) {
        await run(client).catch(console.dir);
      }
      resolve(client);
    } catch (e) {
      console.log("ERROR", e);
      reject(null);
    }
  });
};

async function createIndexes() {
  const users = await client.db("gaming").collection("users");
  users.createIndex({ _id: 1, _update_at: 1 }, { unique: true });
  const tx = await client.db("gaming").collection("tx");
  tx.createIndex({ txhash: 1, hash: 1 }, {});
  tx.createIndex({ _id: 1 }, {});
  tx.createIndex({ verified: 1 }, {});

  const user_choice = await client.db("gaming").collection("user_choice");
  user_choice.createIndex({ user_choice: 1 }, {});
  user_choice.createIndex({ "decoded._id": 1, verified: 1, processed: 1 }, {});

  const refCodes = await client.db("gaming").collection("user_choice");
  refCodes.createIndex({ code: 1, is_valid: 1 }, {});
  refCodes.createIndex({ referrer: 1, is_valid: 1 }, {});

  console.log("Index created");
}

async function run(client) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("gaming").command({ ping: 1 });

    // createIndexes();
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
