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
        method: 'get',
        url: 'https://scan.tomochain.com/api/accounts/' + wallet,
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {


        var results = {
          balanceNumber: response.body.balanceNumber,

          tokenTxCount: response.body.tokenTxCount,
          transactionCount: response.body.transactionCount

        }





        resolve(results)
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.TOMOWallets) {
      _promises.push(getBalanceDatas(myUser.TOMOWallets[i]))
    }

    Promise.all(_promises).then((r) => {
      var results = {
        balanceNumber: 0,

        tokenTxCount: 0,
        transactionCount: 0

      }
      for (var i in r) {
        results.balanceNumber += r[i].balanceNumber;
        results.tokenTxCount += r[i].tokenTxCount;
        results.transactionCount += r[i].transactionCount;
      }

      _db.find("pricingTOMO", {

      }, {}, false).then((count) => {
        var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/tomochain/' target='_blank'>1 TOMO = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"



        var _txt = "<b>💰TOMO Mainnet Wallet Balance</b>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(results.balanceNumber) + "</b> TOMO ($" +
          helper.numberWithCommas(count[0].value * results.balanceNumber) + ")\n" +
          "Tokens: <b>" + results.tokenTxCount + "</b>\n" +
          "Total Transactions: <b>" + results.transactionCount + "</b>\n" +
          rateTxt
        resolve({
          usd: count[0].value * results.balanceNumber,
          txt: _txt
        });
      })
    })

  })
}





module.exports.getBalance = function(msg, myUser, round) {
  // tz1XF4HAJEyfhG8RU7hWq3Rvtd4j2Mmsd32Q
  var headersOpt = {
    // "content-type": "application/json",
  };

  request({
      method: 'get',
      url: 'https://scan.tomochain.com/api/accounts/' + myUser.TOMOWallets[round],
      headers: headersOpt,
      json: true,
    },
    (error, response, body) => {
      if (!error) {


        //
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

        _db.find("pricingTOMO", {

        }, {}, false).then((count) => {
          var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/tomochain/' target='_blank'>1 TOMO = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"


          var _txt = "<b>💰TOMO Mainnet Wallet Balance</b>\n👉 <a href='https://scan.tomochain.com/address/" + myUser.TOMOWallets[round] + "'>" + myUser.TOMOWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(response.body.balanceNumber) + "</b> TOMO ($" +
            helper.numberWithCommas(count[0].value * response.body.balanceNumber) + ")\n" +
            "Tokens: <b>" + response.body.tokenTxCount + "</b>\n" +
            "Total Transactions: <b>" + response.body.transactionCount + "</b>\n" +
            "Created at: <b>" + response.body.createdAt + "</b>\n" +
            rateTxt


          bot.sendMessage(msg.chat.id, _txt, options)
        })
      } else {
        console.log("ERROR", error)
      }

    }
  );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.TOMOWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "TOMOWallets", myUser.TOMOWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}