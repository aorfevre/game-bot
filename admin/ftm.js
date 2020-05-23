var ux = require('../admin/ux.js')

var _db = require('../database/mongo_db.js')

var request = require('request');
module.exports.getBalance = function(msg, myUser, round) {
  bot.sendMessage(msg.chat.id, "Todo user balance")

  //
  // request.post(
  //   'https://api-staking.ablock.io/explorer/opera', {
  //
  //     query: round
  //
  //   },
  //   function(error, response, body) {
  //     if (!error && response.statusCode == 200) {
  //       console.log(body);
  //     }
  //   }
  // );

}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.FTMWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "FTMWallets", myUser.FTMWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}