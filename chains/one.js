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
        url: 'https://explorer.harmony.one:8888/address?id=' + wallet,
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {



        var results = {
          balance: parseInt(response.body.address.balance / Math.pow(10, 18)),

          totaltx: response.body.address.txCount,
          stakingtx: response.body.address.txCount
        }


        resolve(results)
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.ONEWallets) {
      _promises.push(getBalanceDatas(myUser.ONEWallets[i]))
    }

    Promise.all(_promises).then((r) => {
      var results = {
        balance: 0,

        totaltx: 0,
        stakingtx: 0
      }

      for (var i in r) {
        results.balance += r[i].balance;
        results.totaltx += r[i].totaltx;
        results.stakingtx += r[i].stakingtx;
      }

      _db.find("pricingONE", {

      }, {}, false).then((count) => {

        var _txt = "<b>💰 ONE Mainnet Wallet Balance</b>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(results.balance) + "</b> ONE ($" +
          helper.numberWithCommas(count[0].value * results.balance) + ")\n" +
          "Total Transactions: <b>" + results.totaltx + "</b>\n" +
          "Staking Transactions: <b>" + results.stakingtx + "</b>\n"
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
      url: 'https://explorer.harmony.one:8888/address?id=' + myUser.ONEWallets[round],
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
        _db.find("pricingONE", {

        }, {}, false).then((count) => {


          var _txt = "<b>💰 ONE Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.harmony.one/#/address/" + myUser.ONEWallets[round] + "'>" + myUser.ONEWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(parseInt(response.body.address.balance / Math.pow(10, 18))) + "</b> ONE ($" +
            helper.numberWithCommas(count[0].value * parseInt(response.body.address.balance / Math.pow(10, 18))) + ")\n" +
            "Total Transactions: <b>" + response.body.address.txCount + "</b>\n" +
            "Staking Transactions: <b>" + response.body.address.stakingTxCount + "</b>\n"


          bot.sendMessage(msg.chat.id, _txt, options)
        })
      } else {
        console.log("ERROR", error)
      }

    }
  );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.ONEWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "ONEWallets", myUser.ONEWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}