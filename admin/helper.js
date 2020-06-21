var helper = this

var _db = require('../database/mongo_db.js')
var createUser = require('../admin/create_new_user.js')
var ux = require('../admin/ux.js')

var _countUsersLoop = 0
module.exports.numberWithCommas = function(x, digits) {

  if (digits === undefined || digits === null)
    digits = 2;


  var res = x.toFixed(digits)

  var split = res.split('.')

  return split[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + split[1];
}


module.exports.getAllDatasNetwork = function() {
  var http = require('http'),
    url = require('url'),
    request = require('request');

  return new Promise(function(resolve, reject) {
    request("https://fantomstaker.info/api/v1/general", (err, res, body) => {

      resolve(JSON.parse(res.body))

    })
  })

}


module.exports.getNode21Info = function() {
  var http = require('http'),
    url = require('url'),
    request = require('request');

  return new Promise(function(resolve, reject) {
    request("https://fantomstaker.info/api/v1/validators?hideUnknown=false", (err, res, body) => {
      var response = JSON.parse(res.body);

      for (var i in response) {
        if (response[i].website === "https://ablock.io/")
          resolve(response[i])
      }
      resolve(null)

    })
  })

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



    _db.set('users', msg.chat.id, null, msg, true)

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


global.myAdmins = ["aorfevrebr", "solutionniste", 'theotherpomp', 'blokcove']
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



  for (var i in REQUIREMENTS) {

    if (REQUIREMENTS[i].type === type) {


      if (REQUIREMENTS[i].isLowerCase === true)
        val = val.toLowerCase()


      if (myUserDb[REQUIREMENTS[i].type] === undefined || typeof myUserDb[REQUIREMENTS[i].type] !== 'object')
        myUserDb[REQUIREMENTS[i].type] = []

      if (!myUserDb[REQUIREMENTS[i].type].includes(val) && REQUIREMENTS[i].checkNoPromise(val)) {

        myUserDb[REQUIREMENTS[i].type].push(val)

        _tmp[REQUIREMENTS[i].type] = myUserDb[REQUIREMENTS[i].type]
      }


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


      ux.showWelcomeMessage(msg, myUserDb)
      // menu.setSubmissionByDatas(msg, _txtText, myUser, false)
    })
  } else {
    ux.showWelcomeMessage(msg, myUserDb)
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
module.exports.checkNoPromise = function(val) {

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

module.exports.validateXTZ = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(/^(tz1){1}[0-9a-zA-Z]{33}$/i.test(msg.text));
  })
}
module.exports.validateONE = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(/^(one1){1}[0-9a-zA-Z]{38}$/i.test(msg.text));
  })
}

module.exports.validateCOSMOS = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(/^(cosmos1){1}[0-9a-zA-Z]{38}$/i.test(msg.text));
  })
}
module.exports.noCheck = function(msg) {
  return new Promise(function(resolve, reject) {
    resolve(true);
  })
}