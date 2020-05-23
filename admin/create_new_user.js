var helper = require('../admin/helper.js')
var _db = require('../database/mongo_db.js')

module.exports.createNewUser = function(msg, match) {

  return new Promise(function(resolve, reject) {


    var resp = ""
    if (match !== null !== undefined && match !== null)
      resp = match.input.slice(7, match.input.length).trim()

    // console.log("MATCH",resp,resp.length)
    var _username = msg.chat.username
    if (_username === undefined || _username === null)
      _username = "N/A"


    var _tmp = {
      "id": msg.chat.id,
      "username": _username,
      "airdrop_status": true,
      "has_father": true
    }

    _tmp.lang = "EN"

    if (resp.length > 7) {
      // add a father
      _tmp.father = resp

    } else {}



    _db.set('users_participating', msg.chat.id, null, _tmp, true).then(function(snapshotFather) {


      if (resp.length > 7) {
        // add a father
        _tmp.father = resp
        menu.addSon(resp, msg.chat.id)
      } else {}


      _db.set('users', msg.chat.id, null, msg.chat, false)

      resolve(snapshotFather)

    })

  })
}