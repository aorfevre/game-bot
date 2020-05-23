var helper = require('../admin/helper.js')

var ux = require('../admin/ux.js')

var _db = require('../database/mongo_db.js')
var human = this;

var _CHANCE_USER = 3
module.exports.setHumanControlSmiley = function(msg, myUser) {
  if (myUser.smileyCount === undefined)
    myUser.smileyCount = _CHANCE_USER



  console.log("_chancesLeft", myUser.smileyCount)
  if (myUser.smileyCount > 0) {
    var _array = ["☂️", "🐸", "🐶", "🐝", "🦋", "🌈", "🍣", "🎖", "🚗", "💎", "🚀", "👽"]
    var _final = []
    var _tmpFinal = []
    var _tmpArr = []



    for (var i = 0; i < 9; i++) {
      var _rdm = helper.getRandomNumber(0, _array.length - 1);

      _tmpArr.push({
        text: _array[_rdm],
        callback_data: "CHECK HUMAN CONTROL SMILEY_" + _array[_rdm]
      })
      _tmpFinal.push(_array[_rdm])
      if ((i + 1) % 3 === 0) {
        _final.push(_tmpArr)
        _tmpArr = []
      }
      _array.splice(_rdm, 1)
    }
    var _rdm = helper.getRandomNumber(0, _tmpFinal.length - 1);
    //
    // usersFIFO[msg.chat.id].human_response = _tmpFinal[_rdm]


    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: JSON.stringify({
        inline_keyboard: _final
      })

    };

    _db.set('users_participating', msg.chat.id, "human_response", _tmpFinal[_rdm], false)
      .then(() => {


        bot.sendMessage(msg.chat.id, "<b>Are you really human ?</b>\n" +
          "Prove it by clicking the correct button:" + _tmpFinal[_rdm], options)

      })
  } else {
    var image = __dirname + "/../img/crossmark.gif"
    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      caption: "You are a robot.\nContact an admin on @ablockio"


    };
    bot.sendDocument(msg.chat.id, image, options)
  }

}

module.exports.checkHumanControlSmiley = function(msg, smiley, human_response, myUser) {
  if (myUser.smileyCount === undefined)
    myUser.smileyCount = _CHANCE_USER


  if (myUser.smileyCount > 0) {


    if (smiley === human_response) {





      var image = __dirname + "/../img/checkmark.gif"
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendDocument(msg.chat.id, image).then(() => {
        _db.set('users_participating', msg.chat.id, "human_smiley", "approved", true).then(() => {
          ux.showWelcomeMessage(msg, myUser)
        })
      })

    } else {
      myUser.smileyCount--

      var _chanceText = "You have " + myUser.smileyCount + " chances left"

      if (myUser.smileyCount === 0)
        _chanceText = "You are a robot.\nContact an admin on @ablockio"

      if (myUser.smileyCount > 0) {

        _db.set('users_participating', msg.chat.id, "smileyCount", myUser.smileyCount, true).then(() => {
          var image = __dirname + "/../img/wronganswer.gif"
          var options = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            caption: _chanceText


          };
          bot.deleteMessage(msg.chat.id, msg.message_id);
          bot.sendDocument(msg.chat.id, image, options).then(() => {
            human.setHumanControlSmiley(msg, myUser)
          })
        })
      } else {
        _db.set('users_participating', msg.chat.id, "smileyCount", myUser.smileyCount, true).then(() => {
          _db.set('users_participating', msg.chat.id, "invalid", true, true).then(() => {
            var image = __dirname + "/../img/crossmark.gif"
            var options = {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              caption: _chanceText


            };
            bot.deleteMessage(msg.chat.id, msg.message_id);
            bot.sendDocument(msg.chat.id, image, options).then(() => {
              // ux.showWelcomeMessage(msg, _chanceText, "human_smiley", "Invalidxx@", false, myUser)

            })


          })
        })
      }



    }
  } else {
    bot.deleteMessage(msg.chat.id, msg.message_id);
  }



}