require("dotenv").config();
const ethers = require("ethers");

const DISPERSE_CONTRACT = "0xD152f549545093347A162Dce210e7293f1452150";
// const PK_TEST =
//   "0x9211ecc01758559ccb97dc5232350e14dbf6f11c7e7549acda5c64a32520b488";
const disperse = this;
const DISPERSE_ABI = require("./abi.json");

async function main({ data, PRIVATE_KEY }) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PUBLIC_RPC_URL
    );
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Get sender address
    console.log("wallet", wallet);
    const SENDER_ADDRESS = wallet.address;

    // Get CSV data
    const dataResult = await parseData(data);
    const addresses = dataResult.addresses;
    const values = dataResult.values;
    const totalAmount = dataResult.totalAmount;
    console.log("totalAmount", totalAmount);

    // // Initialize contract and send token
    var contract = new ethers.Contract(DISPERSE_CONTRACT, DISPERSE_ABI, wallet);

    console.log("addresses, values", addresses.length, values.length);

    const res = await contract.disperseEther(addresses, values,{value:totalAmount});
    console.log("res", res);

    // console.log(res);
    // return res;
  } catch (error) {
    console.error("Error during disperse", error);
  }
}

async function parseData(data) {
  let result = {
    addresses: [],
    values: [],
    totalAmount:  ethers.utils.parseUnits("0", "ether").toBigInt()
  };

  for (const d of data) {
    const address = d.address;
    const value = d.value;
    var isAdr = await disperse.checkSum(address);
    if (isAdr) {
      if (!isNaN(value)) {
        const bigIntValue = ethers.utils.parseUnits(value.toString(), "ether");
        result.addresses.push(address);
        result.values.push(bigIntValue);
        result.totalAmount += bigIntValue.toBigInt();
        console.log("bigIntValue", result);
      }
    } else {
      console.log("ADDRESS IS NOT ADDED");
    }
  }
  return result;
}

module.exports.pay = async (data, pk) => {
  return await main({
    data,
    PRIVATE_KEY: pk,
  });
};

module.exports.checkSum = async (adr) => {
  const r = await ethers.utils.isAddress(adr);
  console.log("Result", r);
  return r;
};

// setTimeout(async () => {
//   console.log("Start Payment", process.env.PK_NUMBERGUESSING);
//   this.pay(
//     [
//       { address: "0x22F5A5280f2f18f1EC5342987704ff56eAbA9860", value: 0.0001 },
//       { address: "0xd251C79fC507305879CeF512708d8f97599239f4", value: 0.0001 },
//     ],
//     process.env.PK_NUMBERGUESSING
//   );
// });
