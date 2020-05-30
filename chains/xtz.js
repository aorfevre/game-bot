var ux = require('../admin/ux.js');
var helper = require('../admin/helper.js');
var _db = require('../database/mongo_db.js')

var request = require('request');


module.exports.getBalance = function(msg, myUser, round) {
  // tz1XF4HAJEyfhG8RU7hWq3Rvtd4j2Mmsd32Q
  var headersOpt = {
    // "content-type": "application/json",
  };
  console.log('https://api-teztracker.everstake.one/v2/data/tezos/mainnet/accounts/' + myUser.XTZWallets[round])

  request({
      method: 'get',
      url: 'https://api-teztracker.everstake.one/v2/data/tezos/mainnet/accounts/' + myUser.XTZWallets[round],
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

        _db.find("pricingXTZ", {

        }, {}, false).then((count) => {
          console.log('count[0].value', count[0].value)
          var newDate = new Date();
          newDate.setTime(response.body.lastActive * 1000);
          dateString = newDate.toUTCString();
          var _txt = "<b>💰XTZ Mainnet Wallet Balance</b>\n👉 <a href='https://tzstats.com/" + myUser.XTZWallets[round] + "'>" + myUser.XTZWallets[round] + "</a>\n\n" +
            "Balance: <b>" + helper.numberWithCommas(response.body.balance / 1000000) + "</b> XTZ ($" +
            helper.numberWithCommas(count[0].value * response.body.balance / 1000000) + ")\n" +
            "Total Transactions: <b>" + response.body.transactions + "</b>\n" +
            "Last active: <b>" + dateString + "</b>\n"


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