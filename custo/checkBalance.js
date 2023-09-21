const { ethers } = require("ethers");
const { default: axios } = require("axios");



const walletsRP = [
  {
    wallet: "0x5A801329A490665b876a0279e7CAbA990D6C739e",
    name: "ETH SAFE",
    balance: 0,
    network: "eth",
  },
//   {
//     wallet: "0x1026825636EE709cA6f662fd9894c07F8a763053",
//     name: "MATIC SAFE",
//     balance: 0,
//     network: "matic",

//   },

//   {
//     wallet: "0xce515e29Ed0A00102610b99DC5D5082BfA5f47C3",
//     name: "BNB SAFE",
//     balance: 0,
//     network: "bnb",

//   },
];

const usdcErc20 = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const usdcBep20 = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const usdtErc20 = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const usdtBep20 = "0x55d398326f99059ff775485246999027b3197955";
const usdtMat20 = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const usdcMat20 = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

// The minimum ABI required to get the ERC20 Token balance
const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "symbol", type: "string" }],
    type: "function",
  },
];


async function getBalance(w, token, network) {
  try {
    const tokenAddress = token;
    const walletAddress = w.wallet;

    
    let provider = "https://bsc-dataseed.binance.org/";
    if (network === "eth") {
      provider = "https://eth.llamarpc.com";
    }else if(network ==='matic'){
        provider = 'https://polygon.llamarpc.com'
    }
    const Web3Client = new ethers.providers.JsonRpcProvider(provider)
    

    const contract = new ethers.Contract( tokenAddress,minABI,Web3Client);
    const result = await contract.balanceOf(walletAddress); // 29803630997051883414242659
    console.log("result",result);

    let format = result.toNumber(); // 29803630.997051883414242659

    
    return {
      wallet: w,
      amt: format,
    };
  } catch (e) {
    console.log("Error while getting dumped", e);
  }
}


module.exports.checkBalanceOnceAday = async () => {
  var txt = "<b>🚨💥 Daily Balance Review 🚨💥</b>\n\n";
  let total = 0;
 
  let totalUSDC = 0;
  for (var i in walletsRP) {
    console.log("Get USDC of ", walletsRP[i], usdcErc20);
    if(walletsRP[i].network === "eth"){
        const c = await getBalance(walletsRP[i], usdcErc20,  "eth");
        console.log("walletsRP usdcErc20", c);
        totalUSDC += Number(c.amt * 1000000 * 1000000);
        txt +=
        "+ " +
        Number(c.amt * 1000000 * 1000000).toFixed(2) +
        ' $USDC ERC20 <a href="https://etherscan.com/address/' +
        c.wallet.wallet +
        '">' +
        c.wallet.name +
        "</a>\n";
        walletsRP[i].balance += Number(c.amt * 1000000 * 1000000);
    }
  }

  for (var i in walletsRP) {
    if(walletsRP[i].network === "bnb"){

        console.log("Get USDC of ", walletsRP[i], usdcBep20);
        const c = await getBalance(walletsRP[i], usdcBep20,  "bsc");
        console.log("walletsRP usdcBep20", c);
        totalUSDC += Number(c.amt);
        txt +=
        "+ " +
        Number(c.amt).toFixed(2) +
        ' $USDC BEP20 <a href="https://bscscan.com/address/' +
        c.wallet.wallet +
        '">' +
        c.wallet.name +
        "</a>\n";
        walletsRP[i].balance += Number(c.amt);
    }
  }

  for (var i in walletsRP) {
    if(walletsRP[i].network === "matic"){

        console.log("Get USDC of ", walletsRP[i], usdcMat20);
        const c = await getBalance(walletsRP[i], usdcMat20,  "matic");
        console.log("walletsRP usdcBep20", c);
        totalUSDC += Number(c.amt);
        txt +=
        "+ " +
        Number(c.amt).toFixed(2) +
        ' $USDC MAT20 <a href="https://polygonscan.com/address/' +
        c.wallet.wallet +
        '">' +
        c.wallet.name +
        "</a>\n";
        walletsRP[i].balance += Number(c.amt);
    }
  }

  let totalUSDT = 0;
  for (var i in walletsRP) {
    if(walletsRP[i].network === "eth"){

        console.log("Get USDT of ", walletsRP[i], usdtErc20);
        const c = await getBalance(walletsRP[i], usdtErc20,  "eth");
        console.log("walletsRP usdtERC20", c);
        totalUSDT += Number(c.amt * 1000000 * 1000000);
        txt +=
        "+ " +
        Number(c.amt * 1000000 * 1000000).toFixed(2) +
        ' $USDT ERC20 <a href="https://etherscan.com/address/' +
        c.wallet.wallet +
        '">' +
        c.wallet.name +
        "</a>\n";
        walletsRP[i].balance += Number(c.amt * 1000000 * 1000000);
    }
  }

  for (var i in walletsRP) {
    if(walletsRP[i].network === "bnb"){

    console.log("Get USDT of ", walletsRP[i], usdtBep20);
    const c = await getBalance(walletsRP[i], usdtBep20,  "bsc");
    console.log("walletsRP usdtBep20", c);
    totalUSDT += Number(c.amt );
    txt +=
      "+ " +
      Number(c.amt ).toFixed(2) +
      ' $USDT BEP20 <a href="https://bscscan.com/address/' +
      c.wallet.wallet +
      '">' +
      c.wallet.name +
      "</a>\n";
    walletsRP[i].balance += Number(c.amt );
    }
  }

  for (var i in walletsRP) {
    if(walletsRP[i].network === "matic"){

        console.log("Get USDC of ", walletsRP[i], usdtMat20);
        const c = await getBalance(walletsRP[i], usdtMat20,  "matic");
        console.log("walletsRP usdcBep20", c);
        totalUSDC += Number(c.amt);
        txt +=
        "+ " +
        Number(c.amt).toFixed(2) +
        ' $USDC MAT20 <a href="https://polygonscan.com/address/' +
        c.wallet.wallet +
        '">' +
        c.wallet.name +
        "</a>\n";
        walletsRP[i].balance += Number(c.amt);
    }
  }

  txt +=
    "-----------------\n" +
    "+ " +

    Number(totalUSDC).toFixed(2) +
    " $USDC\n+ " +
    +Number(totalUSDT).toFixed(2) +
    " $USDT\n" +
    "-----------------\n";
  for (var i in walletsRP) {
    txt +=
      "+ " + 
      Number(walletsRP[i].balance).toFixed(2) +
      " USD <a href='https://debank.com/profile/"+walletsRP[i].wallet+"'>" +
      walletsRP[i].name +
      "</a>\n";
  }
  txt +=
    "-----------------\n<b>" +
    Number(Number(total) + Number(totalUSDC) + Number(totalUSDT)).toFixed(2) +
    " USD</b>";
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_to_message_id: 14616
  };

  bot.sendMessage(-1001746527561, txt,options)


};

module.exports.getRadom = async () => {
    const d = await axios({
        method: 'GET',
        url: 'https://api.radom.network/balance',
        headers: {
          'Authorization': 'eyJhZGRyZXNzIjpudWxsLCJvcmdhbml6YXRpb25faWQiOiJmZTFmYTI4Zi0xOTI4LTRlZjItYjFmNS1iOWYyMTc5NGY3ZTUiLCJzZXNzaW9uX2lkIjoiY2RjMmRiMDAtOTlhYy00MWZmLWI1ZDYtYzk3OWY4ZTg3N2EzIiwiZXhwaXJlZF9hdCI6IjIwMjQtMDktMjBUMTA6MTM6MDEuNDQyMTgzNzU3WiIsImlzX2FwaV90b2tlbiI6dHJ1ZX0=',
          'Content-Type': 'application/json'
        }
      })
      console.log('d',d.data)

      let total = 0;
      let txt = "<b>🚨💥 Daily Radom Balance Review 🚨💥</b>\n\n";
      for(const i in d.data){
      
        const c = d.data[i];

        let provider = "https://bsc-dataseed.binance.org/";
        if (c.network === "Ethereum") {
          provider = "https://eth.llamarpc.com";
        }else if(c.network ==='Polygon'){
           provider = 'https://polygon.llamarpc.com'
        }
        const Web3Client = new ethers.providers.JsonRpcProvider(provider)
        const contract = new ethers.Contract( c.token,minABI,Web3Client);
        const symbol = await contract.symbol()

        txt +=
        "+ " + 
        Number(c.balance) + " " + symbol + " " + c.network + "\n";
        total += Number(c.balance);
      }

      txt +=
      "-----------------\n<b>" +
      Number(Number(total)).toFixed(2) +
      " USD</b>";

      var options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_to_message_id: 14616
      };
    
      bot.sendMessage(-1001746527561, txt,options)


}