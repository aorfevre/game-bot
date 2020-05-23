"use strict";

var async = require('async');
var dico = require("../custo/dico.js")
var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var menu = this
var helper_msg = require('../admin/helper_msg.js')
var exporting_v2 = require('../admin/data_exports_v2.js')

module.exports.setInfo = function(msg, type, lang) {
  var _txt = ""

  var _lang = {
    lang: lang
  }

  if (!airdropStatus)
    return menu.setSubmissionByDatas(msg, null, _lang, false)


  var _airdrop = dico.getWordLang(lang, "airdrop", menu.getLangMenu)
  // console.log("enter",type)

  // usersFIFO[msg.chat.id].type = type
  // usersFIFO[msg.chat.id].edit = false
  _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, null, {
    // edit: false,
    type: type
  }, false).then(function() {



    //
    // helper.getUser(msg).then(function(myUser){
    //
    //
    // var _value = usersFIFO[msg.chat.id]
    var _require = helper.getRequirementText(msg, _AIRDROP_REQUIREMENTS[type], lang)


    _txt = _require.text_question
    //
    //
    // if (txt !== undefined && txt !== null) {
    //   _txt += txt
    // }

    var _markup = []

    if (_require.type_data === "survey") {
      var _responses = []
      for (var i = 0; i < _require.survey_responses.length; i++) {

        _responses.push({
          text: _airdrop[_require.survey_responses[i]],
          callback_data: 'SURVEY_' + _require.type + "_" + _require.survey_responses[i]
        })
      }
      _markup.push(_responses)
    } else {
      _markup.push([{
        text: _airdrop.btn_cancel,
        callback_data: 'SET AIRDROP INFO'
      }])
    }


    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _markup
      })

    };

    if (!_require.has_image) {

      bot.sendMessage(msg.chat.id, _txt, options);
    } else {
      var uri = __dirname + "/../img/" + _require.has_image


      bot.sendChatAction(msg.chat.id, "upload_photo")

      bot.sendMessage(msg.chat.id, _txt).then(function() {
        bot.sendPhoto(msg.chat.id, uri, options);
      })
    }
  })


}
module.exports.getLangMenu = function(msg, match) {

  console.log("_LANGS", _LANGS)
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({

      keyboard: _LANGS,
      resize_keyboard: true,
      one_time_keyboard: true
    })
  };

  bot.sendMessage(msg.chat.id, multilang.welcome_lang, options);




}

module.exports.getMoreTasks = function(msg, myUser) {
  var _submission = dico.getWordLang(myUser.lang, "submission", menu.getLangMenu)


  var _keyboard = helper_msg.getKeyboardButtons(msg, myUser.lang)
  var options_init = helper_msg.getKeyboardButtonsOptions(_keyboard)
  var _txt = _submission.msg_get_more_tasks

  bot.sendMessage(msg.chat.id, _txt, options_init)
}
module.exports.setSubmissionByDatas = function(msg, welcomingTxt, myUser, hideMessage) {

  if (helper.isPrivate(msg)) {


    try {



      var _rounds = dico.getWordLang(myUser.lang, "rounds", menu.getLangMenu)
      var _ico = dico.getWordLang(myUser.lang, "ico", menu.getLangMenu)
      var _airdrop = dico.getWordLang(myUser.lang, "airdrop", menu.getLangMenu)
      var _submission = dico.getWordLang(myUser.lang, "submission", menu.getLangMenu)
      var _others = dico.getWordLang(myUser.lang, "others", menu.getLangMenu)

      var _uround = _rounds[_AIRDROP_ROUND_SELECTED]





      // var _txt_1 = "<b>" + _submission.msg_welcome + "\n\n</b>"

      var _txt_1 = "<b>" + _others.hello;
      if (msg.chat.username !== undefined)
        _txt_1 += " " + msg.chat.username + "</b>,\n\n"
      else {
        _txt_1 += "</b>,\n\n"
      }


      if (welcomingTxt !== undefined && welcomingTxt !== null && welcomingTxt !== "")
        _txt_1 = welcomingTxt




      var _txt = ""
      console.log("AIRDROP STATUS", airdropStatus)
      if (airdropStatus) {


        var _tokens = 0

        for (i in _AIRDROP_REQUIREMENTS) {
          if (_AIRDROP_REQUIREMENTS[i].bounty) {
            _tokens += _AIRDROP_REQUIREMENTS[i].bounty_token_value
          }
        }

        var _coin = _AMOUNT_SUBSCRIBE + _tokens + _AMOUNT_ALL_TASKS_TOKENS
        var _dol = _coin * _CRYPTO_TOKEN_UNIT_VALUE_DOL


        _txt += _others.greetings + _uround.welcome_msg_1 + " " + _uround.welcome_msg_2




        if (_others.msg_earn !== "")
          _txt += _others.msg_earn + _AMOUNT_SUBSCRIBE + " " + _CRYPTO_TICKER + " (~" + _AMOUNT_SUBSCRIBE_DOLLAR + " " + _ICO_TOKEN_MONEY_SYMBOL + " )\n\n"


        //_txt += helper_msg.getReferralPhrase(msg, msg.chat.id, _REF_LIMIT, _AMOUNT_REF, _AMOUNT_REF_DOLLAR) + "\n\n"
        // _txt += "<b>" + _others.read_rules + "</b>" + "\n\n"
        // _txt += _submission.msg_edit + _AIRDROP_END_DATE + "!\n\n"

      } else if (!airdropStatus) {
        _txt += _others.greetings + "\n<b>" + _CRYPTO_NAME + _ico.end_airdrop_msg + "</b>\n" +
          _airdrop.msg_delivery + "\n"


      }



      var _info = ""


      var _markup = []
      var _hasFullfilledAllRequirements = true
      // console.log(datas)

      var _checkRequirementsMandatory = helper.checkRequirements(myUser, _AIRDROP_REQUIREMENTS)
      var _checkHasBounty = helper.checkHasBounty(myUser, _AIRDROP_REQUIREMENTS)
      console.log("_checkRequirementsMandatory", _checkRequirementsMandatory)

      var _isRequirementsDone = true;

      if (airdropStatus) {
        for (var i in _AIRDROP_REQUIREMENTS) {
          var _require = helper.getRequirementText(msg, _AIRDROP_REQUIREMENTS[i], myUser.lang)


          // if (_require.required && _require.btn_required) {


          var _tmpSuffix = ""
          var _tmpPrefix = ""
          var _isRequirementToDisplay = false
          if (_require.required && airdropStatus) {
            _isRequirementToDisplay = true
            // if( _require.bounty === false)
            // _tmpSuffix = " (Mandatory)"
          } else if (_require.bounty && _require.bounty_token_value !== 0 && _checkRequirementsMandatory) {
            _isRequirementToDisplay = true
            // _tmpSuffix = " (+" + _require.bounty_token_value + " " + _CRYPTO_TICKER + ")"
          } else if (_require.bounty && _require.bounty_token_value === 0) {
            _isRequirementToDisplay = true

          }

          if ((myUser['invalid'] !== undefined && myUser['invalid'] === true) || myUser.smileyCount > 2)
            _isRequirementToDisplay = false

          if (_require.bounty_token_value === 0 && _require.redirect_to) {
            _tmpPrefix = ""

          } else if (myUser !== null &&
            myUser[_require.type] !== undefined &&
            myUser[_require.type] !== null) {
            _tmpPrefix = "✅ "
            if (_require.type === "human_smiley" && _checkRequirementsMandatory)
              _isRequirementToDisplay = false
          } else {
            if (_require.type !== "claimallcompleted")
              _isRequirementsDone = false
            if (_require.type !== "INVITELINK")
              _tmpPrefix = "❌ "
          }

          if (_require.type === "LTOTrack")
            _tmpPrefix = ""
          // console.log(i,datas[_require.type] !== undefined,datas[_require.type] !== null)
          if (myUser !== null &&
            myUser[_require.type] !== undefined &&
            myUser[_require.type] !== null) {

            if (myUser.hasEnteredSomething === true)
              _info += helper_msg.getDataValidText(myUser, _require) + "\n"

            if (_require.redirect_to !== true && airdropStatus && _isRequirementToDisplay) {
              _markup.push([{
                text: _tmpPrefix + _require.btn_txt + _tmpSuffix,
                callback_data: "SET DATAS-" + _require.type
                // callback_data: _require.btn_callback
              }])
            } else if (_require.redirect_to && _isRequirementToDisplay) {
              _markup.push([{
                text: _tmpPrefix + _require.btn_txt + _tmpSuffix,
                url: _require.btn_url
              }])
            }



          } else {
            _hasFullfilledAllRequirements = false

            if (_require.redirect_to !== true && airdropStatus && _isRequirementToDisplay) {


              if (_require.type !== "INVITELINK" && myUser.hasEnteredSomething === true)
                _info += "🔸  " + _require.text_valid + "\n"
              _markup.push([{
                text: _tmpPrefix + _require.btn_txt + _tmpSuffix,
                callback_data: "SET DATAS-" + _require.type
                // callback_data: _require.redirect_to
              }])
            } else if (_require.redirect_to === true && _isRequirementToDisplay) {

              _markup.push([{
                text: _tmpPrefix + _require.btn_txt + _tmpSuffix,
                url: _require.btn_url
              }])
            }


          }
        }
        if (myUser["LTOArray"] !== undefined) {

          for (var l in myUser.LTOArray) {

            _markup.push([{
                text: myUser["LTOArray"][l],
                callback_data: "NADA"
              }, {
                text: '💰',
                callback_data: "GET LTO BALANCE-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              },
              {
                text: '➖',
                callback_data: "DELETE WALLET-" + l
                // url: 'https://explorer.lto.network/address/'+ myUser["LTO"]
              }



              // ,{
              //   text: '👨‍✈️Refresh Round ' + i,
              //   callback_data: 'REFRESH DASHBOARD_' + i
              // }
            ])
          }

        }

        // if(!_checkRequirementsMandatory && airdropStatus &&
        // !((myUser['invalid']!== undefined && myUser['invalid'] === true) || myUser.smileyCount>2 )){
        //   _markup.push([{
        //     text: _submission.msg_get_your_bonus,
        //     callback_data: "GET MORE TASKS"
        //   }])
        // }


        if (_info !== "") {
          _txt += "\n\n<b>" + _submission.msg_datas + "\n</b>" + _info
        } else {
          _txt += "\n<b>" + _submission.msg_datas_empty + "\n</b>"
        }


        if (!((myUser['invalid'] !== undefined && myUser['invalid'] === true) || myUser.smileyCount > 2)) {
          _txt += "\n" + helper_msg.getReferralPhrase(msg, msg.chat.id, _REF_LIMIT, _AMOUNT_REF, _AMOUNT_REF_DOLLAR, myUser.lang) + "\n"
          // _txt +=       helper_msg.getReferralPhrase(msg, msg.chat.id, _REF_LIMIT, _AMOUNT_REF, _AMOUNT_REF_DOLLAR) + "\n\n"

          _txt += "\n" + _submission.msg_helper + "\n"
        }


      }

      _markup.push([{
          text: '🚨 Lease with us',
          callback_data: 'GET LEASE INFO'
        }
        // ,{
        //   text: '👨‍✈️Refresh Round ' + i,
        //   callback_data: 'REFRESH DASHBOARD_' + i
        // }
      ])
      if (helper.isAdmin(msg)) {

        for (var i in _AIRDROP_ROUNDS) {

          var _row = _AIRDROP_ROUNDS[i]

          if (_row.status === true)
            _markup.push([{
                text: '👨‍✈️Dashboard Round ' + i,
                callback_data: 'GET DASHBOARD_' + i
              }
              // ,{
              //   text: '👨‍✈️Refresh Round ' + i,
              //   callback_data: 'REFRESH DASHBOARD_' + i
              // }
            ])


          _markup.push([{
            text: '👨‍✈️Dashboard ',
            callback_data: 'GET ADMIN DASHBOARD'
          }])
        }
      }

      var options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: _markup
        })

      };
      var _keyboard = helper_msg.getKeyboardButtons(msg, myUser.lang)
      var options_init = helper_msg.getKeyboardButtonsOptions(_keyboard)

      if ((myUser['invalid'] !== undefined && myUser['invalid'] === true) || myUser.smileyCount > 2) {
        _txt = _airdrop.thank_you_disqualified
        bot.sendMessage(msg.chat.id, _txt, options)
      } else {
        bot.sendMessage(msg.chat.id, _txt_1, options_init).then(function() {

          bot.sendMessage(msg.chat.id, _txt, options).then(function() {
            console.log("_isRequirementsDone", _isRequirementsDone)
            if (_checkRequirementsMandatory &&
              (myUser['invalid'] === undefined || myUser['invalid'] === false) &&
              (myUser['congratulate_mandatory'] === undefined || myUser['congratulate_mandatory'] === false)
            ) {
              _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, "congratulate_mandatory", true, true).then(function() {


                if (myUser.has_father !== undefined)
                  _TOKEN_REMAINING -= _AMOUNT_REF
                _TOKEN_REMAINING -= _AMOUNT_SUBSCRIBE
                exporting_v2.checkRemaining(_AIRDROP_ROUND)

                var _txt = _airdrop.thank_you + "\n" +
                  "\n" + helper_msg.getReferralPhrase(msg, msg.chat.id, _REF_LIMIT, _AMOUNT_REF, _AMOUNT_REF_DOLLAR, myUser.lang)
                // 👉 (Referral link here)
                //      });
                // bot.sendMessage(msg.chat.id,_txt)
              })

            } else
            if (_isRequirementsDone &&
              (myUser['invalid'] === undefined || myUser['invalid'] === false) &&
              (myUser['congratulate'] === undefined || myUser['congratulate'] === false)
            ) {
              _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, "congratulate", true, true).then(function() {


                var _txt = _airdrop.thank_you_all + "\n" +
                  "\n" + helper_msg.getReferralPhrase(msg, msg.chat.id, _REF_LIMIT, _AMOUNT_REF, _AMOUNT_REF_DOLLAR, myUser.lang)
                // 👉 (Referral link here)
                //      });
                // bot.sendMessage(msg.chat.id,_txt)
              })

            }



          });
        })
      }


    } catch (e) {
      console.log('err', e)
    }
    //     }
    //   ])
  }
}

module.exports.setAirdropInfo = function(msg, _txt, myUser) {
  // console.log("set Airdrop Info",myUser)
  // _db.set('users_participating_' + _AIRDROP_ROUND, msg.chat.id, null, {
  //   edit: true
  // },false)

  // usersFIFO[msg.chat.id].edit = true
  // var _myDatas = usersFIFO[msg.chat.id]

  menu.setSubmissionByDatas(msg, _txt, myUser, false)



}

var _getBalancesDatas = function(_row, msg, myUser, id) {

  return new Promise(function(resolve, reject) {
    var userid = msg.chat.id
    if (id !== undefined && id !== null)
      userid = id

    if (_row._ROUND === _AIRDROP_ROUND_SELECTED && userid === myUser.id) {
      resolve(myUser)
    } else {
      resolve(_db.get('users_participating_' + _row._ROUND, userid))
    }


  })
}

var _getBalanceByRound = function(msg, _row, count, id, myUser) {
  var _lang = myUser.lang
  var _balance = dico.getWordLang(_lang, "balance", menu.getLangMenu)

  return new Promise(function(resolve, reject) {



    _getBalancesDatas(_row, msg, myUser, id).then(function(snapshot) {

      var _referrals = 0

      var _myDatas = snapshot
      var _userAirdropStatus = _myDatas.airdrop_status

      _row = helper.setRowCalc(_row)
      if (_myDatas.referrals === undefined)
        _myDatas.referrals = []



      _referrals = _myDatas.referrals.length;

      var _tmp_status = {}
      _tmp_status["airdrop_status"] = true
      var _tmp_status2 = {}
      _tmp_status2["father"] = {
        $exists: true
      }
      var _tmp_status3 = {}
      console.log("_referrals", _referrals)
      _tmp_status3["_id"] = {
        $in: _myDatas.referrals
      }

      var _arrayQuery = []
      _arrayQuery.push(_tmp_status)
      _arrayQuery.push(_tmp_status2)
      _arrayQuery.push(_tmp_status3)

      //creation of Valid entries and Referral entries query
      for (var i in _row._AIRDROP_REQUIREMENTS) {
        if (_row._AIRDROP_REQUIREMENTS[i].required && !_row._AIRDROP_REQUIREMENTS[i].redirect_to) {
          var _tmp = {}
          _tmp[i] = {
            $exists: true
          }
          _arrayQuery.push(_tmp)
          //all valid query



        }


      }
      var _queryAllValid = {
        $and: _arrayQuery
      }
      console.log(JSON.stringify(_queryAllValid))
      _db.find("users_participating_" + _row._ROUND, _queryAllValid, {}, true).then(function(result) {
        console.log("RESULTS", result)


        var _calc = 0

        var amountIsAllDone = helper.isAllRequirementsDone(_myDatas, _row)
        console.log("AMOUNT", amountIsAllDone)

        var _txt = "<b>Round " + _row._ROUND + " " + _balance.msg_header_title + "</b>\n\n"







        // console.log(helper.checkRequirements(_myDatas, _row._AIRDROP_REQUIREMENTS),_userAirdropStatus)
        //console.log("_myDatas _row._ROUND - 1 ", _calc,_userAirdropStatus,helper.checkRequirements(_myDatas,_row._AIRDROP_REQUIREMENTS))
        var _total_bounty = helper.getBountyRequirements(_myDatas, _row._AIRDROP_REQUIREMENTS)
        var _total_registration = _row._AMOUNT_SUBSCRIBE
        var _total_referrals = result * _row._AMOUNT_REF
        if (!helper.checkRequirements(_myDatas, _row._AIRDROP_REQUIREMENTS) || !_userAirdropStatus) {
          _total_registration = 0
          _calc = 0
        } else {
          _calc = _total_registration + _total_referrals + _total_bounty
        }
        if (isNaN(_calc))
          _calc = 0

        _txt += _balance.msg_title_registration + "\n" +
          "+" + _total_registration + " " + _CRYPTO_TICKER + "\n"
        _txt += _balance.msg_title_bounties + "\n" +
          "+" + _total_bounty + " " + _CRYPTO_TICKER + "\n"
        if (myUser.advertising !== undefined && !isNaN(myUser.advertising)) {
          _txt += "🔸 You have an advertising bonus \n" +
            "+" + myUser.advertising + " " + _CRYPTO_TICKER + "\n";

          _calc += myUser.advertising
        }

        _txt += _balance.msg_title_referrals + "\n" +
          result + "/" + _myDatas.referrals.length + " " + _balance.msg_body_referrals + "\n" +
          "+" + result + " X " + _row._AMOUNT_REF + " = " + _total_referrals + " " + _CRYPTO_TICKER + "\n"
        _txt += "------------------\n"

        var _dol = Math.round(_calc * _ICO_TOKEN_UNIT_VALUE_DOL)
        _txt += "<b>= " + _calc + " " + _CRYPTO_TICKER + " (~" + _dol + _ICO_TOKEN_MONEY_SYMBOL + ") " + _balance.msg_calc_final + " Round " + _row._ROUND + "</b>\n     ▫️▫️▫️▫️▫️▫️ \n"

        //   "msg_header_title": "Balance Calculation",
        //   "msg_title_registration": "🔸For completing mandatory tasks",
        //   "msg_title_bounties": "🔸For completing optional tasks",
        //   "msg_title_referrals": "🔸For referring friends",
        //   "msg_body_referrals":"referred friends did complete mandatory tasks."
        //   "msg_calc_final":"earned in"
        // }

        // Round 1 Balance Calculation
        // 🔸For completing mandatory tasks
        // ➕35 Tokens
        //
        // 🔸For completing optional tasks
        // ➕25 Tokens
        //
        // 🔸For referring friends
        // 10/25 referred friends did complete mandatory tasks.
        // 10 x 2 GEX bonus =
        // ➕20 Tokens
        // ____________________________
        // = 80 GEX (~5$) earned in Round 1


        // if (helper.isWhitelisted(msg.chat.id, _row)) {
        //   _txt += _balance.msg_uncapped + "\n\n"
        // }
        // _txt += "<b>" + _balance.msg_balance_is + " " + _calc + " " + _CRYPTO_TICKER
        //
        // if (_balance.msg_tokens !== undefined && _balance.msg_tokens !== "")
        //   _txt += " " + _balance.msg_tokens
        //
        // if (_row._ROUND !== "")
        //   _txt += " " + _balance.msg_round + " " + _row._ROUND + "</b>\n"
        // else
        //   _txt += " " + _balance.msg_round + " 1</b>\n"
        //
        // // _txt += "\n"+_balance.msg_refer+" " + _row._AMOUNT_REF + " " + _CRYPTO_TICKER + " (~" + _row._AMOUNT_REF_DOLLAR + " " + _ICO_TOKEN_MONEY_SYMBOL + " ) \n" +
        // //   "\n";
        //
        //
        // if (_referrals === 0 ||  _referrals === 1)
        //   _txt += _balance.msg_refer_overview + " " + _referrals + " " + _balance.msg_friend + "\n";
        // else if (_referrals > 1)
        //   _txt += _balance.msg_refer_overview + " " + _referrals + " " + _balance.msg_friends + "\n";

        // _txt += "\n" + helper_msg.getReferralPhrase(msg,userid, _row._REF_LIMIT, _row._AMOUNT_REF, _row._AMOUNT_REF_DOLLAR)
        // var options = {
        //   parse_mode: "HTML",
        //   disable_web_page_preview: true,
        //   reply_markup: JSON.stringify({
        //     inline_keyboard: [
        //       // _menu
        //     ]
        //   })
        //
        // };
        // var _keyboard = helper_msg.getKeyboardButtons(msg)
        //
        // var options_keyboard = helper_msg.getKeyboardButtonsOptions(_keyboard)

        // setTimeout(function() {
        //   bot.sendMessage(msg.chat.id, _txt, options_keyboard);
        //
        // }, count * 500)

        resolve(_txt)

      })









    });

  })

}
module.exports.getAirdropBalance = function(msg, id, myUser) {
  var count = 0;
  var promises = []
  var returns_array = []
  for (var i in _AIRDROP_ROUNDS) {
    var _row = _AIRDROP_ROUNDS[i]

    if (_row.status === true) {


      promises.push(_getBalanceByRound(msg, _row, count, id, myUser))

      count++
    }

  }

  Promise.all(promises)
    .then(function(r) {
      var options = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            // _menu
          ]
        })

      };

      for (var i in r) {
        returns_array.push(r[i])
      }
      var _keyboard = helper_msg.getKeyboardButtons(msg, myUser.lang)

      var options_keyboard = helper_msg.getKeyboardButtonsOptions(_keyboard)
      var _ref = "\n" + helper_msg.getReferralPhrase(msg, msg.chat.id, _row._REF_LIMIT, _row._AMOUNT_REF, _row._AMOUNT_REF_DOLLAR, myUser.lang)
      // setTimeout(function() {
      bot.sendMessage(msg.chat.id, returns_array.join("\n") + _ref, options_keyboard);

      // }, count * 500)
    })
    .catch(console.error);


}
module.exports.addSon = function(father, son) {

  console.log("ADD SON", father, son)
  // console.log("get addson ",'users_participating_' + _AIRDROP_ROUND , father)
  _db.get('users_participating_' + _AIRDROP_ROUND, father).then(function(snapshot) {


    var _row = snapshot;


    if (_row !== null) {
      if (_row.referrals === undefined) {
        _row.referrals = []
        _row.referrals.push(son)
        _db.set('users_participating_' + _AIRDROP_ROUND, father, 'referrals', _row.referrals, false)
      } else {
        var _exists = false;
        // for (var i = 0; i < _row.referrals.length; i++) {
        //   if (_row.referrals[i] === son)
        //     _exists = true;
        // }

        if (!_row.referrals.includes(son)) {

          _row.referrals.push(son)
          _db.set('users_participating_' + _AIRDROP_ROUND, father, 'referrals', _row.referrals, false)
        }


      }
    }
  })


}


module.exports.getAirdropRules = function(msg, lang) {

  var _balance = dico.getWordLang(lang, "balance", menu.getLangMenu)
  var _rounds = dico.getWordLang(lang, "rounds", menu.getLangMenu)
  var _rules = dico.getWordLang(lang, "rules", menu.getLangMenu)
  var _ico = dico.getWordLang(lang, "ico", menu.getLangMenu)

  var _txt = "<b>" + _rules.title + " </b>\n\n"

  var _keyboard = helper_msg.getKeyboardButtons(msg, lang)

  var options_keyboard = helper_msg.getKeyboardButtonsOptions(_keyboard)

  _txt += "<b>" + _rules.requested.title + "</b>\n" +
    _rules.requested.msg_social_medias + "\n";

  for (var i in _rounds[_AIRDROP_ROUND_SELECTED].actions) {
    var _row = _rounds[_AIRDROP_ROUND_SELECTED].actions[i];

    if (_row.text_rule !== undefined && _row.text_rule !== "") {
      _txt += _row.text_rule + "\n"
    }
  }


  _txt += _rules.requested.msg_stay + " (" + _ICO_END_DATE + ") \n" +
    "\n";

  _txt += "<b>" + _rules.prohibited.title + "</b>\n" +
    _rules.prohibited.msg_text +
    "\n";

  _txt += "<b>" + _rules.close.title + "</b>\n" +
    _rules.close.msg_text_date + " " + _AIRDROP_ROUNDS[_AIRDROP_ROUND_SELECTED]._AIRDROP_END_DATE + "\n" +
    _rules.close.msg_text + "\n";


  var _token = ""
  if (_balance.msg_tokens !== undefined && _balance.msg_tokens !== "")
    _token = " " + _balance.msg_tokens

  _txt += "<b>" + _rules.referrals.title + "</b>\n" +
    _rules.referrals.msg_referrals_every + " " + _AMOUNT_REF + " " + _CRYPTO_TICKER + _token + "\n";

  if (_REF_LIMIT > 0)
    _txt += "- " + _REF_LIMIT + " " + _rules.referrals.msg_referrals_max + "\n";

  _txt += _rules.referrals.msg_referrals_valid + "\n";

  if (_rules.other !== undefined) {
    _txt += "<b>" + _rules.other.title + "</b>\n" +
      _rules.other.msg_text + "\n"
  }

  _txt += "\n" +
    _rules.rights.msg_text + "\n";






  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        // _menu
      ]
    })

  };
  bot.sendMessage(msg.chat.id, _txt, options_keyboard)



}




module.exports.getIcoInfo = function(msg, lang) {

  var _ico = dico.getWordLang(lang, "ico", menu.getLangMenu)
  var _txt = _ico.msg_info_short + "\n\n"

  var _keyboard = helper_msg.getKeyboardButtons(msg, lang)

  var options_keyboard = helper_msg.getKeyboardButtonsOptions(_keyboard)

  // _txt +=     "▶️ Join "+ _CRYPTO_NAME +" investment : "+_CRYPTO_LINKS.ico+"\n\n"+

  _txt += "<b>" + _ico.msg_docs + "</b>\n"
  for (var i = 0; i < _ico.infos.docs.length; i++) {


    if (_CRYPTO_LINKS[_ico.infos.docs[i]] !== undefined && _CRYPTO_LINKS[_ico.infos.docs[i]] !== null) {
      _txt += _ico["msg_" + _ico.infos.docs[i]] + " " + _CRYPTO_LINKS[_ico.infos.docs[i]] + "\n";
    }


  }
  _txt += "\n<b>" + _ico.msg_social + "</b>\n"
  for (var i = 0; i < _ico.infos.social.length; i++) {


    if (_CRYPTO_LINKS[_ico.infos.social[i]] !== undefined && _CRYPTO_LINKS[_ico.infos.social[i]] !== null) {
      _txt += _ico["msg_" + _ico.infos.social[i]] + " " + _CRYPTO_LINKS[_ico.infos.social[i]] + "\n";
    }


  }
  // if (_CRYPTO_PARTNERS.length > 0) {
  //   _txt += "\n<b>" + _ico.msg_partners + "</b>\n"
  //
  //   for (var i in _CRYPTO_PARTNERS) {
  //
  //     _txt += "▶️ " + _CRYPTO_PARTNERS[i].name + ": " + _CRYPTO_PARTNERS[i].link + "\n"
  //
  //   }
  // }

  if (_CRYPTO_LINKS.reviews.length > 0) {
    _txt += "\n<b>" + _ico.msg_reviews + "</b>\n"



    for (var i in _CRYPTO_LINKS.reviews) {
      if (_CRYPTO_LINKS.reviews[i].score !== undefined && _CRYPTO_LINKS.reviews[i].score !== "")
        _txt += "▶️ " + _CRYPTO_LINKS.reviews[i].name + " ( " + _CRYPTO_LINKS.reviews[i].score + " ): " + _CRYPTO_LINKS.reviews[i].link + "\n"
      else {
        _txt += "▶️ " + _CRYPTO_LINKS.reviews[i].name + ": " + _CRYPTO_LINKS.reviews[i].link + "\n"
      }
    }

  }
  if (_GET_WHITELISTED_LINK !== "" && _GET_WHITELISTED.length > 0) {
    _txt += "\n<b>" + _ico.msg_get_whitelisted + "</b>" + _GET_WHITELISTED_LINK + "\n"



    for (var i in _GET_WHITELISTED) {
      _txt += "▶️ " + _GET_WHITELISTED[i].name + ": " + _GET_WHITELISTED[i].link + "\n"

    }

  }

  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        //  _menu
      ]
    })

  };

  bot.sendMessage(msg.chat.id, _txt, options_keyboard)

}


// setTimeout(function() {
//   _db.find("users_participating_1", {
//     LTO: {
//       $exists: true
//     }
//   }, {}, false).then(function(r) {
//     for (var i in r) {
//       _db.set('users_participating_' + _AIRDROP_ROUND, r[i]._id, null, {
//         // edit: false,
//         LTOArray: [r[i].LTO]
//       }, false)
//     }
//   })
// })