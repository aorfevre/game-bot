var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var massMessages = this

var _LIMIT_MESSAGE_SEC = 25
var _LIMIT_TIME_MS = 1000
global._DIRECT_MESSAGE = "vote_01"
var _LIMIT_MESSAGES_SESSION = 5000
var _WAIT_BEFORE_NEXT_SESSION = 12 * 60 * 60 * 1000


module.exports.init = function() {


  bot.onText(/^\/[mM]assMessages/, (msg, match, _specMessage) => {


    var _txt =
      "Hello! \n\n"

    massMessages.sendMessage(msg, _txt, _DIRECT_MESSAGE)
  })
}

setTimeout(function() {
  _db.get("bulk_messages", 1).then(function(r) {


    if (r !== undefined && r.start !== undefined && r.start !== false) {
      _db.get('bulkMessages', "").then(function(snapshot) {

        for (var i in snapshot.list) {
          if (r.start.indexOf(snapshot.list[i].timestamp) !== -1) {
            var msg = {
              chat: {
                username: "aorfevrebr",
                id: 359774701
              }
            }
            console.log(r.start, snapshot.list[i].val)
            bot.sendMessage(msg.chat.id, "Auto restart bulk message")
            massMessages.sendMessage(msg, snapshot.list[i].val, r.start)
          }
        }

      })
    }

  })
}, 2000)

module.exports.sendMessage = function(msg, _txt, message_id) {


  // { $and: [{"direct_message": {$ne: "vote_01"}}] }


  //bot.sendMessage(msg.chat.id, _txt, options)

  var _count = 0;
  // console.log(helper.isAdmin(msg),_txt,message_id)
  if (helper.isAdmin(msg)) {
    //if(false){

    var _limit = 0

    $or: [{
        "direct_message": {
          $exists: false
        }
      },
      {
        "direct_message": {
          $ne: message_id
        }
      }
    ]
  }

  _db.find("users_participating", {
    $or: [{
        "direct_message": {
          $exists: false
        }
      },
      {
        "direct_message": {
          $ne: message_id
        }
      }
    ]
  }, {
    "_id": 1
    // "notification":1
  }, false).then(function(result) {

    var _count = 0
    // console.log(result)
    _db.set("bulk_messages", 1, "start", message_id, false)

    // var intervalMessages = setInterval(() => {
    // console.log("result",result.length)
    _sendMassMessages(msg, result, _count, _txt, message_id)
    // .then(function(r){
    //   result = r
    // })
    // }, _LIMIT_TIME_MS);

  })

}


var _sendMassMessages = function(msg, result, _count, _txt, message_id) {


  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  if (result.length === 0) {
    bot.sendMessage(msg.chat.id, "Finish sending bulk").then(function() {
      bot.sendMessage(359774701, "Finish sending bulk")
      _db.set("bulk_messages", 1, "start", false, false)
    })
    return
  }
  // else{
  //   bot.sendMessage(359774701,"New Loop started " + new Date() + "\nTotal messages remaining: " +result.length )
  // }





  var _promises = []
  result.splice(0, _LIMIT_MESSAGE_SEC).forEach((val) => {


    if (val !== undefined) {
      _count++
      if (val.notification !== undefined && (val.notification === false || val.notification === "false")) {
        _promises.push(_db.set("users_participating", Number(val._id), "direct_message", message_id, false).then(function() {

        }))
      } else {
        _promises.push(_db.set("users_participating", Number(val._id), "direct_message", message_id, false).then(function() {

          bot.sendMessage(Number(val._id), _txt, options)



          // console.log("SENDED",Number(val._id),_count)
        }))
      }

    }





  })
  Promise.all(_promises).then(function() {
    if (_count % 1000 === 0)
      console.log("Already sended ", _count)


    if (_count % _LIMIT_MESSAGES_SESSION === 0) {
      console.log("Finished sending ", _count)
      bot.sendMessage(359774701, "Finish sending " + _LIMIT_MESSAGES_SESSION).then(function() {

      })

    } else {
      setTimeout(function() {

        _sendMassMessages(msg, result, _count, _txt, message_id)
      }, _LIMIT_TIME_MS)
    }
  })

  // })
}