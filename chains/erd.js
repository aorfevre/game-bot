var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');




var getBalanceDatas = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      "content-type": "application/json",
    };

    request({
        method: 'get',
        url: 'https://api.elrond.com/address/' + wallet,
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {
        console.log("response.body", response.body)


        var results = {
          balance: parseInt(response.body.account.balance / Math.pow(10, 18))
        }


        resolve(results)
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.ERDWallets) {
      _promises.push(getBalanceDatas(myUser.ERDWallets[i]))
    }

    Promise.all(_promises).then((r) => {
      var results = {
        balance: 0,

        totaltx: 0,
        stakingtx: 0
      }

      for (var i in r) {
        results.balance += r[i].balance;
      }

      _db.find("pricingERD", {

      }, {}, false).then((count) => {

        var _txt = "<b>💰 ERD Mainnet Wallet Balance</b>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(results.balance) + "</b> ERD ($" +
          helper.numberWithCommas(count[0].value * results.balance) + ")\n"

        resolve({
          usd: count[0].value * results.balance,
          txt: _txt
        });
      })
    })

  })
}




module.exports.getBalance = function(msg, myUser, round) {

  var headersOpt = {
    "content-type": "application/json",
  };

  request({
      method: 'get',
      url: 'https://api.elrond.com/address/' + myUser.ERDWallets[round],
      headers: headersOpt,
      json: true,
    },
    (error, response, body) => {
      console.log("response", response.body)
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

        _db.find("pricingERD", {

        }, {}, false).then((count) => {


          var _txt = "<b>💰 ERD Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.elrond.com/address/" + myUser.ERDWallets[round] + "'>" + myUser.ERDWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(parseInt(response.body.account.balance / Math.pow(10, 18))) + "</b> ERD ($" +
            helper.numberWithCommas(count[0].value * parseInt(response.body.account.balance / Math.pow(10, 18))) + ")\n"

          bot.sendMessage(msg.chat.id, _txt, options)
        })
      } else {
        console.log("ERROR", error)
      }

    }
  );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.ERDWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "ERDWallets", myUser.ERDWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}