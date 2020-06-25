const Web3 = require('web3');
let json = require('./config.json')

var web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.fantom.network'));
var eth = web3.eth;
var _this = this
module.exports.sendTx = function(receiver, i) {

  return new Promise(function(resolve, reject) {


    var estimatedGas = eth.estimateGas({
      from: json.account.public_key,
      to: receiver.wallet,
      "nonce": receiver.amount * Math.pow(10, 18)
    }).then(function(eGas) {


      web3.eth.getGasPrice(function(error, result) {
        console.log("result", result, eGas)
        gasPrice = result
        var gasValue = (eGas * 1.3) * gasPrice

        var valueToSend = receiver.amount * Math.pow(10, 18) - gasValue;


        console.log("gasValue", gasValue, valueToSend, valueToSend - gasValue)
        var transactionObject = {
          from: json.account.public_key,
          to: receiver.wallet,
          value: valueToSend,
          gasPrice: web3.eth.gasPrice,
          gasLimit: web3.eth.getBlock("latest").gasLimit,
          gas: 21000
        }


        let options = {
          to: receiver.wallet,

          gas: gasValue
        };

        var r = web3.eth.accounts.privateKeyToAccount(json.account.private_key)


        web3.eth.accounts.signTransaction(transactionObject, json.account.private_key).then(function(signedTransaction) {
          web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then(() => {
            resolve()
          });
        });

        // web3.eth.sendTransaction(transactionObject);
      });
    })
  })
}

var startAirdroping = async function() {
  try {
    for (var i in json.receivers) {
      console.log("json.receivers[i]", json.receivers[i])
      await _this.sendTx(json.receivers[i], i)
    }
  } catch (e) {
    console.log('err', e)
  }

}


console.log('    ______________  ___   _   _______________       ______  ____  __ __');
console.log('   / ____/_  __/  |/  /  / | / / ____/_  __/ablock.io  __ \\/ __ \\/ //_/');
console.log('  / /_    / / / /|_/ /  /  |/ / __/   / /  | | /| / / / / / /_/ / ,<   ');
console.log(' / __/   / / / /  / /  / /|  / /___  / /   | |/ |/ / /_/ / _, _/ /| |  ');
console.log('/_/     /_/ /_/  /_/  /_/ |_/_____/ /_/    |__/|__/\\____/_/ |_/_/ |_|  ');


startAirdroping();