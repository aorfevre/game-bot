var ux = require('../admin/ux.js')

var _db = require('../database/mongo_db.js')
module.exports.getBalance = function(msg, myUser, round) {

  var _wallet = "https://nodes.lto.network/addresses/balance/details/" + myUser.LTOWallets[round]

  var http = require('http'),
    url = require('url'),
    request = require('request');

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
    var _txt = "<b>💰 LTO Mainnet Wallet Balance</b>\n👉 <a href='https://explorer.lto.network/address/" + myUser.LTOWallets[round] + "'>" + myUser.LTOWallets[round] + "</a>\n\n" +
      "Regular: <b>" + _body.regular + "</b> LTO\n" +
      "Generating: <b>" + _body.generating + "</b> LTO\n" +
      "Available: <b>" + _body.available + "</b> LTO\n" +
      "Effective: <b>" + _body.effective + "</b> LTO\n"


    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,


    };
    bot.sendMessage(msg.chat.id, _txt, options)

    // console.log(res.body)

  })
}

module.exports.deleteWallet = function(msg, myUser, round) {

  myUser.LTOWallets.splice(round, 1)
  _db.set("users_participating", msg.chat.id, "LTOWallets", myUser.LTOWallets, false).then(function() {
    ux.showWelcomeMessage(msg, myUser)
  })
}