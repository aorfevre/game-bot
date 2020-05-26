var ux = require('../admin/ux.js')
var helper = require('../admin/helper.js')

var _db = require('../database/mongo_db.js')

var request = require('request');
module.exports.getBalance = function(msg, myUser, round) {

  var headersOpt = {
    "content-type": "application/json",
  };

  request({
      method: 'post',
      url: 'https://xapi1.fantom.network/api',
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
        console.log("SUCCESS", response.body);

        //
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,


        };

        _db.find("pricingFTM", {

        }, {}, false).then((count) => {


          var _txt = "<b>💰 FTM Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.fantom.network/address/" + myUser.FTMWallets[round] + "'>" + myUser.FTMWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.balance, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.balance, 16) / Math.pow(10, 18)) + ")\n" +
            "Total Value: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.totalValue, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.totalValue, 16) / Math.pow(10, 18)) + ")\n"

          if (response.body.data.account.delegation !== undefined && response.body.data.account.delegation.amount !== undefined) {
            _txt += "\nStaking\n"

            _txt += "Staked: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.amount, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.amount, 16) / Math.pow(10, 18)) + ")\n"
            _txt += "Pending reward: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.pendingRewards.amount, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.pendingRewards.amount, 16) / Math.pow(10, 18)) + ")\n"
            _txt += "Claimed reward: <b>" + helper.numberWithCommas(parseInt(response.body.data.account.delegation.claimedReward, 16) / Math.pow(10, 18)) + "</b> FTM ($" + helper.numberWithCommas(count[0].value * parseInt(response.body.data.account.delegation.claimedReward, 16) / Math.pow(10, 18)) + ")\n"
          }
          console.log("response.body.data.account", response.body.data.account.delegation)
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