const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = "mongodb+srv://AdminDBGaming:XwcDOXqxXCRV74Nz@cluster0.paxsv.mongodb.net/gaming?retryWrites=true&w=majority";

// var mongojs = require("mongojs");
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("gaming").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  
module.exports.getClient = async () => {
    return new Promise(async (resolve, reject) =>{
        try{
        
            if(!client || !client.topology || !client.topology.isConnected()){
            
                await run().catch(console.dir);
        
            }
            resolve(client)
        
        }catch(e) { 
            console.log('ERROR',e);
            reject(null)
        }
    });
}