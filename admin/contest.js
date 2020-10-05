var _db = require('../database/mongo_db.js')


var _cat = [{
    name: 'Meme',
    cat: 'MEME'
  },
  {
    name: 'Vidéo',
    cat: 'VIDEO'
  },
  {
    name: 'Article',
    cat: 'PR'
  }, {
    name: 'Dev',
    cat: 'DEV'
  }
]

module.exports.getContestInfo = function(msg) {

  var _txt = "100 000 FTM context by ablock\n" +
    "bla bla.... "
  "Refer your friend and get rewarded if they win a prize"
  var _markup = []

  _markup.push([{
    text: 'Submit entry',
    callback_data: 'SUBMIT CONTEST ENTRY'
  }])
  _markup.push([{
      text: 'Invite your friend',
      callback_data: 'GET CONTEST REFERRAL'
    },
    {
      text: 'Rules',
      callback_data: 'GET CONTEST RULES'
    }

  ])
  _markup.push([{
    text: 'Home 🏡',
    callback_data: 'GO HOME'
  }])
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };

  bot.sendMessage(msg.chat.id, _txt, options)
}

module.exports.getContestRules = function(msg) {
  var _markup = []
  _markup.push([{
    text: "Contest 🔥",
    callback_data: "GET CONTEST INFO"
  }, {
    text: 'Home 🏡',
    callback_data: 'GO HOME'
  }])
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };

  bot.sendMessage(msg.chat.id, "Contest Rules ", options)
}
module.exports.getContestSubmitMenu = function(msg) {
  var _markup = []


  var arr = []
  for (var i in _cat) {
    arr.push({
      text: _cat[i].name,
      callback_data: "SET CONTEST CAT_" + _cat[i].cat
    })
  }
  _markup.push(arr)

  _markup.push([{
    text: "Contest 🔥",
    callback_data: "GET CONTEST INFO"
  }, {
    text: 'Home 🏡',
    callback_data: 'GO HOME'
  }])
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };
  bot.sendMessage(msg.chat.id, "Select the category of your submission", options)
}


module.exports.setCatSubmit = function(msg, cat) {
  var _txt = ''
  var myCat = ''
  for (var i in _cat) {
    if (cat === _cat[i].cat) {
      myCat = _cat[i]
      _txt += "Category selected: " + myCat.name

    }
  }
  _txt += "\nEnter your twitter contest entry"

  _db.set('users_participating', msg.chat.id, "type", "CONTEST_" + myCat.cat, true)


  var _markup = []

  _markup.push([{
    text: "❌ Cancel",
    callback_data: 'SET WELCOME INFO'
  }])

  _markup.push([{
    text: "Contest 🔥",
    callback_data: "GET CONTEST INFO"
  }, {
    text: 'Home 🏡',
    callback_data: 'GO HOME'
  }])
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };
  bot.sendMessage(msg.chat.id, _txt, options)
}
module.exports.getContestReferralLink = function(msg) {

  var _markup = []

  _markup.push([{
    text: "Contest 🔥",
    callback_data: "GET CONTEST INFO"
  }, {
    text: 'Home 🏡',
    callback_data: 'GO HOME'
  }])
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: _markup
    })

  };
  bot.sendMessage(msg.chat.id, "Invite your friends and get rewarded if they win a prize.\n\nYour referral link is " +
    "https://t.me/ablock_bot?start=" + msg.chat.id, options)
}