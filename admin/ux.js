var helper = require('../admin/helper.js')
var ux = this

var _db = require('../database/mongo_db.js')

var human_control = require('../admin/human_control.js')



global.REQUIREMENTS = {
  LTOWallets: {
    btn_txt: "➕LTO Mainnet",
    type: "LTOWallets",
    text_question: "1/ Type a LTO Mainnet wallet address that you wish to track\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateLTO,
    allow_dup: true,
    invalid: 'This is not a correct LTO mainnet address'

  },
  FTMWallets: {
    btn_txt: "➕FTM Mainnet",
    type: "FTMWallets",
    text_question: "1/ Type a FTM Mainnet wallet address that you wish to track\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateERC20,
    allow_dup: true,
    invalid: 'This is not a correct FTM mainnet address'

  }
}



bot.onText(/^\/[sS]tart(.+|\b)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, "Starting next")
  helper.getUser(msg, match).then((myUser) => {
    console.log(msg, myUser.human_smiley)

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

      _txt += "ablock bot, do that and that ... "




      var _info = ""


      var _markup = []

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

        if (_require.type === "LTOWallets" || _require.type === "FTMWallets")
          _tmpPrefix = ""
        // console.log(i,datas[_require.type] !== undefined,datas[_require.type] !== null)
        //
        console.log("myUser[_require.type]", myUser[_require.type])
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
                callback_data: "NADA"
              }, {
                text: '💰',
                callback_data: "GET LTO BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              },
              {
                text: '➖',
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
                callback_data: "NADA"
              }, {
                text: '💰',
                callback_data: "GET FTM BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["FTM"]
              },
              {
                text: '➖',
                callback_data: "DELETE FTM WALLET-" + l
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