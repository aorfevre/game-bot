var helper = require('../admin/helper.js')
var ux = this

var _db = require('../database/mongo_db.js')

var human_control = require('../admin/human_control.js')



global.REQUIREMENTS = {
  LTOWallets: {
    btn_txt: "Add your LTO network wallet address",
    type: "LTOWallets",
    text_question: "1/ Type a LTO Network wallet address \n" +
      "2/ Enjoy!\n " +
      "\n" +
      "<i>You will receive notifications regarding transfers, lease and cancelled lease and mass transfers</i>",
    type_data: "text",
    check: helper.validateLTO,
    allow_dup: true,
    invalid: 'This is not a correct LTO mainnet address',
    explorer: 'https://explorer.lto.network/addresses/'

  },
  FTMWallets: {
    btn_txt: "Add your Fantom Opera network wallet address",
    type: "FTMWallets",
    text_question: "1/ Type a Fantom Opera wallet\n" +
      "2/ Enjoy!\n" +
      "\n" +
      "<i>You will receive notifications regarding transfers, delegation and un-delegation</i>",
    type_data: "text",
    check: helper.validateERC20,
    allow_dup: true,
    invalid: 'This is not a correct Fantom Opera address',
    explorer: 'https://explorer.fantom.network/address/'

  },
  ONEWallets: {
    btn_txt: "Add your Harmony network wallet address",
    type: "ONEWallets",
    text_question: "1/ Type a Harmony wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.noCheck,
    allow_dup: true,
    invalid: 'This is not a correct ONE mainnet address',
    explorer: 'https://explorer.harmony.one/#/address/'

  },
  XTZWallets: {
    btn_txt: "Add your Tezos wallet address",
    type: "XTZWallets",
    text_question: "1/ Type a Tezos wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.noCheck,
    allow_dup: true,
    invalid: 'This is not a correct XTZ mainnet address',
    explorer: 'https://tzstats.com/'

  }



}

var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms

  console.log(timeDiff + " ms");
}

bot.onText(/^\/[sS]tart(.+|\b)/, (msg, match) => {
  helper.getUser(msg, match).then((myUser) => {
    if (myUser.human_smiley === undefined || myUser.human_smiley !== 'approved') {
      human_control.setHumanControlSmiley(msg, myUser)
    } else {
      ux.showWelcomeMessage(msg, myUser)

    }

  })

});

module.exports.showWelcomeMessage = function(msg, myUser) {

  if (helper.isPrivate(msg)) {


    try {

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

        if (myUser !== null) {

          _markup.push([{
            text: _tmpPrefix + _require.btn_txt,
            callback_data: "SET DATAS-" + _require.type
            // callback_data: _require.btn_callback
          }])

        }
        if (_require.type === "LTOWallets" && myUser["LTOWallets"] !== undefined) {

          for (var l in myUser.LTOWallets) {

            _markup.push([{
                text: myUser["LTOWallets"][l],
                url: _require.explorer + myUser["LTOWallets"][l]
              }, {
                text: '💰',
                callback_data: "GET LTO BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              },
              {
                text: 'Remove wallet',
                callback_data: "DELETE LTO WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              }


            ])
          }

        }
        if (_require.type === "FTMWallets" && myUser["FTMWallets"] !== undefined) {

          for (var l in myUser.FTMWallets) {

            _markup.push([{
                text: myUser["FTMWallets"][l],
                url: _require.explorer + myUser["FTMWallets"][l]
              }, {
                text: '💰',
                callback_data: "GET FTM BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["FTM"]
              },
              {
                text: 'Remove wallet',
                callback_data: "DELETE FTM WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["FTM"]
              }


            ])
          }
        }
        if (_require.type === "ONEWallets" && myUser["ONEWallets"] !== undefined) {

          for (var l in myUser.ONEWallets) {

            _markup.push([{
                text: myUser["ONEWallets"][l],
                url: _require.explorer + myUser["ONEWallets"][l]
              }, {
                text: '💰',
                callback_data: "GET ONE BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["ONE"]
              },
              {
                text: 'Remove wallet',
                callback_data: "DELETE ONE WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["FTM"]
              }


            ])
          }


        }
        if (_require.type === "XTZWallets" && myUser["XTZWallets"] !== undefined) {

          for (var l in myUser.XTZWallets) {

            _markup.push([{
                text: myUser["XTZWallets"][l],
                url: _require.explorer + myUser["XTZWallets"][l]
              }, {
                text: '💰',
                callback_data: "GET XTZ BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["XTZ"]
              },
              {
                text: 'Remove wallet',
                callback_data: "DELETE XTZ WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["FTM"]
              }


            ])
          }


        }



      }


      if (helper.isAdmin(msg)) {

        _markup.push([{
            text: '👨‍✈️Dashboard Round ' + i,
            callback_data: 'GET DASHBOARD_' + i
          }

        ])


        _markup.push([{
          text: '👨‍✈️Dashboard ',
          callback_data: 'GET ADMIN DASHBOARD'
        }])
      }

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