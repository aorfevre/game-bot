require("dotenv").config();
const { Web3 } = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const disperse = this;
// if (dotenv.error) throw result.error
// const env = dotenv.parsed

const DISPERSE_CONTRACT = "0xD152f549545093347A162Dce210e7293f1452150"





async function main({ data, PRIVATE_KEY }) {
  try {
    const provider = new HDWalletProvider([PRIVATE_KEY], process.env.PUBLIC_RPC_URL);
    const web3 = new Web3(provider);

    // let account = web3.eth.accounts.create(web3.utils.randomHex(32));
    // let wallet = web3.eth.accounts.wallet.add(account);
    // let  = wallet.encrypt(web3.utils.randomHex(32));

    // Set up web3 object
    // const web3 = new Web3(new Web3.providers.HttpProvider(env.URL)); // For test
    await bot.sendMessage(359774701, "Connecting to Network...");
    // Get sender address
    const accountObj = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    const SENDER_ADDRESS = accountObj.address;

    // Get CSV data
    const dataResult = await parseData(data,web3);
    const addresses = dataResult.addresses;
    const values = dataResult.values;
    const totalAmount = dataResult.totalAmount;
    console.log("totalAmount", totalAmount);
    await bot.sendMessage(359774701, "Approving senders..." + totalAmount);



    // // Initialize contract and send token
    // var contract = new web3.eth.Contract(
    //   require("../abi.json"),
    //   CONTRACT_ADDRESS
    // );
    // await bot.sendMessage(359774701, "Gas fee estimate...");

    // var gasEstimate = await contract.methods
    //   .disperseToken(TOKEN_ADDRESS, addresses, values)
    //   .estimateGas({
    //     from: SENDER_ADDRESS,
    //   });

    // var averageGasPrice = await getGasFee();

    // await bot.sendMessage(359774701, "Disperse token...");

    // const res = await contract.methods
    //   .disperseToken(TOKEN_ADDRESS, addresses, values)
    //   .send({
    //     gas: gasEstimate,
    //     gasPrice: averageGasPrice,
    //     from: SENDER_ADDRESS,
    //   });
    // await bot.sendMessage(359774701, "Finished Disperse");

    // console.log(res);
    // return res;
  } catch (error) {
    console.error("Error during disperse", error);
  }
}


async function getGasFee() {
  // const result = await ('https://ethgasstation.info/api/ethgasAPI.json?', {
  //   json: true
  // })
  //
  // return result.body.fastest / 10

  return await web3.eth.getGasPrice();
}

async function parseData(data,web3) {
  let result = {
    addresses: [],
    values: [],
    totalAmount: BigInt(0),
  };

  for (const d of data) {
    const address = d.address;
    const value = d.value
    var isAdr = await disperse.checkSum(address,  web3);
    if (isAdr) {
      if (!isNaN(value * Math.pow(10, 18))) {
        const bigIntValue = BigInt(value * Math.pow(10, 18));
        result.addresses.push(address);
        result.values.push(bigIntValue);
        result.totalAmount += bigIntValue;
      }
    } else {
      console.log("ADDRESS IS NOT ADDED");
    }
  }
  console.log("RESULT", result);
  return result;
}

module.exports.pay = async (data,pk) => {
  return await main({
    data,
    PRIVATE_KEY:pk
  });
};

module.exports.checkSum = async (adr,web3) => {
  return await web3.utils.isAddress(adr);
};


setTimeout(async()=>{
    console.log('Start Payment',process.env.PK_NUMBERGUESSING)
    this.pay(
        [{address: '0x22F5A5280f2f18f1EC5342987704ff56eAbA9860',value: 0.00000001},
        {address: '0xd251C79fC507305879CeF512708d8f97599239f4',value: 0.00000001}],
        process.env.PK_NUMBERGUESSING
    )
})