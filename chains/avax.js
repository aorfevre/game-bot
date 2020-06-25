var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');






var getBalanceDatas = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://3.133.220.103:9650/ext/bc/X',
        body: {
          "jsonrpc": "2.0",
          "id": 3,
          "method": "avm.getBalance",
          "params": {
            "address": wallet,
            "assetID": "AVA"
          }
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {


        var results = {
          balance: parseInt(response.body.result.balance, 10)
        }







        resolve(results)
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.AVAXWallets) {
      _promises.push(getBalanceDatas(myUser.AVAXWallets[i]))
    }

    Promise.all(_promises).then((r) => {

      var results = {
        balance: 0
      }

      for (var i in r) {
        results.balance += r[i].balance;
      }


      console.log('Balance', results)
      var _txt = "<b>AVA-X Mainnet Wallet Balance</b>\n\n" +
        "Balance: <b>" + helper.numberWithCommas(results.balance) + "</b> AVA"
      resolve({
        usd: 0.5 * results.balance,
        txt: _txt

      })
    })

  })
}



module.exports.getBalance = function(msg, myUser, round) {
  // tz1XF4HAJEyfhG8RU7hWq3Rvtd4j2Mmsd32Q
  var headersOpt = {
    "content-type": "application/json",
  };


  request({
      method: 'post',
      url: 'http://3.133.220.103:9650/ext/bc/X',
      body: {
        "jsonrpc": "2.0",
        "method": "avm.getBalance",
        "params": {
          "address": myUser.AVAXWallets[round],
          "assetID": "AVA"
        },

        "id": 1
      },
      headers: headersOpt,
      json: true,
    },
    (error, response, body) => {
      if (!error) {

        var _markup = []
        _markup.push([{
          text: "Home 🏡",
          callback_data: "GO HOME"
        }])
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: JSON.stringify({
            inline_keyboard: _markup
          })

        };

        // _db.find("pricingXTZ", {
        //
        // }, {}, false).then((count) => {
        console.log('response', response.body)
        var _txt = "<b>AVA Mainnet Wallet Balance</b>\n👉<a href='https://explorer.ava.network/address/" + myUser.AVAXWallets[round] + "'>" + myUser.AVAXWallets[round] + "</a>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(parseInt(response.body.result.balance, 10)) + "</b> AVA \n"


        bot.sendMessage(msg.chat.id, _txt, options)
        // })
      } else {
        console.log("ERROR", error)
      }

    }
  );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.AVAXWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "AVAXWallets", myUser.AVAXWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}