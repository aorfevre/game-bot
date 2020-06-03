var admin_board = require('../admin/admin_board.js')
var moment = require('moment');

var _db = require('../database/mongo_db.js')
module.exports.getMetricsTxt = function(_row) {

  console.log(_row)
  var _txt = "<b>This is a private admin dashboard\n</b>" +
    "Last update (UTC): " + _row.date_update.format("YYYY-MM-DD HH:mm:ss") + "\n\n" +



    "<b>👀 Overview</b>\n" +
    "Users who spoke to the bot 👉 <b>" + _row.total_users + "</b>\n" +
    "Users with 1 wallet at least 👉 <b>" + _row.total_users_with_1_wallet + "</b>\n" +
    "Total wallets tracked 👉 <b>" + _row.total_wallets + "</b>\n"


  var count = Object.keys(REQUIREMENTS).length;
  _txt += "\n<b>🌐 Networks supported " + count + "</b>\n"
  for (var i in _row.networks) {
    _txt += i + ': ' + _row.networks[i] + "\n"
  }


  _txt += "\n<b>💪 Other</b>\n" +
    "Users max # wallets 👉 <b>" + _row.user_with_max_wallets + "</b>\n" +
    "Users tracking 1 networks 👉 <b>" + _row.tracking_1 + "</b>\n" +
    "Users tracking 2 networks 👉 <b>" + _row.tracking_2 + "</b>\n" +
    "Users tracking 3 networks 👉 <b>" + _row.tracking_3 + "</b>\n" +
    "Users tracking 4 networks 👉 <b>" + _row.tracking_4 + "</b>\n" +
    "Users tracking 5 networks 👉 <b>" + _row.tracking_5 + "</b>\n"


  _txt += "\n<b>🚨 Notifications </b>\n" +
    "Total FTM 👉 <b>" + _row.notifyTxFTM + "</b>\n" +
    "Total LTO 👉 <b>" + _row.notifyTxLTO + "</b>\n"



  return _txt
}


module.exports.getDashBoard = function(msg) {
  admin_board.init(msg).then(function(result) {

    var _markup = []


    _markup.push([{
        text: '📝 Update',
        callback_data: 'GET DASHBOARD'
      }

    ])




    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup
      })

    };
    bot.sendMessage(msg.chat.id, admin_board.getMetricsTxt(result), options)
  })
}



global._metrics = {}
module.exports.init = function(msg, _round, mode_exports) {
  return new Promise(function(resolve, reject) {
    var promises = [];

    _metrics = {
      date_update: moment().utc(),


      total_users: 0, //ok
      total_users_with_1_wallet: 0,
      total_wallets: 0,
      user_with_max_wallets: 0,
      networks: {},
      tracking_1: 0,
      tracking_2: 0,
      tracking_3: 0,
      tracking_4: 0,
      tracking_5: 0,
      notifyTxFTM: 0,
      notifyTxLTO: 0

    }
    promises.push(_db.find("notifyTxFTM", {}, {}, true).then((results) => {
      _metrics.notifyTxFTM = results
    }))
    promises.push(_db.find("notifyTxLTO", {}, {}, true).then((results) => {
      _metrics.notifyTxLTO = results
    }))
    promises.push(_db.find("users_participating", {}, {}, false).then((results) => {

      for (var i in results) {
        _metrics.total_users++

        var hasWallet = false
        var userWallets = 0;
        var networksSupported = 0
        for (var j in REQUIREMENTS) {
          if (results[i][REQUIREMENTS[j].type] !== undefined && results[i][REQUIREMENTS[j].type].length > 0) {
            hasWallet = true;
            _metrics.total_wallets += results[i][REQUIREMENTS[j].type].length

            if (_metrics.networks[REQUIREMENTS[j].type] === undefined) {
              _metrics.networks[REQUIREMENTS[j].type] = 0
            }
            _metrics.networks[REQUIREMENTS[j].type] += results[i][REQUIREMENTS[j].type].length
            userWallets += results[i][REQUIREMENTS[j].type].length
            networksSupported++
          }
        }
        if (hasWallet) {
          _metrics.total_users_with_1_wallet++
          if (userWallets > _metrics.user_with_max_wallets) {
            _metrics.user_with_max_wallets = userWallets
          }
          _metrics['tracking_' + networksSupported]++
        }
      }
    }))

    Promise.all(promises).then((r) => {

      _db.set('metrics', 'ablock', null, _metrics, false)
      resolve(_metrics)

      //  bot.sendMessage(517752455,exports_v2.getMetricsTxt(_metrics),options)

    })
  })
}