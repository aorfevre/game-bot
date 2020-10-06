var _db = require('../database/mongo_db.js')


var _cat = [{
    name: '🌐 Article',
    cat: 'PR'
  },
  {
    name: '🦆 Meme',
    cat: 'MEME'
  },
  {

    cat: 'BREAK'
  },
  {
    name: '📺 Video',
    cat: 'VIDEO'
  },
  {
    name: '💯 Infographic',
    cat: 'GRAPHIC'
  },
  {
    name: '😘 Other',
    cat: 'OTHER'
  }
]


module.exports.getContestInfo = function(msg) {

  var _txt = "<b>Fantom to the moon contest 🚀</b>\n" +
    "Create content about Fantom and win 100k FTM in prizes!\n" +
    "\n" +
    "Read all the rules here: https://docs.google.com/document/d/1QbTGWD3lMPFJFocYPENS9Bo-dhGskLqB_Rm12quTwTI/edit \n" +
    "\n" +
    "If you're not a content creator, you can still win by referring your friends!\n"



  var _markup = []

  _markup.push([{
    text: '📝 Submit entry 🚀',
    callback_data: 'SUBMIT CONTEST ENTRY'
  }])
  _markup.push([{
      text: '🎉 Invite your friends',
      callback_data: 'GET CONTEST REFERRAL'
    },
    {
      text: '🚨 Rules',
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

  bot.sendMessage(msg.chat.id, "For the complete rules of the contest, take a look at our blog post\nhttps://medium.com/@ablock.io", options)
}
module.exports.getContestSubmitMenu = function(msg) {
  var _markup = []


  var arr = []
  for (var i in _cat) {
    if (_cat[i].cat === 'BREAK') {
      _markup.push(arr)
      arr = []
    }
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
  bot.sendMessage(msg.chat.id, "What kind of content did you make?", options)
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
  _txt += "\n1. <b>Paste the link to your Tweet</b>\n" +
    "And remember, you can partecipate multiple times!"
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
  bot.sendMessage(msg.chat.id, "Share the link below with your friends, if they win, you win!\n" +
    "https://t.me/ablock_bot?start=" + msg.chat.id, options)
}