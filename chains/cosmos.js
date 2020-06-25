var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');






var getBalanceDatas = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };

    var _promises = []
    var queries = ['https://api.cosmostation.io/v1/account/balance/', 'https://api.cosmostation.io/v1/account/delegations/rewards/',
      'https://api.cosmostation.io/v1/account/delegations/', 'https://api.cosmostation.io/v1/account/unbonding-delegations/'
    ]
    for (var i in queries)
      _promises.push(_query(queries[i], wallet))


    Promise.all(_promises).then((values) => {


      var results = {
        balance: 0,
        rewards: 0,
        delegation: 0,
        unbonding: 0
      }

      if (values[0].length > 0)
        results.balance = (Number(values[0][0].amount)).toFixed(2)
      if (values[1].length > 0)
        results.rewards = (Number(values[1][0].amount)).toFixed(2)
      if (values[2].length > 0)
        results.delegation = (Number(values[2][0].amount)).toFixed(2)
      if (values[3].length > 0)
        results.unbonding = (Number(values[3][0].amount)).toFixed(2)







      resolve(results)
    })
  })


}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {

    var _promises = []
    for (var i in myUser.COSMOSWallets) {
      _promises.push(getBalanceDatas(myUser.COSMOSWallets[i]))
    }

    Promise.all(_promises).then((r) => {
      var results = {
        balance: 0,
        rewards: 0,
        delegation: 0,
        unbonding: 0
      }
      for (var i in r) {
        results.balance += r[i].balance;
        results.rewards += r[i].rewards;
        results.delegation += r[i].delegation;
        results.unbonding += r[i].unbonding;
      }

      _db.find("pricingCOSMOS", {

      }, {}, false).then((count) => {



        var _txt = "<b>💰COSMOS Mainnet Wallet Balance</b>\n\n" +
          "Balance: <b>" + helper.numberWithCommas(results.balance / 1000000) + "</b> ATOM ($" +
          helper.numberWithCommas(count[0].value * results.balance / 1000000) + ")\n" +

          "Rewards: <b>" + helper.numberWithCommas(results.rewards / 1000000) + "</b> ATOM ($" +
          helper.numberWithCommas(count[0].value * results.rewards / 1000000) + ")\n" +

          "Delegated: <b>" + helper.numberWithCommas(results.delegation / 1000000) + "</b> ATOM ($" +
          helper.numberWithCommas(count[0].value * results.delegation / 1000000) + ")\n" +

          "Unbonding: <b>" + helper.numberWithCommas(results.unbonding / 1000000) + "</b> ATOM ($" +
          helper.numberWithCommas(count[0].value * results.unbonding / 1000000) + ")\n"
        resolve({
          usd: count[0].value * results.balance,
          txt: _txt
        });
      })
    })

  })
}





var _query = function(getQuery, param) {
  return new Promise(function(resolve, reject) {
    var headersOpt = {
      "content-type": "application/json",
    };

    request({
        method: 'get',
        url: getQuery + param,
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {
        resolve(response.body)
      })

  })
}

module.exports.getBalance = function(msg, myUser, round) {
  // tz1XF4HAJEyfhG8RU7hWq3Rvtd4j2Mmsd32Q


  var queries = ['https://api.cosmostation.io/v1/account/balance/', 'https://api.cosmostation.io/v1/account/delegations/rewards/',
    'https://api.cosmostation.io/v1/account/delegations/', 'https://api.cosmostation.io/v1/account/unbonding-delegations/'
  ]

  var _promises = []

  for (var i in queries)
    _promises.push(_query(queries[i], myUser.COSMOSWallets[round]))


  Promise.all(_promises).then((values) => {

    var responses = {
      balance: 0,
      rewards: 0,
      delegation: 0,
      unbonding: 0
    }

    if (values[0].length > 0)
      responses.balance = (Number(values[0][0].amount)).toFixed(2)
    if (values[1].length > 0)
      responses.rewards = (Number(values[1][0].amount)).toFixed(2)
    if (values[2].length > 0)
      responses.delegation = (Number(values[2][0].amount)).toFixed(2)
    if (values[3].length > 0)
      responses.unbonding = (Number(values[3][0].amount)).toFixed(2)



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

    _db.find("pricingCOSMOS", {

    }, {}, false).then((count) => {


      var _txt = "<b>💰COSMOS Mainnet Wallet Balance</b>\n👉 <a href='https://www.mintscan.io/account/" + myUser.COSMOSWallets[round] + "'>" + myUser.COSMOSWallets[round] + "</a>\n\n" +
        "Balance: <b>" + helper.numberWithCommas(responses.balance / 1000000) + "</b> ATOM ($" +
        helper.numberWithCommas(count[0].value * responses.balance / 1000000) + ")\n" +

        "Rewards: <b>" + helper.numberWithCommas(responses.rewards / 1000000) + "</b> ATOM ($" +
        helper.numberWithCommas(count[0].value * responses.rewards / 1000000) + ")\n" +

        "Delegated: <b>" + helper.numberWithCommas(responses.delegation / 1000000) + "</b> ATOM ($" +
        helper.numberWithCommas(count[0].value * responses.delegation / 1000000) + ")\n" +

        "Unbonding: <b>" + helper.numberWithCommas(responses.unbonding / 1000000) + "</b> ATOM ($" +
        helper.numberWithCommas(count[0].value * responses.unbonding / 1000000) + ")\n"



      bot.sendMessage(msg.chat.id, _txt, options)
    })
  });
  //
  // //
  // var options = {
  //   parse_mode: "HTML",
  //   disable_web_page_preview: true,
  //
  //
  // };
  //
  // _db.find("pricingCOSMOS", {
  //
  // }, {}, false).then((count) => {
  //   //
  //   // var newDate = new Date();
  //   // newDate.setTime(response.body.lastActive * 1000);
  //   // dateString = newDate.toUTCString();
  //   // var _txt = "<b>💰XTZ Mainnet Wallet Balance</b>\n👉 <a href='https://tzstats.com/" + myUser.COSMOSWallets[round] + "'>" + myUser.COSMOSWallets[round] + "</a>\n\n" +
  //   //   "Balance: <b>" + helper.numberWithCommas(response.body.balance / 1000000) + "</b> XTZ ($" +
  //   //   helper.numberWithCommas(count[0].value * response.body.balance / 1000000) + ")\n" +
  //   //   "Total Transactions: <b>" + response.body.transactions + "</b>\n" +
  //   //   "Last active: <b>" + dateString + "</b>\n"
  //   //
  //
  //   bot.sendMessage(msg.chat.id, _txt, options)
  // })
  //

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.COSMOSWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "COSMOSWallets", myUser.COSMOSWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}