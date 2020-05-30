var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');


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
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,


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