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

  _txt += "\n<b>💬 Chats</b>\n" +
    "Chats having the bot: " + _row.chatGroups + "\n" +
    "Total users in chats: " + _row.chatUsers + "\n"

  _txt += "\n<b>💬 Staking Rewards</b>\n" +
    "Different Cmd Users: " + _row.sr.differentCmd + "\n" +
    "Total call: " + _row.sr.totalCall + "\n"

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
  _db.set('users_participating', msg.chat.id, null, {
    // edit: false,
    type: null
  }, false).then(function() {
    admin_board.init(msg).then(function(result) {

      var _markup = []


      _markup.push([{
          text: '📝 Update Metrics',
          callback_data: 'GET DASHBOARD'
        },
        {
          text: 'Show groups names',
          callback_data: 'SHOW GROUPS NAMES'
        }



      ])
      _markup.push([{
          text: 'Bulk Messages',
          callback_data: 'GET BULK MESSAGES LIST'
        }


      ])
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
      bot.sendMessage(msg.chat.id, admin_board.getMetricsTxt(result), options)
    })
  })
}



global._metrics = {}

setTimeout(() => {
  // this.getGroups()
}, 1000)

_setGroupInfos = function(id) {

  return new Promise(function(resolve, reject) {
    var _id = id.toFixed(0)
    bot.getChat(_id).then((r) => {
      console.log('get Group inf', r)
      bot.getChatMembersCount(_id).then((s) => {
        console.log(r, s)
        var final = JSON.parse(JSON.stringify(r))
        final.count = s
        final.removed = false
        _db.set('groups', id, null, final, false).then(() => {
          resolve(true)
        })
      }, (err) => {
        _db.set('groups', id, null, {
          removed: true
        }, false).then(() => {
          resolve(false)
        })
      })
    }, (err) => {
      console.log('err', _id, err.response.body)
      _db.set('groups', id, null, {
        removed: true
      }, false).then(() => {
        resolve(false)
      })
    })
  })

}
module.exports.getGroupsName = function(msg, myUser) {
  return new Promise((resolve, reject) => {
    this.getGroups().then(() => {


      _db.find("groups", {

      }, {}, false).then((results) => {
        console.log(results)

        var _txt = ''
        for (var i in results) {
          if (results[i].title !== undefined)
            _txt += " \n " + results[i].title + "(" + results[i].count + ")\n "
          // console.log(results[i].title, "/", results[i].count)
        }


        var _markup = []


        _markup.push([{
            text: 'Metrics',
            callback_data: 'GET DASHBOARD'
          }



        ])

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
        bot.sendMessage(msg.chat.id, _txt, options)

      })
    })
  })
}

module.exports.getGroups = function() {
  return new Promise(function(resolve, reject) {
    var promises = [];
    promises.push(_db.find("users", {
      'chat.type': {
        $ne: 'private'
      }
    }, {}, false).then((results) => {
      console.log(results.length)
      for (var k in results) {
        console.log('results[k]._id', results[k]._id)
        promises.push(_setGroupInfos(results[k]._id).then((r) => {
          console.log("finish promise", r);
        }));
      }
    }))


    Promise.all(promises).then((r) => {

      console.log("Promise finish")
      resolve()

      //  bot.sendMessage(517752455,exports_v2.getMetricsTxt(_metrics),options)

    })


  });

}


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
      notifyTxLTO: 0,
      chatGroups: 0,
      chatUsers: 0,
      sr: {
        differentCmd: 0,
        totalCall: 0
      }

    }

    promises.push(_db.find("kpi-call-sr", {}, {}, false).then((results) => {
      _metrics.sr.differentCmd = results.length;
      for (var i in results) {
        console.log("results kpi-call-sr", results[i])
        _metrics.sr.totalCall += results[i].count
      }

    }))

    promises.push(_db.find("groups", {
      $and: [{
        'removed': false
      }]
    }, {}, true).then((results) => {

      _metrics.chatGroups = results
    }))
    promises.push(_db.find("groups", {
      'removed': false
    }, {}, false).then((results) => {
      for (var i in results) {
        _metrics.chatUsers += results[i].count

      }

    }))
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