var helper = require('../admin/helper.js')
var ux = this

var _db = require('../database/mongo_db.js')

var human_control = require('../admin/human_control.js')


bot.onText(/^\/[sS]tart(.+|\b)/, (msg, match) => {
  helper.getUser(msg, match).then((myUser) => {
    if (myUser.human_smiley === undefined || myUser.human_smiley !== 'approved') {
      human_control.setHumanControlSmiley(msg, myUser)
    } else {

      if (myUser.settings === undefined) {
        ux.showSettings(msg, myUser)
      } else {
        ux.showWelcomeMessage(msg, myUser)
      }

    }

  })

});
module.exports.changeSetting = function(msg, myUser, setting) {
  console.log("myUser.settings", myUser.settings, setting)
  myUser.settings[setting] = !myUser.settings[setting]
  ux.showSettings(msg, myUser)
}

module.exports.getAllMyBallances = function(msg, myUser) {



  var _promises = [];


  for (var i in REQUIREMENTS) {

    if (myUser.settings[REQUIREMENTS[i].type] === true) {

      _promises.push(REQUIREMENTS[i].balances(myUser))
    }


  }


  Promise.all(_promises).then((r) => {
    var _txt = ""
    var totalUSd = 0;
    for (var i in r) {
      if (r[i].txt !== undefined && r[i].usd > 0) {
        _txt += r[i].txt;
        totalUSd += r[i].usd
        _txt += "\n▫️▫️▫️▫️▫️▫️\n\n";
      }

    }

    _txt += "\n" +
      "Total Assets <b>$" + helper.numberWithCommas(totalUSd) + "</b>";

    var _markup = [];
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

}
module.exports.showSettings = function(msg, myUser) {

  var _txt = "You can define your favorite networks in this screen.\n" +
    "You can come back any time to change your favorite networks."

  var _markup = [];

  var _tmp = []
  for (var i in REQUIREMENTS) {
    if (REQUIREMENTS[i] !== undefined) {


      if (myUser.settings === undefined) {
        myUser.settings = {}
      }
      console.log("REQUIREMENTS[i]", REQUIREMENTS[i])
      if (myUser.settings[REQUIREMENTS[i].type] === undefined) {
        myUser.settings[REQUIREMENTS[i].type] = true
      }

      var prefix = ''
      if (myUser.settings[REQUIREMENTS[i].type] === true) {
        prefix = '✅'
      } else {
        prefix = '❌'
      }
      _tmp.push({
        text: REQUIREMENTS[i].name + prefix,
        callback_data: "CHANGE SETTINGS_" + REQUIREMENTS[i].type
        // callback_data: _require.btn_callback
      })

      if (_tmp.length === 2) {
        _markup.push(_tmp);
        _tmp = []
      }
    }
  }
  if (_tmp.length !== 0) {
    _markup.push(_tmp);
    _tmp = []
  }
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




  _db.set('users_participating', msg.chat.id, null, myUser, true)
  bot.sendMessage(msg.chat.id, _txt, options)

}

module.exports.showWelcomeMessage = function(msg, myUser) {
  var _txt = "<b>Hello";
  if (msg.chat.username !== undefined)
    _txt += " " + msg.chat.username + "</b>,\n\n"
  else {
    _txt += "</b>,\n\n"
  }

  _txt += "⭐️ <i> This bot will send you a message every time a transaction happens on your wallets. Keep track of your wallet movements automatically (FTM/LTO)!\n" +
    "</i>\n" +

    "🚨<b> The bot will NEVER ask you for your PRIVATE KEYS. Always type your PUBLIC KEYS.</b>.\n" +

    "\n" +
    "💪 <b>Follow us on:</b>\n" +
    "🔸 <a href='https://t.me/ablockio'>Telegram Discussion</a>\n" +
    "🔸 Telegram Whale Alert <a href='https://t.me/ablockLTOWhale'>LTO</a> | <a href='https://t.me/ablockLTOWhale'>FTM</a>\n" +
    "🔸 <a href='https://twitter.com/ablock_io'>Twitter</a>\n" +
    "🔸 <a href='https://medium.com/@ablock.io'>Medium</a>\n"

  var _markup = [];

  var totalWallets = 0;
  for (var i in REQUIREMENTS) {

    if (REQUIREMENTS[i].type.indexOf('Wallets') !== -1 && myUser.settings[REQUIREMENTS[i].type] === true && myUser[REQUIREMENTS[i].type] !== undefined) {
      console.log("myUser[REQUIREMENTS[i].type]", REQUIREMENTS[i].type, myUser[REQUIREMENTS[i].type])
      totalWallets += myUser[REQUIREMENTS[i].type].length
    }
  }

  _markup.push([{
    text: "My Wallets 🚀 (" + totalWallets + ")",
    callback_data: "GET MY WALLETS"
  }, {
    text: "💰💰My balances 💰💰",
    callback_data: "GET ALL MY BALANCES"
  }])

  _markup.push([{
    text: "Notifications 🔊",
    callback_data: "GO NOTIFICATIONS"
  }, {
    text: "Settings ⚙️",
    callback_data: "GO SETTINGS"
  }])
  console.log("helper.isAdmin(msg)", helper.isAdmin(msg))
  if (helper.isAdmin(msg)) {

    _markup.push([{
        text: '👨‍✈️Dashboard',
        callback_data: 'GET DASHBOARD'
      }

    ])


    // _markup.push([{
    //   text: '👨‍✈️Dashboard ',
    //   callback_data: 'GET ADMIN DASHBOARD'
    // }])
  }
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };
  bot.sendMessage(msg.chat.id, _txt, options)


}
module.exports.showNotifications = function(msg, myUser) {
  var _txt = '<b>⚡️ Work in progress</b>\n\n' +
    'You will soon be available to customize notifications and have daily/weekly/monthly reports on your balances.\n' +
    'Stay tuned';
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,


  };
  bot.sendMessage(msg.chat.id, _txt, options)

}
module.exports.showWalletsMenu = function(msg, myUser) {

  if (helper.isPrivate(msg)) {


    try {
      var _txt = 'Add the wallets you want to track and see balances.\n' +
        'You can add as many wallets as you want and update your list whenever you want.\n';



      var _info = ""


      var _markup = []

      // _markup.push([{
      //     text: "LTO uptime",
      //     url: "https://lto.ablock.io"
      //     // callback_data: _require.btn_callback
      //   },
      //   {
      //     text: "FTM uptime",
      //     url: "https://fantom.ablock.io"
      //     // callback_data: _require.btn_callback
      //   }
      // ])


      for (var i in REQUIREMENTS) {
        var _require = REQUIREMENTS[i]


        if (myUser !== null && myUser[_require.type] !== undefined && myUser[_require.type] !== null) {
          _tmpPrefix = "✅ "
          if (_require.type === "human_smiley")
            _isRequirementToDisplay = false
        } else {

          if (_require.type !== "INVITELINK")
            _tmpPrefix = "❌ "
        }

        if (_require.type.indexOf('Wallets') !== -1)
          _tmpPrefix = ""

        if (myUser !== null && myUser.settings[_require.type] === true) {

          _markup.push([{
            text: _tmpPrefix + _require.btn_txt,
            callback_data: "SET DATAS-" + _require.type
            // callback_data: _require.btn_callback
          }])

        }


        if (REQUIREMENTS[i].type.indexOf('Wallets') !== -1 && myUser.settings[REQUIREMENTS[i].type] === true && myUser[REQUIREMENTS[i].type] !== undefined) {
          for (var l in myUser[REQUIREMENTS[i].type]) {

            _markup.push([{
                text: myUser[REQUIREMENTS[i].type][l],
                url: _require.explorer + myUser[REQUIREMENTS[i].type][l]
              }, {
                text: '💰',
                callback_data: "GET " + REQUIREMENTS[i].ticker + " BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              },
              {
                text: 'Remove wallet',
                callback_data: "DELETE " + REQUIREMENTS[i].ticker + " WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              }


            ])
          }
        }


      }




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



    } catch (e) {
      console.log('err', e)
    }

  }
}
var getRequirementByType = function(type) {
  for (var i in REQUIREMENTS) {
    if (REQUIREMENTS[i].type === type)
      return REQUIREMENTS[i]
  }
  return null
}

module.exports.setInfo = function(msg, type, myUser) {
  var _txt = ""

  _db.set('users_participating', msg.chat.id, null, {
    // edit: false,
    type: type
  }, false).then(function() {



    //
    // helper.getUser(msg).then(function(myUser){
    //
    //
    // var _value = usersFIFO[msg.chat.id]
    var _require = getRequirementByType(type)


    _txt = _require.text_question
    //
    //
    // if (txt !== undefined && txt !== null) {
    //   _txt += txt
    // }

    var _markup = []


    _markup.push([{
      text: "❌ Cancel",
      callback_data: 'SET WELCOME INFO'
    }])



    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup
      })

    };



    bot.sendMessage(msg.chat.id, _txt, options);

  })


}