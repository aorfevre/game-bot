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

        var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/lto-network/' target='_blank'>1 LTO = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"


        var _txt = "<b>💰 LTO Mainnet Wallet Balances</b>\n\n" +
          "Regular: <b>" + helper.numberWithCommas(results.regular) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.regular) + ")\n" +
          "Generating: <b>" + helper.numberWithCommas(results.generating) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.generating) + ")\n" +
          "Available: <b>" + helper.numberWithCommas(results.available) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.available) + ")\n" +
          "Effective: <b>" + helper.numberWithCommas(results.effective) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * results.effective) + ")\n" +
          rateTxt

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

      var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/lto-network/' target='_blank'>1 LTO = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"

      var _txt = "<b>💰 LTO Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.lto.network/addresses/" + myUser.LTOWallets[round] + "'>" + myUser.LTOWallets[round] + "</a>\n\n" +
        "Regular: <b>" + helper.numberWithCommas(_body.regular) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.regular) + ")\n" +
        "Generating: <b>" + helper.numberWithCommas(_body.generating) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.generating) + ")\n" +
        "Available: <b>" + helper.numberWithCommas(_body.available) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.available) + ")\n" +
        "Effective: <b>" + helper.numberWithCommas(_body.effective) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * _body.effective) + ")\n" +
        rateTxt

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

var _getWalletNode = function(item) {
  var _txt = item
  if (item === "3JugjxT51cTjWAsgnQK4SpmMqK6qua1VpXH")
    _txt = "LTO Bridge"
  if (item === "3JnZLvmVBXsc2XMug4e6yjyvPehr1Fjx9oM")
    _txt = "LowSea Leasing"
  if (item === "3Jgz4XTs9zWcogexvugpdJxiau96NoU3uoy")
    _txt = "rabidB3ar"
  if (item === "3JqGGBMvkMtQQqNhGVD6knEzhncb55Y7JJ5")
    _txt = "Liquid Leasing"
  if (item === "3Jhkp3Xtg2wyT6NoEtJB2VQPAHiYuqYUVBp")
    _txt = "ablock.io"
  if (item === "3JnN8psLjuEyiPbH2bYcEFKUFpcamxzwFiv")
    _txt = "LTONode.com"
  if (item === "3Jq3F3njrrR1ZvM3JhwLX2Sh56LQDtuEyu9")
    _txt = "Smart Workflow"
  if (item === "3JoCVgfHnaUT1JUvaw73e6rSEDSXqozzE5T")
    _txt = "Firm24 / OnlineFlexBV"
  if (item === "3Jq8mnhRquuXCiFUwTLZFVSzmQt3Fu6F7HQ")
    _txt = "LegalThings"
  if (item === "3Jk8956WNcFaRvdmQ4J3ytBQaAyvvU2DNxD")
    _txt = "Young Oak Capital"
  if (item === "3JkfhvV51FTDnCNpgZt3wjXNYbPehgFdaZA")
    _txt = "FillTheDoc"
  if (item === "3JuhBndwegTukoWn2mQhHxRXK38qaHqDG8x")
    _txt = "Signrequest"

  if (item === "3JdDELJNByUTs5zpRoof2Z9DJfhakysiC6h")
    _txt = "Proofi"

  if (item === "3JjGwHSBgiHctzt9wDo6wHVwEnTVV2S33pU")
    _txt = "Capptions"
  if (item === "3JmcAJMQhdLKj296xoDkng9r1McCmBSFiEX")
    _txt = "LTO leasing"
  if (item === "3JjtGYPannaVDMvbjdyLrmo39LohZ8KESdL")
    _txt = "humblenode"
  if (item === "3JujV7o14LM3vo9bpXtZmqAkyBFwzVJJWdn")
    _txt = "Stats Support Node"
  if (item === "3JhyQWe7BC7impmVu6YtctdaFuR1EK6vVne")
    _txt = "Zavodil"
  if (item === "3JexCgRXGFUiuNoJTkkWucSumteRWdb8kKU")
    _txt = "lto.services"
  if (item === "3Jn6jpPBVmi1RLRpUtQGKVibNZpeTRACK2P")
    _txt = "Kruptos Nomisma"
  // if (item === "3Jhkp3Xtg2wyT6NoEtJB2VQPAHiYuqYUVBp")
  //   _txt = "LTO-lease.com"
  if (item === "3Jfb7VJzmJjXyQDQ5Nw8R7G2MiasM5fm3Uy")
    _txt = "Binance Node"

  if (item === "3JbZnF1i9rwab8YwBdGeNeAZhmcKzFfibUf")
    _txt = "Bitmax"

  if (item === "3JxRvAGmuro9MUfJ3ZkznQjKSeGYXdx9odz")
    _txt = "Binance"

  if (item === "3JnYB1TzHYS3gYDvczYtNUnmEbJsgmsdWY3")
    _txt = "LunarWhale Node"

  if (item === '3JxysuuE3nKk1BYW53orQTDzeuyvq4a5cZY') {
    _txt = "Bitmax"
  }

  if (item === '3Jx1sh2J3CsWgtzSUwUMiWo9zvcaeJN5GHE') {
    _txt = 'LTO Community & Incentives'
  }
  if (item === '3Jw2YRaQjgRF8KEjEWQv4fBjPEZnGvuBrtB') {
    _txt = 'LTO Advisors'
  }
  if (item === '3JwXzo1nHcn2YhSMPmLwHx88rTDvvMSoXNf') {
    _txt = 'LTO Team'
  }
  if (item === '3Jdj7k1693T8YJJcQe2xEus1e62Zwj4RUDv') {
    _txt = 'LTO M&A Funds'
  }
  if (item === '3JqTwkbDFbtCPo9z5bFa9WfLmjEr7PXNode') {
    _txt = 'LTO Edge Node'
  }
  if (item === '3JffJmwV2G158V6N27ouzkoRTgEVPLFqxPy') {
    _txt = 'RedPhoenix7'
  }
  if (item === '3Ju1azb5ZuMExDPBFLsJ33hPpCNL4sRKYjT') {
    _txt = 'nodemn'
  }

  return _txt
}
module.exports.checkNotificationTx = function() {
  _db.find('notifyTxLTO', {
    notified: false
  }, {}, false).then((r) => {
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
    console.log("'founded'", r)
    _db.find("pricingLTO", {

    }, {}, false).then((count) => {
      var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/lto-network/' target='_blank'>1 LTO = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"
      // for each tx
      for (var i in r) {

        // for each user receiving the notification

        for (var j in r[i]) {

          notifySingleUser(i, j, r, rateTxt, count, options)

        }

        _db.set('notifyTxLTO', r[i]._id, "notified", true, true)

      }
    })
  })
}


notifySingleUser = function(i, j, r, rateTxt, count, options) {
  if (j !== '_id' && j !== 'notified' && j !== 'masstx' && j !== 'cancel' && j !== 'origin') {
    var tx = r[i][j]
    if (tx.type === 4) {
      var _recipient = _getWalletNode(tx.recipient)
      var _sender = _getWalletNode(tx.sender)
      var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW TRANSFER</a>\n" +
        "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + _sender + "</a>\n" +
        "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + _recipient + "</a>\n" +
        "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n" +
        rateTxt


      _db.find('users_participating', {
        _id: Number(j)
      }, {}, false).then((myUsers) => {
        var myUser = myUsers[0]

        if (myUser.notifyMinimum === undefined || (myUser.notifyMinimum !== undefined && (count[0].value * tx.amount / 100000000) > Number(myUser.notifyMinimum))) {

          bot.sendMessage(myUser._id, _txt, options)
        }
      })

    } else if (tx.type === 8) {
      var _recipient = _getWalletNode(tx.recipient)
      var _sender = _getWalletNode(tx.sender)
      var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW LEASE</a>\n" +
        "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + _sender + "</a>\n" +
        "To: <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + _recipient + "</a>\n" +
        "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n" +
        rateTxt

      _db.find('users_participating', {
        _id: Number(j)
      }, {}, false).then((myUsers) => {
        var myUser = myUsers[0]

        if (myUser.notifyMinimum === undefined || (myUser.notifyMinimum !== undefined && (count[0].value * tx.amount / 100000000) > Number(myUser.notifyMinimum))) {

          bot.sendMessage(myUser._id, _txt, options)
        }
      })
    } else if (r[i].masstx !== undefined && r[i].masstx.type === 11) {

      var _masstx = _getWalletNode(r[i].masstx.sender)
      var _recipient = _getWalletNode(tx.recipient)

      var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW MASS TRANSFER </a>\n\n" +
        "From <a href='https://explorer.lto.network/addresses/" + r[i].masstx.sender + "'>" + _masstx + "</a>\n" +
        "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + _recipient + "</a>\n\n" +

        "Your wallet transferred amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n" +
        "<i>" + r[i].masstx.transferCount + " transfers totalizing " + helper.numberWithCommas(r[i].masstx.totalAmount / 100000000) + " LTO ($" + helper.numberWithCommas(count[0].value * r[i].masstx.totalAmount / 100000000) + ")</i>\n" +
        rateTxt
      _db.find('users_participating', {
        _id: Number(j)
      }, {}, false).then((myUsers) => {
        var myUser = myUsers[0]

        if (myUser.notifyMinimum === undefined || (myUser.notifyMinimum !== undefined && (count[0].value * tx.amount / 100000000) > Number(myUser.notifyMinimum))) {

          bot.sendMessage(myUser._id, _txt, options)
        }
      })
      //  bot.sendMessage(Number(j), _txt, options)



    } else if (r[i][j].cancel !== undefined && r[i][j].cancel.type === 9) {

      var _sender = _getWalletNode(r[i][j].cancel.sender)
      var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.id + "'>NEW LEASE CANCEL</a>\n" +
        "From <a href='https://explorer.lto.network/addresses/" + r[i][j].cancel.sender + "'>" + _sender + "</a>\n" +

        "Lease id : <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.leaseId + "'>" + r[i][j].cancel.leaseId + "</a>\n" +
        "Cancelled leased amount :<b>" + helper.numberWithCommas(r[i][j].original.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * r[i][j].original.amount / 100000000) + ")\n" +
        rateTxt
      _db.find('users_participating', {
        _id: Number(j)
      }, {}, false).then((myUsers) => {
        var myUser = myUsers[0]

        if (myUser.notifyMinimum === undefined || (myUser.notifyMinimum !== undefined && (count[0].value * tx.amount / 100000000) > Number(myUser.notifyMinimum))) {

          bot.sendMessage(myUser._id, _txt, options)
        }
      })
      // bot.sendMessage(Number(j), _txt, options)


    }


  }
}