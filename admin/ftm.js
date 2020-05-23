var ux = require('../admin/ux.js')

var _db = require('../database/mongo_db.js')

module.exports.getBalance = function(msg, myUser, round) {
  bot.sendMessage(msg.chat.id, "put user balance")
}
module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.FTMWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "FTMWallets", myUser.FTMWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}