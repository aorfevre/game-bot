const request = require('request');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJldnA3eVJha2h5ZDRlZ2VhRnIzRm9TZlNkTE8yIiwiaWF0IjoxNTkyMzg0MjIyLCJpc3MiOiJTdGFraW5ncmV3YXJkcyBQdWJsaWMgQVBJIn0.g8O3AuqUCkWfWygubM1vVaX57dSrfrOGDquYm5iuXac'
const url = 'https://api-beta.stakingrewards.com'

let price = require('crypto-price')
var helper = require('../admin/helper.js');

var _db = require('../database/mongo_db.js')
global.assets = []

prepareAssets = function() {
  const options = {
    url: url + '/v1/list/assets',
    headers: {
      'Authorization': key
    }
  };


  request(options, (error, response, body) => {
    if (error === null) {
      const info = JSON.parse(body);
      // console.log(info)
      assets = info

      // console.log(assets)
      // for (var i in assets) {
      //   getPriceCrypto(assets[i].symbol)
      //
      // }
      // setTimeout(() => {
      //   console.log(countArray, countArray.length)
      // }, 5000)
    }
  });
}
prepareAssets()

// count = 0
// countArray = []
getPriceCrypto = function(symbol) {
  return new Promise((resolve, reject) => {
    price.getCryptoPrice('USD', symbol).then(obj => { // Base for ex - USD, Crypto for ex - ETH
      console.log("START", symbol, obj)
      var digits = 0;
      obj.price = Number(obj.price)
      if (obj.price > 1)
        digits = 2
      else if (obj.price < 1 && obj.price >= 0.1)
        digits = 2
      else if (obj.price <= 0.1 && obj.price > 0.01)
        digits = 3
      else if (obj.price <= 0.01 && obj.price > 0.001)
        digits = 4
      else if (obj.price <= 0.001 && obj.price > 0.0001)
        digits = 5
      else if (obj.price <= 0.0001 && obj.price > 0.0001)
        digits = 6
      else if (obj.price <= 0.00001 && obj.price > 0.00001)
        digits = 7

      console.log("Before resolve", helper.numberWithCommas(obj.price, digits))
      resolve(helper.numberWithCommas(obj.price, digits))
      // if (obj === undefined || obj.price === undefined) console.log(symbol, obj.price)
    }).catch(err => {
      // count++
      console.log("ELSE")
      resolve(null)
      // countArray.push(symbol)
      // console.log(symbol, )
    })
  })
}
kpiAddOneCall = function(id) {
  console.log("split[1].symbol", id)
  _db.find("kpi-call-sr", {
    _id: id
  }, {}, false).then((results) => {

    if (results.length === 0) {

      _db.set('kpi-call-sr', id, null, {
        count: 1
      }, true)
    } else {
      _db.set('kpi-call-sr', id, null, {
        count: results[0].count + 1
      }, true)
    }
  })
}


bot.onText(/^\/[sS]taking(.+|\b)/, (msg, match) => {


  console.log("TRACKING INFO,", msg)
  stakingInfo(msg, match)
})
bot.onText(/^\/[sS]r(.+|\b)/, (msg, match) => {



  stakingInfo(msg, match)
})

stakingInfo = function(msg, match) {

  var split = msg.text.split(' ');

  //TODO PUT SOME ANTI SPAM CONTROLS
  if (split.length === 1) {
    bot.sendMessage(msg.chat.id, "You need to send an asset with a symbol");
  } else if (split.length > 2) {
    bot.sendMessage(msg.chat.id, "You can send only one symbol at a time");
  } else {
    _db.set('users', msg.chat.id, null, msg, true).then(() => {
      kpiAddOneCall(split[1].toLowerCase())
    })
    var asset = null
    for (var i in assets) {
      // console.log(assets[i])
      if (assets[i].symbol.toLowerCase() === split[1].toLowerCase() ||
        assets[i].slug.toLowerCase() === split[1].toLowerCase() ||
        assets[i].name.toLowerCase() === split[1].toLowerCase()
      ) {
        asset = assets[i]
      }
    }
    if (asset === null) {
      bot.sendMessage(msg.chat.id, "No asset found for that symbol");
      return;
    }

    const options = {
      url: url + '/v1/assets/overview/' + asset.slug,
      headers: {
        'Authorization': key
      }
    };


    request(options, function(error, response, body) {
      if (error === null) {
        const info = JSON.parse(body);
        console.log(info)
        var options = {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          // reply_markup: JSON.stringify({
          //   inline_keyboard: _markup
          // })

        };

        getPriceCrypto(asset.symbol).then((p) => {
          console.log("Pricing", p)
          var price = ''
          if (p !== null) {
            price = "$" + p
          }
          console.log("price", price)
          var _txt =
            "<b>" + asset.name + ' - ' + asset.symbol + '</b> - ' + info.algorithmType + '\n\n' +
            "Reward: " + info.reward.toFixed(2) + "%\n" +
            "Adj. Reward: " + info.adjReward.toFixed(2) + "%\n" +
            "Reward 24h change: " + ((info.reward24hChange.toFixed(2) > 0) ? '+' + info.reward24hChange.toFixed(2) : info.reward24hChange.toFixed(2)) + "%\n" +
            "Reward 30d change: " + ((info.reward30dChange.toFixed(2) > 0) ? '+' + info.reward30dChange.toFixed(2) : info.reward30dChange.toFixed(2)) + "%\n" +
            "Total Staked: " + info.totalStaked.toFixed(2) + "%\n"
          if (p !== null)
            _txt += "Price: " + price + "\n"

          _txt +=
            "\n🌟 stakingrewards.com/asset/" + asset.slug + " \n❤️ ablock.io\n"

          bot.sendMessage(msg.chat.id, _txt, options)
        })
      }
    });
  }
}
// prepareAssets()