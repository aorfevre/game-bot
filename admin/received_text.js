var helper = require('../admin/helper.js')
var _db = require('../database/mongo_db.js')
var human_control = require('../admin/human_control.js')

var ux = require('../admin/ux.js')

bot.on('text', function(msg, match) {


  if (helper.isPrivate(msg) && helper.checkSpam(msg.chat.id) && msg.text.toLowerCase().indexOf("/start") === -1) {


    helper.getUser(msg, null).then(function(myUser) {

      // if (helper.isAdmin(msg) && _underInvestigation) {
      //   _underInvestigation = false;
      //   admin.getInfoFromId(msg, myUser.lang)
      //
      //
      //
      //
      // } else


      //  if (msg.text.indexOf(_airdrop.btn_home) !== -1) {
      //   menu.setAirdropInfo(msg, null, myUser)
      // } else if (msg.text.indexOf(_airdrop.btn_balance) !== -1) {
      //   console.log("BALANCE")
      //   menu.getAirdropBalance(msg, null, myUser);
      // } else if (msg.text.indexOf(_airdrop.btn_info) !== -1) {
      //   menu.getIcoInfo(msg, myUser.lang);
      // } else if (msg.text.indexOf(_airdrop.btn_rules) !== -1) {
      //   menu.getAirdropRules(msg, myUser.lang);
      // } else if (msg.text.indexOf(_airdrop.btn_lang) !== -1) {
      //   menu.getLangMenu(msg)
      //
      //
      // } else
      //
      // if (msg.text.toLowerCase().indexOf("/start") === -1 &&
      //   myUser.type === "admin_create_message_bulk_text") {
      //   bulkMessagesAdmin.createNewMessageEntry(msg)
      // } else if (helper.isLang(msg) !== false) {
      //   helper.setUserLang(msg, myUser)
      // } else if (msg.text.indexOf(_airdrop.btn_edit_info) !== -1 && airdropStatus) {
      //   menu.setAirdropInfo(msg, null, myUser);
      // } else if (msg.text.indexOf(_airdrop.btn_edit_info) !== -1 && !airdropStatus) {
      //   menu.setAirdropInfo(msg, null, myUser)
      // } else
      if (
        // msg.text.toLowerCase().indexOf("/start") === -1 &&
        REQUIREMENTS[myUser.type] !== undefined &&
        REQUIREMENTS[myUser.type].type_data === "text") {

        var _myType = myUser.type
        var _txtText
        var _require = REQUIREMENTS[_myType]


        _require.check(msg, REQUIREMENTS[myUser.type]).then(function(result) {
          helper.checkDuplicateEntry(msg, myUser.type).then(function(dup) {
            if (!dup) {

              if (_require.check !== undefined &&
                !result) {

                _txtText = _require.invalid

                helper.sendMessageAfterSubmit(msg, _txtText, _myType, _txtText, false, myUser)
              } else {


                _txtText = "<b> 👉 " + msg.text + " 👈</b> saved"
                _val = msg.text
                //            _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, _myType, msg.text, false)

                helper.sendMessageAfterSubmit(msg, _txtText, _myType, _val, true, myUser)







              }
            } else {
              console.log(_airdrop)
              bot.sendMessage(msg.chat.id, "Data duplicated not allowed.")
            }
          })
        })


      }
      // else if (myUser.type !== undefined && myUser.type !== null && myUser.type !== false &&
      //   REQUIREMENTS[myUser.type] !== undefined &&
      //   REQUIREMENTS[myUser.type].type_data !== "text") {
      //   bot.sendMessage(msg.chat.id, _submission.msg_data_incorrect + REQUIREMENTS[myUser.type].type)
      //
      // }
      //   }
      // ])
    })
  }
})