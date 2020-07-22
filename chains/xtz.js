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
        url: 'https://api-teztracker.everstake.one/v2/data/tezos/mainnet/accounts/' + wallet,
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {


        var results = {
          balance: response.body.balance / 1000000,

          totaltx: 0
        }

        if (response.body.transactions !== undefined) {
          results.totaltx = response.body.transactions
        }






        resolve(results)
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.XTZWallets) {
      _promises.push(getBalanceDatas(myUser.XTZWallets[i]))
    }

    Promise.all(_promises).then((r) => {

      var results = {
        balance: 0,

        totaltx: 0
      }

      for (var i in r) {
        results.balance += r[i].balance;
        results.totaltx += r[i].totaltx;
      }

      _db.find("pricingXTZ", {

      }, {}, false).then((count) => {
        var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/tezos/' target='_blank'>1 XTZ = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"

        var _txt = "<b>💰XTZ Mainnet Wallet Balance</b>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(results.balance) + "</b> XTZ ($" +
          helper.numberWithCommas(count[0].value * results.balance) + ")\n" +
          "Total Transactions: <b>" + results.totaltx + "</b>\n" +
          rateTxt
        resolve({
          usd: count[0].value * results.balance,
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
      url: 'https://api-teztracker.everstake.one/v2/data/tezos/mainnet/accounts/' + myUser.XTZWallets[round],
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

        _db.find("pricingXTZ", {

        }, {}, false).then((count) => {
          var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/tezos/' target='_blank'>1 XTZ = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"

          var newDate = new Date();
          newDate.setTime(response.body.lastActive * 1000);
          dateString = newDate.toUTCString();
          var _txt = "<b>💰XTZ Mainnet Wallet Balance</b>\n👉 <a href='https://tzstats.com/" + myUser.XTZWallets[round] + "'>" + myUser.XTZWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(response.body.balance / 1000000) + "</b> XTZ ($" +
            helper.numberWithCommas(count[0].value * response.body.balance / 1000000) + ")\n" +
            "Total Transactions: <b>" + response.body.transactions + "</b>\n" +
            "Last active: <b>" + dateString + "</b>\n" +
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

  myUser.XTZWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "XTZWallets", myUser.XTZWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}