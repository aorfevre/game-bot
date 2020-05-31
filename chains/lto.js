var ux = require('../admin/ux.js')
var helper = require('../admin/helper.js')

var _db = require('../database/mongo_db.js')
var http = require('http'),
  url = require('url'),
  request = require('request');



var getBalanceDatas = function(wallet) {

  return new Promise((resolve, reject) => {
    var _wallet = "https://nodes.lto.network/addresses/balance/details/" + wallet



    request(_wallet, (err, res, body) => {
      var _body = JSON.parse(res.body)

      var results = {
        regular: 0,
        generating: 0,
        available: 0,
        effective: 0
      }
      if (_body.regular !== 0)
        results.regular = _body.regular / Math.pow(10, 8)
      if (_body.generating !== 0)
        results.generating = _body.generating / Math.pow(10, 8)
      if (_body.available !== 0)
        results.available = _body.available / Math.pow(10, 8)
      if (_body.effective !== 0)
        results.effective = _body.effective / Math.pow(10, 8)

      resolve(results)
    })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {
    var _promises = []
    for (var i in myUser.LTOWallets) {
      _promises.push(getBalanceDatas(myUser.LTOWallets[i]))
    }

    Promise.all(_promises).then((r) => {
      var results = {
        regular: 0,
        generating: 0,
        available: 0,
        effective: 0
      }

      for (var i in r) {
        results.regular += r[i].regular;
        results.generating += r[i].generating;
        results.available += r[i].available;
        results.effective += r[i].effective;
      }

      _db.find("pricingLTO", {

      }, {}, false).then((count) => {

        var _txt = "<b>💰 LTO Mainnet Wallet Balances</b>\n\n" +
          "Regular: <b>" + helper.numberWithCommas(results.regular) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.regular) + ")\n" +
          "Generating: <b>" + helper.numberWithCommas(results.generating) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.generating) + ")\n" +
          "Available: <b>" + helper.numberWithCommas(results.available) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.available) + ")\n" +
          "Effective: <b>" + helper.numberWithCommas(results.effective) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.effective) + ")\n"

        resolve({
          usd: count[0].value * results.regular,
          txt: _txt
        });
      })
    })

  })
}
module.exports.getBalance = function(msg, myUser, round) {

  var _wallet = "https://nodes.lto.network/addresses/balance/details/" + myUser.LTOWallets[round]



  request(_wallet, (err, res, body) => {
    var _body = JSON.parse(res.body)


    if (_body.regular !== 0)
      _body.regular = _body.regular / Math.pow(10, 8)
    if (_body.generating !== 0)
      _body.generating = _body.generating / Math.pow(10, 8)
    if (_body.available !== 0)
      _body.available = _body.available / Math.pow(10, 8)
    if (_body.effective !== 0)
      _body.effective = _body.effective / Math.pow(10, 8)


    _db.find("pricingLTO", {

    }, {}, false).then((count) => {


      var _txt = "<b>💰 LTO Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.lto.network/addresses/" + myUser.LTOWallets[round] + "'>" + myUser.LTOWallets[round] + "</a>\n\n" +
        "Regular: <b>" + helper.numberWithCommas(_body.regular) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.regular) + ")\n" +
        "Generating: <b>" + helper.numberWithCommas(_body.generating) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.generating) + ")\n" +
        "Available: <b>" + helper.numberWithCommas(_body.available) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.available) + ")\n" +
        "Effective: <b>" + helper.numberWithCommas(_body.effective) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.effective) + ")\n"


      var options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,


      };
      bot.sendMessage(msg.chat.id, _txt, options)
    })
    // console.log(res.body)

  })
}

module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.LTOWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "LTOWallets", myUser.LTOWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}


module.exports.checkNotificationTx = function() {
  _db.find('notifyTxLTO', {
    notified: false
  }, {}, false).then((r) => {
    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,


    };
    _db.find("pricingLTO", {

    }, {}, false).then((count) => {
      // for each tx
      for (var i in r) {

        // for each user receiving the notification

        for (var j in r[i]) {

          if (j !== '_id' && j !== 'notified' && j !== 'masstx' && j !== 'cancel' && j !== 'origin') {
            var tx = r[i][j]
            if (tx.type === 4) {
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW TRANSFER</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + tx.sender + "</a>\n" +
                "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n" +
                "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)
            } else if (tx.type === 8) {
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW LEASE</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + tx.sender + "</a>\n" +
                "To: <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n" +
                "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)
            } else if (r[i].masstx !== undefined && r[i].masstx.type === 11) {


              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW MASS TRANSFER </a>\n\n" +
                "From <a href='https://explorer.lto.network/addresses/" + r[i].masstx.sender + "'>" + r[i].masstx.sender + "</a>\n" +
                "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n\n" +
                r[i].masstx.transferCount + " transfers totalizing " + helper.numberWithCommas(r[i].masstx.totalAmount / 100000000) + " LTO ($" + helper.numberWithCommas(count[0].value * r[i].masstx.totalAmount / 100000000) + ")\n" +

                "Your wallet transferred amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)



            } else if (r[i][j].cancel !== undefined && r[i][j].cancel.type === 9) {
              console.log("'cancel'")
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.id + "'>NEW LEASE CANCEL</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + r[i][j].cancel.sender + "'>" + r[i][j].cancel.sender + "</a>\n" +

                "Lease id : <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.leaseId + "'>" + r[i][j].cancel.leaseId + "</a>\n" +
                "Cancelled leased amount :<b>" + helper.numberWithCommas(r[i][j].original.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * r[i][j].original.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)


            }


          }

        }

        _db.set('notifyTxLTO', r[i]._id, "notified", true, true)

      }
    })
  })
}