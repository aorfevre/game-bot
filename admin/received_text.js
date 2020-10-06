var helper = require('../admin/helper.js')
var _db = require('../database/mongo_db.js')
var human_control = require('../admin/human_control.js')
var bulkMessagesAdmin = require('../admin/bulkMessagesAdmin.js')
var ux = require('../admin/ux.js')
var twitter = require('./twitter.js')
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
      if (msg.text.toLowerCase().indexOf("/start") === -1 &&
        myUser.type === "admin_create_message_bulk_text") {
        bulkMessagesAdmin.createNewMessageEntry(msg)
      } else if (
        // msg.text.toLowerCase().indexOf("/start") === -1 &&
        REQUIREMENTS[myUser.type] !== undefined &&
        REQUIREMENTS[myUser.type].type_data === "text") {

        var _myType = myUser.type
        var _txtText
        var _require = REQUIREMENTS[_myType]

        console.log(_require)
        _require.check(msg, REQUIREMENTS[myUser.type]).then(function(result) {
          helper.checkDuplicateEntry(msg, myUser.type).then(function(dup) {
            if (!dup || _require.allow_dup) {
              console.log('1')
              if (_require.check !== undefined &&
                !result) {
                console.log('2')
                _txtText = _require.invalid

                bot.sendMessage(msg.chat.id, _require.invalid)
              } else {


                _txtText = "<b> 👉 " + msg.text + " 👈</b> saved"
                _val = msg.text
                //            _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, _myType, msg.text, false)

                helper.sendMessageAfterSubmit(msg, _txtText, _myType, _val, true, myUser)







              }
            } else {

              bot.sendMessage(msg.chat.id, "Data duplicated not allowed.")
            }
          })
        })


      } else if (myUser.type !== null && myUser.type.indexOf('CONTEST_') !== -1) {
        //VERIFY TWITTER FORMAT

        var _split = msg.text.toLowerCase().split('status/')[1]

        twitter.checkTweet(_split).then(r => {

          if (r.errors !== undefined && r.errors.length > 0) {
            bot.sendMessage(msg.chat.id, "This is not a valid tweet. If you still have issues, contact us on @ablockio")
          } else {

            if (r.text !== undefined && r.text.indexOf('#FTMtothemoon') !== -1 &&
              r.text.indexOf('$FTM') !== -1) {
              var _datas = {
                user: myUser._id,
                entry: msg.text.toLowerCase(),
                status: null,
                timestamp: new Date(),
                myUser: myUser

              }
              var _markup = []

              console.log('id', 'APPROVE-' + _split + "-" + myUser.type)
              _markup.push([{
                  text: "Approve",
                  callback_data: 'APPROVE-' + _split + "-" + myUser.type
                },
                {
                  text: "Reject",
                  callback_data: 'REJECT-' + _split + "-" + myUser.type

                }
              ])
              var options = {
                parse_mode: "HTML",
                disable_web_page_preview: false,
                reply_markup: JSON.stringify({
                  inline_keyboard: _markup
                })

              };

              _db.set(myUser.type, _split, null, _datas, false).then(() => {

                bot.sendMessage("@ablockFTMContest100K", "New entry from " + myUser._id + "\n" +
                  msg.text.toLowerCase(), options).then(ms => {
                  bot.sendMessage(msg.chat.id, "Thank you for participating in the contest and good luck! We'll be in touch if you're the winner. Feel free to submit more entries!\n" +
                    "Check it on https://t.me/ablockFTMContest100K/" + ms.message_id)
                })
              })

            } else {
              var options = {
                parse_mode: "HTML",
                disable_web_page_preview: false,


              };
              bot.sendMessage(msg.chat.id, "Your tweet does not have the #FTMtothemoon and $FTM tags.\n<b>Your participation is not saved.</b>", options)
            }
          }
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