var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')
var _dbftm = require('../database/mongo_db_ftm.js')

var request = require('request');


var getBalanceDatas = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      "content-type": "application/json",
    };

    request({
        method: 'post',
        url: 'https://xapi3.fantom.network/api',
        body: {
          "operationName": "AccountByAddress",
          "variables": {
            "address": wallet,
            "count": 20,
            "cursor": null
          },
          "query": "query AccountByAddress($address: Address!, $cursor: Cursor, $count: Int!) {\n  account(address: $address) {\n    address\n    contract {\n      address\n      deployedBy {\n        hash\n        contractAddress\n        __typename\n      }\n      name\n      version\n      compiler\n      sourceCode\n      abi\n      validated\n      supportContact\n      timestamp\n      __typename\n    }\n    balance\n    totalValue\n    txCount\n    txList(cursor: $cursor, count: $count) {\n      pageInfo {\n        first\n        last\n        hasNext\n        hasPrevious\n        __typename\n      }\n      totalCount\n      edges {\n        cursor\n        transaction {\n          hash\n          from\n          to\n          value\n          gasUsed\n          block {\n            number\n            timestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    staker {\n      id\n      createdTime\n      isActive\n      __typename\n    }\n    delegation {\n      toStakerId\n      createdTime\n      amount\n      claimedReward\n      pendingRewards {\n        amount\n        fromEpoch\n        toEpoch\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {
        if (!error) {

          var results = {
            totalValue: 0,
            balance: 0,

            delegation: 0,
            pendingRewards: 0,
            claimedReward: 0

          }
          results.totalValue = parseInt(response.body.data.account.totalValue, 16);
          results.balance = parseInt(response.body.data.account.balance, 16);

          console.log(wallet, response.body.data.account.delegation)
          if (response.body.data.account !== undefined &&
            response.body.data.account.delegation !== undefined) {
            if (response.body.data.account.delegation === null) {
              response.body.data.account.delegation = {
                pendingRewards: {
                  amount: 0
                },
                amount: 0
              }
            }

            if (response.body.data.account.delegation.amount === null || response.body.data.account.delegation.amount === undefined || isNaN(response.body.data.account.delegation.amount))
              response.body.data.account.delegation.amount = 0

          }
          results.delegation = parseInt(response.body.data.account.delegation.amount, 16);
          results.pendingRewards = parseInt(response.body.data.account.delegation.pendingRewards.amount, 16);

          if (response.body.data.account.delegation.claimedReward === null || response.body.data.account.delegation.claimedReward === undefined || isNaN(response.body.data.account.delegation.claimedReward))
            response.body.data.account.delegation.claimedReward = 0


          results.claimedReward = parseInt(response.body.data.account.delegation.claimedReward, 16);

          resolve(results)
        }
      })
  })

}
module.exports.getAllBalances = function(myUser) {
  return new Promise((resolve, reject) => {
    var _promises = []
    for (var i in myUser.FTMWallets) {
      _promises.push(getBalanceDatas(myUser.FTMWallets[i]))
    }


    Promise.all(_promises).then((r) => {
      var results = {
        totalValue: 0,
        balance: 0,

        delegation: 0,
        pendingRewards: 0,
        claimedReward: 0

      }
      for (var i in r) {
        results.totalValue += r[i].totalValue;
        results.balance += r[i].balance;
        results.delegation += r[i].delegation;
        results.pendingRewards += r[i].pendingRewards;
        results.claimedReward += r[i].claimedReward;
      }

      _db.find("pricingFTM", {

      }, {}, false).then((count) => {

        var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/fantom/' target='_blank'>1 FTM = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"


        var _txt = "<b>💰 FTM Mainnet Wallet Balance</b>\n\n" +
          "Total Value: <b>" + helper.numberWithCommas(results.totalValue / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * results.totalValue / Math.pow(10, 18)) + ")\n" +

          "Available Balance: <b>" + helper.numberWithCommas(results.balance / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * results.balance / Math.pow(10, 18)) + ")\n"



        _txt += "Staked amount: <b>" + helper.numberWithCommas(results.delegation / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * results.delegation / Math.pow(10, 18)) + ")\n"
        _txt += "Pending reward: <b>" + helper.numberWithCommas(results.pendingRewards / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * results.pendingRewards / Math.pow(10, 18)) + ")\n"



        _txt += "Claimed reward: <b>" + helper.numberWithCommas(results.claimedReward / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * results.claimedReward / Math.pow(10, 18)) + ")\n" +
          rateTxt

        resolve({
          usd: count[0].value * results.totalValue / Math.pow(10, 18),
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
      method: 'post',
      url: 'https://xapi3.fantom.network/api',
      body: {
        "operationName": "AccountByAddress",
        "variables": {
          "address": myUser.FTMWallets[round],
          "count": 20,
          "cursor": null
        },
        "query": "query AccountByAddress($address: Address!, $cursor: Cursor, $count: Int!) {\n  account(address: $address) {\n    address\n    contract {\n      address\n      deployedBy {\n        hash\n        contractAddress\n        __typename\n      }\n      name\n      version\n      compiler\n      sourceCode\n      abi\n      validated\n      supportContact\n      timestamp\n      __typename\n    }\n    balance\n    totalValue\n    txCount\n    txList(cursor: $cursor, count: $count) {\n      pageInfo {\n        first\n        last\n        hasNext\n        hasPrevious\n        __typename\n      }\n      totalCount\n      edges {\n        cursor\n        transaction {\n          hash\n          from\n          to\n          value\n          gasUsed\n          block {\n            number\n            timestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    staker {\n      id\n      createdTime\n      isActive\n      __typename\n    }\n    delegation {\n      toStakerId\n      createdTime\n      amount\n      claimedReward\n      pendingRewards {\n        amount\n        fromEpoch\n        toEpoch\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
      },
      headers: headersOpt,
      json: true,
    },
    (error, response, body) => {
      if (!error) {

        //
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,


        };

        _db.find("pricingFTM", {

        }, {}, false).then((count) => {
          var rateTxt = "\n<i>Rate: <a href='https://coinmarketcap.com/currencies/fantom/' target='_blank'>1 FTM = $" + helper.numberWithCommas(count[0].value, 5) + "</a></i>"


          var _txt = "<b>💰 FTM Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.fantom.network/address/" + myUser.FTMWallets[round] + "'>" + myUser.FTMWallets[round] + "</a>\n\n" +
            "Total Value: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.totalValue, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.totalValue, 16) / Math.pow(10, 18)) + ")\n" +

            "Available Balance: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.balance, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.balance, 16) / Math.pow(10, 18)) + ")\n"

          if (response.body.data.account.delegation !== undefined && response.body.data.account.delegation !== null && response.body.data.account.delegation.amount !== undefined) {


            if (response.body.data.account.delegation.amount === null || response.body.data.account.delegation.amount === undefined || isNaN(response.body.data.account.delegation.amount))
              response.body.data.account.delegation.amount = 0

            _txt += "Staked amount: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.amount, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.amount, 16) / Math.pow(10, 18)) + ")\n"
            _txt += "Pending reward: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.pendingRewards.amount, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.pendingRewards.amount, 16) / Math.pow(10, 18)) + ")\n"


            if (response.body.data.account.delegation.claimedReward === null || response.body.data.account.delegation.claimedReward === undefined || isNaN(response.body.data.account.delegation.claimedReward))
              response.body.data.account.delegation.claimedReward = 0
            _txt += "Claimed reward: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.claimedReward, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.claimedReward, 16) / Math.pow(10, 18)) + ")\n"
          }
          _txt += rateTxt
          bot.sendMessage(msg.chat.id, _txt, options)
        })
      } else {
        console.log("ERROR", error)
      }

    }
  );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.FTMWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "FTMWallets", myUser.FTMWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}


module.exports.checkNotificationTx = function() {
  _db.find('notifyTxFTM', {
    notified: false
  }, {}, false).then((r) => {
    console.log('r', r)
    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,


    };
    _db.find("pricingFTM", {

    }, {}, false).then((count) => {

      _dbftm.find("validators", {
        _id: 'fantomstakers'
      }, {}, false).then((validators) => {
        validators = validators[0]

        // for each tx
        for (var i in r) {

          // for each user receiving the notification

          for (var j in r[i]) {


            if (!isNaN(j)) {
              // console.log("j", j, r[i])
              notifySingleUser(r, i, j, count, options, validators)

            }

          }

          _db.set('notifyTxFTM', r[i]._id, "notified", true, true)

        }
      })
    })
  })
}

var notifySingleUser = function(r, i, j, count, options, validators) {
  var tx = r[i][j]

  // console.log("TRANSACTION", tx, i, j)
  if (tx.decoded === null) {
    // transfer
    var usdValue = (count[0].value * (tx.value / Math.pow(10, 18)))
    var whaleTxt = "🚨" +
      helper.numberWithCommas((Number(tx.value) / Math.pow(10, 18))) + " FTM ($" + helper.numberWithCommas(usdValue) + ") transferred from " +
      "<a href='http://explorer.fantom.network/address/" + tx.from + "'>" + tx.from + "</a> to <a href='http://explorer.fantom.network/address/" + tx.to + "'>" + tx.to + "</a>\n" +
      "<a href='http://explorer.fantom.network/transactions/" + tx.hash + "'>TX - link</a>";

    _db.find('users_participating', {
      _id: Number(j)
    }, {}, false).then((myUsers) => {
      var myUser = myUsers[0]
      // console.log('USER', myUser._id, (myUser.notifyMinimum) === undefined ||
      // (myUser.notifyMinimum !== undefined && Number(usdValue) >= Number(myUser.notifyMinimum)))
      if ((myUser.notifyMinimum) === undefined ||
        (myUser.notifyMinimum !== undefined && Number(usdValue) >= Number(myUser.notifyMinimum))) {
        bot.sendMessage(myUser._id, whaleTxt, options)
      }
    })
    // bot.sendMessage(j, whaleTxt, options)


  } else if (tx.decoded !== undefined && (tx.decoded.name === "createDelegation") && (tx.to === '0xFC00FACE00000000000000000000000000000000')) {

    var usdValue = (count[0].value * (tx.value / Math.pow(10, 18)))
    var whaleTxt = "🚨" +
      helper.numberWithCommas((Number(tx.value) / Math.pow(10, 18))) + " FTM ($" + helper.numberWithCommas(usdValue) + ") delegated by " +
      "<a href='http://explorer.fantom.network/address/" + tx.from + "'>" + tx.from + "</a> to <a href='http://explorer.fantom.network/validator/" + validators[tx.decoded.params[0].value + ''].address + "'>" + (validators[(tx.decoded.params[0].value - 1) + ''].name === '' ? 'Node' : validators[(tx.decoded.params[0].value - 1) + ''].name) + "-" + validators[(tx.decoded.params[0].value - 1) + '']._id + "</a>\n" +
      "<a href='http://explorer.fantom.network/transactions/" + tx.hash + "'>TX - link</a>";

    _db.find('users_participating', {
      _id: Number(j)
    }, {}, false).then((myUsers) => {
      var myUser = myUsers[0]

      if (myUser.notifyMinimum === undefined ||
        (myUser.notifyMinimum !== undefined && Number(usdValue) >= Number(myUser.notifyMinimum))) {
        bot.sendMessage(Number(myUser._id), whaleTxt, options)
      }
    })
    // bot.sendMessage(j, whaleTxt, options)



  } else if (tx.decoded !== undefined && tx.decoded.name === "prepareToWithdrawDelegation") {
    var usdValue = (count[0].value * (tx.value / Math.pow(10, 18)))
    var whaleTxt = "🚨" +
      helper.numberWithCommas((Number(tx.value) / Math.pow(10, 18))) + " FTM ($" + helper.numberWithCommas(usdValue) + ") preparing to undelegate by " +
      "<a href='http://explorer.fantom.network/address/" + tx.from + "'>" + tx.from + "</a> \n" +
      "<a href='http://explorer.fantom.network/transactions/" + tx.hash + "'>TX - link</a>";
    _db.find('users_participating', {
      _id: Number(j)
    }, {}, false).then((myUsers) => {
      var myUser = myUsers[0]

      if (myUser.notifyMinimum === undefined ||
        (myUser.notifyMinimum !== undefined && Number(usdValue) >= Number(myUser.notifyMinimum))) {
        bot.sendMessage(Number(myUser._id), whaleTxt, options)
      }
    })
    // bot.sendMessage(j, whaleTxt, options)
  }
}