var db = require('../database/mongo.js')
const ethers = require("ethers");

var CryptoJS = require("crypto-js");

// create a function to encode using a Private Key an object
module.exports.encode = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.PRIVATE_KEY
  ).toString();
};

// create a function to decode using a public key an object
module.exports.decode = (data) => {
  try {
    var bytes = CryptoJS.AES.decrypt(data, process.env.PRIVATE_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.log("error", e);
    return null;
  }
};

module.exports.updateUser = async(msg)=>{
    const client = await db.getClient();
    const users = await client.db('gaming').collection('users').find({_id:msg.chat.id}).toArray()
    if(!users.length){
        let user = msg.chat ; 
        user._id = msg.chat.id;
        user._created_at = new Date();
        user._update_at = new Date();
        await client.db('gaming').collection('users').insertOne(user);
        return user;
    }else{
        let user = users[0];
        user._update_at = new Date();
        await client.db('gaming').collection('users').updateOne({_id:msg.chat.id},{$set:user})
        return user;

    }
}

module.exports.savePlayTransaction = async(hash,txhash)=>{
    const client = await db.getClient();
    const tx = await client.db('gaming').collection('tx').find({txhash,hash}).toArray()
    if(!tx.length){
        let decoded = this.decode(decodeURIComponent(hash));
        if(!decoded){
            return null;
        }
        let tx = {
            txhash,
            hash,
            decoded,
            _created_at : new Date(),
            verified:false
        }
        await client.db('gaming').collection('tx').insertOne(tx);
        return tx;
    }else{
        return null;
    }
}

module.exports.verifyTransaction = async(obj)=>{
    // Connect to ethers RPC on Sepolia 
    const provider = new ethers.providers.JsonRpcProvider(process.env.PUBLIC_RPC_URL);

    // fetch transaction by hash
    const tx = await provider.getTransaction(obj.txhash);
    if(tx){
        
        const client = await db.getClient();
        await client.db('gaming').collection('tx').updateOne({_id:obj._id},{$set:{verified:true,tx}})
        let txt = `Transaction ${obj.txhash} verified`;
        txt+=`\n\n`;
        txt+=`${obj.decoded.price} ${obj.decoded.mode} registered for ${obj.decoded.game}`;
        const options = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        };
        bot.sendMessage(obj.decoded.user,txt,options)
    }else{
        console.log('tx not found');

    }
}
module.exports.findAllUnverifiedTransactions = async()=>{
    const client = await db.getClient();
    const txs = await client.db('gaming').collection('tx').find({verified:false}).toArray();
    for(const i in txs){
        await this.verifyTransaction(txs[i]);
    }
}
