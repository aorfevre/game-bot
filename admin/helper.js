var helper = this

var _db = require('../database/mongo_db.js')
var createUser = require('../admin/create_new_user.js')
var ux = require('../admin/ux.js')

var _countUsersLoop = 0
module.exports.numberWithCommas = function(x) {
  console.log('x', x)
  return x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

global.CMC_TOKEN = '8743aa92-f9a0-4677-9c21-4c06d358c5f7'
module.exports.getPrice = function(token, convert) {
  const rp = require('request-promise');
  const requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/tools/price-conversion',
    qs: {
      'symbol': token,
      'amount': '1',
      'convert': convert
    },
    headers: {
      'X-CMC_PRO_API_KEY': CMC_TOKEN
    },
    json: true,
    gzip: true
  };

  return (rp(requestOptions))

}
module.exports.getUser = function(msg, match) {

  return new Promise((resolve, reject) => {



    if (helper.isPrivate(msg)) {
      var start = new Date()
      _db.get('users_participating', msg.chat.id).then((myUser) => {
        var end = new Date()

        if (myUser !== undefined) {

          resolve(myUser)
        } else {
          _countUsersLoop++

          resolve(createUser.createNewUser(msg, match))
        }


      })

    }
  })
}


global.myAdmins = ["aorfevrebr", "airdropfrenchie"]
module.exports.isAdmin = function(msg) {

  return _isAdmin(msg, myAdmins)

}
var _isAdmin = function(msg, array) {
  for (var i = 0; i < array.length; i++) {

    if ((msg.chat !== undefined && (array[i] === msg.chat.id || array[i] === msg.chat.username)) ||
      (msg.from !== undefined && array[i] === msg.from.username))
      return true;
  }
  return false;
}

module.exports.isPrivate = function(msg) {

  return msg.chat.type === "private"

}






var timevar = [];

module.exports.checkSpam = function(_userid) {
  var isOk = true;
  var diff = 0;

  if (timevar[_userid] != undefined) {
    diff = new Date() / 1000 - timevar[_userid];

    if (diff < 1) {

      //bot.sendMessage(_userid,"Keep cool ;)")
      isOk = false;
    }
  }
  timevar[_userid] = new Date() / 1000;

  return isOk;
}

module.exports.getRandomNumber = function(min, max) {

  return Math.floor(Math.random() * (max - min + 1) + min);

}




module.exports.sendMessageAfterSubmit = function(msg, _txtText, type, val, dbUpdate, myUserDb) {

  var _tmp = {
    // edit: true,
    type: false
  }
  _tmp[type] = val


  if (type === "LTOWallets") {
    val = val.toLowerCase()
    if (myUserDb.LTOWallets === undefined)
      myUserDb.LTOWallets = []
    if (!myUserDb.LTOWallets.includes(val) && helper.validateLTONoPromise(val)) {
      myUserDb.LTOWallets.push(val)
      _tmp.LTOWallets = myUserDb.LTOWallets
    }

  }
  if (type === "FTMWallets") {
    val = val.toLowerCase()
    if (myUserDb.FTMWallets === undefined)
      myUserDb.FTMWallets = []
    if (!myUserDb.FTMWallets.includes(val) && helper.validateERC20NoPromise(val)) {
      myUserDb.FTMWallets.push(val)
      _tmp.FTMWallets = myUserDb.FTMWallets
    }

  }
  if (type === "ONEWallets") {
    val = val.toLowerCase()

    if (myUserDb.ONEWallets === undefined)
      myUserDb.ONEWallets = []

    console.log('ONEWallets', myUserDb)
    if (!myUserDb.ONEWallets.includes(val) && helper.noCheckNoPromise(val)) {
      myUserDb.ONEWallets.push(val)
      _tmp.ONEWallets = myUserDb.ONEWallets
    }

  }

  if (type === "TOMOWallets") {
    val = val.toLowerCase()

    if (myUserDb.TOMOWallets === undefined)
      myUserDb.TOMOWallets = []


    if (!myUserDb.TOMOWallets.includes(val) && helper.noCheckNoPromise(val)) {
      myUserDb.TOMOWallets.push(val)
      _tmp.TOMOWallets = myUserDb.TOMOWallets
    }

  }


  if (type === "XTZWallets") {

    if (myUserDb.XTZWallets === undefined)
      myUserDb.XTZWallets = []

    console.log('XTZWallets', myUserDb)
    if (!myUserDb.XTZWallets.includes(val) && helper.noCheckNoPromise(val)) {
      myUserDb.XTZWallets.push(val)
      _tmp.XTZWallets = myUserDb.XTZWallets
    }

  }

  var optionsText = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (dbUpdate !== undefined && dbUpdate === true) {
    _tmp["hasEnteredSomething"] = true
    _db.set('users_participating', msg.chat.id, null, _tmp, true).then(function(myUser) {
      var _require = REQUIREMENTS[type]

      // if (_require.bounty && !_require.required && _require.bounty_token_value > 0)
      //   _TOKEN_REMAINING -= _require.bounty_token_value

      // exporting_v2.checkRemaining(_AIRDROP_ROUND)


      ux.showWelcomeMessage(msg, myUser)
      // menu.setSubmissionByDatas(msg, _txtText, myUser, false)
    })
  } else {
    ux.showWelcomeMessage(msg, myUser)
    // menu.setSubmissionByDatas(msg, _txtText, myUserDb, false)
  }



}

module.exports.checkDuplicateEntry = function(msg, type) {
  return new Promise(function(resolve, reject) {



    var _query = []
    var _tmp = {}
    _tmp[type] = msg.text
    _query.push(_tmp)
    var _tmp2 = {}
    _tmp2._id = {
      $ne: msg.chat.id
    }
    _query.push(_tmp2)
    var _queryALL = {
      $and: _query
    }
    _db.find("users_participating", _queryALL, {}, true).then(function(result) {
      //return false if there is not duplicate entries
      //return true if there is a duplicate entry
      if (result === 0)
        resolve(false)
      else
        resolve(true)
    })

  })
}


module.exports.validateLTONoPromise = function(val) {

  return (/^(3J){1}[0-9a-zA-Z]{33}$/i.test(val));

}
module.exports.validateERC20NoPromise = function(val) {

  return (/^(0x){1}[0-9a-zA-Z]{40}$/i.test(val));

}
module.exports.noCheckNoPromise = function(val) {

  return true;

}
module.exports.validateLTO = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(/^(3J){1}[0-9a-zA-Z]{33}$/i.test(msg.text));
  })
}
module.exports.validateERC20 = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(/^(0x){1}[0-9a-zA-Z]{40}$/i.test(msg.text));
  })
}
module.exports.noCheck = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(true);
  })
}