var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');


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
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,


        };

        _db.find("pricingTOMO", {

        }, {}, false).then((count) => {


          var _txt = "<b>💰TOMO Mainnet Wallet Balance</b>\n👉 <a href='https://scan.tomochain.com/address/" + myUser.TOMOWallets[round] + "'>" + myUser.TOMOWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(response.body.balanceNumber) + "</b> TOMO ($" +
            helper.numberWithCommas(count[0].value * response.body.balanceNumber) + ")\n" +
            "Tokens: <b>" + response.body.tokenTxCount + "</b>\n" +
            "Total Transactions: <b>" + response.body.transactionCount + "</b>\n" +
            "Created at: <b>" + response.body.createdAt + "</b>\n"


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