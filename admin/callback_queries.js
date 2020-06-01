var helper = require('../admin/helper.js')
var ux = require('../admin/ux.js')
var _db = require('../database/mongo_db.js')
var createUser = require('../admin/create_new_user.js')
var human_control = require('../admin/human_control.js')
var lto = require('../chains/lto.js')
var ftm = require('../chains/ftm.js')
var one = require('../chains/one.js')
var xtz = require('../chains/xtz.js')
var tomo = require('../chains/tomo.js')
var cosmos = require('../chains/cosmos.js')
var avap = require('../chains/avap.js')


bot.on("callback_query", function(callbackQuery) {

  var msg = callbackQuery.message



  if (helper.isPrivate(msg) && helper.checkSpam(msg.chat.id)) {


    var control = callbackQuery.data



    helper.getUser(msg, null).then(function(myUser) {

      var match = []
      match.push('0')
      match.push('')

      // console.log("CONTROL",control)

      if (control.indexOf("GET DASHBOARD") !== -1) {
        control = "GET DASHBOARD"
      } else if (control.indexOf("SET DATAS-") !== -1) {
        control = "SET DATAS"
        // } else if (control.indexOf("REFRESH DASHBOARD") !== -1) {
        //   control = "REFRESH DASHBOARD"
      } else if (control.indexOf("DOWNLOAD DATABASE") !== -1) {

        control = "DOWNLOAD DATABASE"

      } else if (control.indexOf("UPDATE DATABASE") !== -1) {
        control = "UPDATE DATABASE"

      } else if (control.indexOf("OPEN AIRDROP") !== -1) {
        control = "OPEN AIRDROP"
      } else if (control.indexOf("CLOSE AIRDROP") !== -1) {
        control = "CLOSE AIRDROP"
      } else if (control.indexOf("GET SOMEONE STATUS") !== -1) {
        control = "GET SOMEONE STATUS"
      } else if (control.indexOf("CHECK HUMAN CONTROL SMILEY") !== -1) {
        control = "CHECK HUMAN CONTROL SMILEY"
      } else if (control.indexOf("SURVEY") !== -1) {
        control = "SURVEY"
      } else if (control.indexOf("DELETE BULK MESSAGE TEXT") !== -1) {
        control = "DELETE BULK MESSAGE TEXT"
      } else if (control.indexOf("SEND BULK MESSAGE TEXT") !== -1) {
        control = "SEND BULK MESSAGE TEXT"
      } else if (control.indexOf("CONFIRM BULK MESSAGE TEXT") !== -1) {
        control = "CONFIRM BULK MESSAGE TEXT"
      } else if (control.indexOf("CHANGE SETTINGS") !== -1) {
        control = "CHANGE SETTINGS"
      } else if (control.indexOf("GET LTO BALANCE") !== -1) {
        control = "GET LTO BALANCE"
      } else if (control.indexOf("DELETE LTO WALLET") !== -1) {
        control = "DELETE LTO WALLET"
      } else if (control.indexOf("GET FTM BALANCE") !== -1) {
        control = "GET FTM BALANCE"
      } else if (control.indexOf("DELETE FTM WALLET") !== -1) {
        control = "DELETE FTM WALLET"
      } else if (control.indexOf("GET ONE BALANCE") !== -1) {
        control = "GET ONE BALANCE"
      } else if (control.indexOf("DELETE ONE WALLET") !== -1) {
        control = "DELETE ONE WALLET"
      } else if (control.indexOf("GET XTZ BALANCE") !== -1) {
        control = "GET XTZ BALANCE"
      } else if (control.indexOf("DELETE XTZ WALLET") !== -1) {
        control = "DELETE XTZ WALLET"
      } else if (control.indexOf("GET TOMO BALANCE") !== -1) {
        control = "GET TOMO BALANCE"
      } else if (control.indexOf("DELETE TOMO WALLET") !== -1) {
        control = "DELETE TOMO WALLET"
      } else if (control.indexOf("GET COSMOS BALANCE") !== -1) {
        control = "GET COSMOS BALANCE"
      } else if (control.indexOf("DELETE COSMOS WALLET") !== -1) {
        control = "DELETE COSMOS WALLET"
      } else if (control.indexOf("GET AVAP BALANCE") !== -1) {
        control = "GET AVAP BALANCE"
      } else if (control.indexOf("DELETE AVAP WALLET") !== -1) {
        control = "DELETE AVAP WALLET"
      }









      switch (control) {

        case "GO HOME":
          ux.showWelcomeMessage(msg, myUser)
          break;

        case "GET MY WALLETS":
          ux.showWalletsMenu(msg, myUser)
          break;

        case "GO NOTIFICATIONS":
          ux.showNotifications(msg, myUser)
          break;
        case "GO SETTINGS":
          ux.showSettings(msg, myUser)
          break;
        case "GET ALL MY BALANCES":
          ux.getAllMyBallances(msg, myUser)
          break;
        case "GET ICO INFO":
          menu.getIcoInfo(msg, myUser.lang);
          break;
        case "GET AIRDROP RULES":
          menu.getAirdropRules(msg, myUser.lang);
          break;
        case "GET AIRDROP BALANCE":
          // console.log()
          menu.getAirdropBalance(msg, null, myUser);
          break;
        case "SET AIRDROP INFO":
          menu.setAirdropInfo(msg, null, myUser);
          break;

        case "SET WELCOME INFO":
          ux.showWelcomeMessage(msg, myUser);
          break;
        case "GET ADMIN PANEL":
          admin.getAdminPanelV2(msg, myUser.lang);
          break;
        case "CLOSE AIRDROP":
          var _round = callbackQuery.data.split("_")[1]
          admin.setAirdropStatus(false, _round).then(function() {
            if (_round === _AIRDROP_ROUND_SELECTED) {
              airdropStatus = false
            }
            menu.setAirdropInfo(msg, null, myUser)
          });
          break;
        case "OPEN AIRDROP":
          var _round = callbackQuery.data.split("_")[1]
          admin.setAirdropStatus(true, _round).then(function() {
            if (_round === _AIRDROP_ROUND_SELECTED) {
              airdropStatus = true
            }
            menu.setAirdropInfo(msg, null, myUser)
          });
          break;
        case "GET MORE TASKS":
          menu.getMoreTasks(msg, myUser)
          break;
        case "SET DATAS": {
          var _type = callbackQuery.data.split("-")[1]
          // console.log("SET DATAS",_type)

          if (_type === "human_smiley") {
            helper.setHumanControlSmiley(msg, myUser)
          } else if (_type === "INVITELINK") {
            var _require = helper.getRequirementText(msg, _AIRDROP_REQUIREMENTS[_type], myUser.lang)
            helper.isUserWhiteListed(msg.chat.id).then(function(r) {
              if (r) {
                _db.get("joinchat", 0).then(function(r) {
                  var time = moment();

                  var valid_until = moment(r.valid_until)

                  var diff = valid_until.diff(time)
                  var _dur = moment.duration(diff)
                  console.log("diff", _dur._data.minutes, _dur._data.seconds, _dur._milliseconds)

                  var _txt = "🎉 Your are whitelisted and can access to our Elite Annoucement 🎉\n\n" +
                    "You can use the following invite link to access to the group\n" +
                    "👉 " + r.link + "\n\n" +
                    "This link will self destruct in " + _dur._data.minutes + "min and " + _dur._data.seconds + "sec"

                  bot.sendMessage(msg.chat.id, _txt).then(function(v) {
                    setTimeout(function() {
                      bot.deleteMessage(msg.chat.id, v.message_id)
                    }, _dur._milliseconds)

                  })

                  // console.log(time.utc(dif))
                  // bot.sendMessage(msg.chat.id,r.link + "\nThis link ").then(function(v){
                  // })
                })

              } else {
                helper.checkWalletAeryus(msg).then(function(walletResponse) {
                  if (walletResponse.error === true) {
                    bot.sendMessage(msg.chat.id, walletResponse.response)
                  } else {

                    helper.checkValidWallet(walletResponse.response.ERC20, 100000).then(function(isValid) {
                      if (!isValid)
                        bot.sendMessage(msg.chat.id, "Your wallet is not eligible to access to our private group.\nPlease contact an admin on @Aeryus1 for support.")
                      else {

                        //test group

                        _db.get("joinchat", 0).then(function(r) {
                          var time = moment();
                          var valid_until = moment(r.valid_until)
                          var diff = valid_until.diff(time)
                          var _dur = moment.duration(diff)

                          var _txt = "🎉 Your wallet is eligible to access to our Elite Annoucement 🎉\n\n" +
                            "You can use the following invite link to access to the group\n" +
                            "👉 " + r.link + "\n\n" +
                            "This link will self destruct in " + _dur._data.minutes + "min and " + _dur._data.seconds + "sec"

                          bot.sendMessage(msg.chat.id, _txt).then(function(v) {
                            setTimeout(function() {
                              bot.deleteMessage(msg.chat.id, v.message_id)
                            }, _dur._milliseconds)

                          })

                          // console.log(time.utc(dif))
                          // bot.sendMessage(msg.chat.id,r.link + "\nThis link ").then(function(v){
                          // })
                        })

                        // bot.exportChatInviteLink(_aeryusSuperGroupID).then(function(link){
                        //
                        //     console.log("link",link)
                        //     setTimeout(function(){
                        //       bot.exportChatInviteLink(_aeryusSuperGroupID).then(function(){
                        //         bot.deleteMessage(msg.chat.id,v.message_id)
                        //         bot.sendMessage(msg.chat.id,"Invite link has been destroyed for security purposes. If you did not join the group, get a new link")
                        //       })
                        //     },15000)
                        //
                        //
                        // })
                      }
                    })
                  }

                })
              }
            })


          } else {
            ux.setInfo(msg, _type, myUser)
          }

          break;
        }



        case "CHECK HUMAN CONTROL SMILEY":

          var _smiley = callbackQuery.data.split("_")[1]
          human_control.checkHumanControlSmiley(msg, _smiley, myUser.human_response, myUser)
          break;
          // case "SET WEBSITE EMAIL ADDRESS":
          //   menu.setInfo(msg, "website_email", myUser.lang)
          //   break;

        case "DOWNLOAD DATABASE":

          var _round = callbackQuery.data.split("_")[1]
          console.log("DOWNLOAD", _round)
          exporting_v2.init(msg, _round, true)
          break;
        case "UPDATE DATABASE":
          var _round = callbackQuery.data.split("_")[1]
          exporting_v2.getDashBoard(msg, _round, false)
          break;
        case "GET ADMIN DASHBOARD":
          admin.getDashBoard(msg)
          break;
        case "CREATE A NEW BULK MSG":
          bulkMessagesAdmin.createNewMessage(msg, "text")
          break;
        case "GET BULK MESSAGES LIST":
          bulkMessagesAdmin.getList(msg)
          break;
        case "DELETE BULK MESSAGE TEXT":
          var _id = callbackQuery.data.split("_")[1]
          bulkMessagesAdmin.deleteMessageText(msg, _id)
          break;
        case "SEND BULK MESSAGE TEXT":
          var _id = callbackQuery.data.split("_")[1]
          bulkMessagesAdmin.sendBulkMessageText(msg, _id)
          break;
        case "CONFIRM BULK MESSAGE TEXT":
          var _id = callbackQuery.data.split("_")[1]
          bulkMessagesAdmin.confirmBulkMessage(msg, _id)
          break;
        case "GET LEASE INFO":
          var _txt = "Contact us directly on @ltolease\n\n" +
            "Our leasing address: 3Jhkp3Xtg2wyT6NoEtJB2VQPAHiYuqYUVBp\n" +
            "Fees: 3.5% \n" +
            "Payout: Daily once 100LTO are stacked. More info on @ltolease\n\n" +
            "Reports: Payout reports are available on <a href='https://lto-lease.com/reports'>lto-lease.com</a>\n" +
            "Twitter: https://twitter.com/LtoLease\n" +
            "Youtube: https://www.youtube.com/channel/UCcMi1PHEwqp7YDk_sLkzKuQ\n"


          var _markup = []

          _markup.push([{
            text: '📢 Join us on Telegram 📢',
            url: 'https://t.me/ltolease'
          }, {
            text: '⁉️ FAQ ⁉️',
            url: 'https://lto-lease.com/'
          }])
          _markup.push([{
            text: '✍️ Lease Guide ✍️',
            url: 'https://lto-lease.com/lease-first-step-guide'
          }, {
            text: '💵 Reports 💵',
            url: 'https://lto-lease.com/payout-reports'
          }])
          var options = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: JSON.stringify({
              inline_keyboard: _markup
            })

          };
          bot.sendMessage(msg.chat.id, _txt, options)
          break
        case "GET DASHBOARD":
          var _round = callbackQuery.data.split("_")[1]
          exporting_v2.getDashBoard(msg, _round, false)
          break;
        case "GET LTO BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          lto.getBalance(msg, myUser, _round)
          break;
        case "CHANGE SETTINGS":
          var _round = callbackQuery.data.split("_")[1]

          ux.changeSetting(msg, myUser, _round)
          break;
        case "DELETE LTO WALLET":
          var _round = callbackQuery.data.split("-")[1]

          lto.deleteWallet(msg, myUser, _round)
          break;
        case "GET FTM BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          ftm.getBalance(msg, myUser, _round)
          break;

        case "DELETE FTM WALLET":
          var _round = callbackQuery.data.split("-")[1]

          ftm.deleteWallet(msg, myUser, _round)
          break;


        case "GET ONE BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          one.getBalance(msg, myUser, _round)
          break;

        case "DELETE ONE WALLET":
          var _round = callbackQuery.data.split("-")[1]

          one.deleteWallet(msg, myUser, _round)
          break;


        case "GET XTZ BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          xtz.getBalance(msg, myUser, _round)
          break;

        case "DELETE XTZ WALLET":
          var _round = callbackQuery.data.split("-")[1]

          xtz.deleteWallet(msg, myUser, _round)
          break;
        case "GET TOMO BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          tomo.getBalance(msg, myUser, _round)
          break;

        case "DELETE TOMO WALLET":
          var _round = callbackQuery.data.split("-")[1]

          tomo.deleteWallet(msg, myUser, _round)
          break;

        case "GET COSMOS BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          cosmos.getBalance(msg, myUser, _round)
          break;

        case "DELETE COSMOS WALLET":
          var _round = callbackQuery.data.split("-")[1]

          cosmos.deleteWallet(msg, myUser, _round)
          break;

        case "GET AVAP BALANCE":
          var _round = callbackQuery.data.split("-")[1]

          avap.getBalance(msg, myUser, _round)
          break;

        case "DELETE AVAP WALLET":
          var _round = callbackQuery.data.split("-")[1]

          avap.deleteWallet(msg, myUser, _round)
          break;
          // case "REFRESH DASHBOARD":
          //   var _round = callbackQuery.data.split("_")[1]
          //   exporting_v2.refresh( _round)
          //   break;
        case "GET SOMEONE STATUS":
          var _round = callbackQuery.data.split("_")[1]
          admin.getIdToInvestigate(msg, _round, myUser.lang)
          break;
        case "SURVEY":
          var _type = callbackQuery.data.split("_")[1]
          var _response = callbackQuery.data.split("_")[2]
          var _require = helper.getRequirementText(msg, _AIRDROP_REQUIREMENTS[_type], myUser.lang)
          var _tmpUser = JSON.parse(JSON.stringify(myUser));

          _tmpUser[_type] = _response

          if (_require.type === "claimallcompleted" && _require.claimaftercompleted !== undefined &&
            _require.claimaftercompleted && helper.isAllRequirementsDone(_tmpUser, _AIRDROP_ROUNDS[_AIRDROP_ROUND], _AIRDROP_ROUNDS[_AIRDROP_ROUND]._AIRDROP_REQUIREMENTS[_type].bounty_token_value) === 0) {
            var _txtText = _require.check_invalid

            helper.sendMessageAfterSubmit(msg, _txtText, _type, _txtText, false, myUser)

          } else if (_require.disclaimer !== undefined && _require.disclaimer && myUser['disclaimer'] == undefined) {
            console.warn("_response", _response)
            helper.isDisclaimer(msg, _response).then(function(returnDisclaimer) {
              if (!returnDisclaimer) {
                var _txtText = _require.check_invalid

                helper.sendMessageAfterSubmit(msg, _txtText, _type, _txtText, false, myUser)
              } else {
                helper.sendMessageAfterSubmit(msg, _require.text_valid_long, _type, _require.check_valid, true, myUser)
              }

            })


          } else {

            if (_require.check_valid_image !== undefined && _require.check_valid_image.indexOf(".gif") !== -1) {
              var image = __dirname + "/img/" + _require.check_valid_image
              bot.sendDocument(msg.chat.id, image).then(function() {
                helper.sendMessageAfterSubmit(msg, null, _type, _response, true, myUser)
              })
            } else if (_require.check_valid_image !== undefined && _require.check_valid_image.indexOf(".gif") === -1) {
              var image = __dirname + "/img/" + _require.check_valid_image
              bot.sendPhoto(msg.chat.id, image).then(function() {
                helper.sendMessageAfterSubmit(msg, null, _type, _response, true, myUser)
              })
            } else {
              helper.sendMessageAfterSubmit(msg, _require.text_valid_long + "<b> 👉 " + _response + " 👈</b> ", _type, _response, true, myUser)
            }
          }
          break;
        default:
          break;
      }

    })

  }
})