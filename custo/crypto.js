const ethers = require("ethers");


module.exports.transferTo = async(to,amount,game)=>{


   // do a token transfer from private key wallet to to of 1000 USDT on Arbitrum 
    // https://docs.ethers.io/v5/api/signer/#Signer-sendTransaction
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.PUBLIC_RPC_URL,
      );
    const wallet = new ethers.Wallet(process.env['PK_'+game], provider);

        const tx = {
            to: to,
            value: ethers.utils.parseEther(amount),
        };
        const sendPromise = await wallet.sendTransaction(tx);

        const receipt = await sendPromise.wait();

        bot.sendMessage(DD_FLOOD, `Transfered ${amount} to ${to} for ${game} <a href="${process.env.PUBLIC_EXPLORER_URL}/tx/${receipt.transactionHash}">View on Explorer</a>`,
        { parse_mode: "HTML" })

}

// this.transferTo('0x2fd47ADaD57a79DE43ECaafdF06E4047f6e13f08','0.00001','ROCKPAPERSCISSORS')