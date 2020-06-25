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
        url: 'http://3.133.220.103:9650/ext/bc/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.getAccount",
          "params": {
            "address": wallet
          },
          "id": 1
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
    for (var i in myUser.AVAPWallets) {
      _promises.push(getBalanceDatas(myUser.AVAPWallets[i]))
    }

    Promise.all(_promises).then((r) => {

      var results = {
        balance: 0
      }

      for (var i in r) {
        results.balance += r[i].balance;
      }



      var _txt = "<b>AVA-P Mainnet Wallet Balance</b>\n\n" +
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
      url: 'http://3.133.220.103:9650/ext/bc/P',
      body: {
        "jsonrpc": "2.0",
        "method": "platform.getAccount",
        "params": {
          "address": myUser.AVAPWallets[round]
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

        var _txt = "<b>AVA Mainnet Wallet Balance</b>\n👉<a href='https://explorer.ava.network/address/" + myUser.AVAPWallets[round] + "'>" + myUser.AVAPWallets[round] + "</a>\n\n" +
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

  myUser.AVAPWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "AVAPWallets", myUser.AVAPWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}