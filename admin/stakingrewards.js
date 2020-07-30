const request = require('request');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJldnA3eVJha2h5ZDRlZ2VhRnIzRm9TZlNkTE8yIiwiaWF0IjoxNTkyMzg0MjIyLCJpc3MiOiJTdGFraW5ncmV3YXJkcyBQdWJsaWMgQVBJIn0.g8O3AuqUCkWfWygubM1vVaX57dSrfrOGDquYm5iuXac'
const url = 'https://api-beta.stakingrewards.com'

let price = require('crypto-price')
var helper = require('../admin/helper.js');

const fs = require('fs');

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
      //   getPriceCrypto(assets[i].symbol
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
getPriceCrypto = function(symbol, msg) {
  return new Promise((resolve, reject) => {
    if (msg === undefined || msg.chat === undefined)
      resolve()
    else {


      price.getCryptoPrice('USD', symbol).then(obj => { // Base for ex - USD, Crypto for ex - ETH

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

        resolve(helper.numberWithCommas(obj.price, digits))
        // if (obj === undefined || obj.price === undefined) console.log(symbol, obj.price)
      }).catch(err => {
        // count++
        resolve(null)
        // countArray.push(symbol)
        // console.log(symbol, )
      })
    }
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

bot.onText(/^\/[aA]ssets(.+|\b)/, (msg, match) => {

  var _txt = ""
  _promises = []
  var options = {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    // reply_markup: JSON.stringify({
    //   inline_keyboard: _markup
    // })

  };

  var count = 0
  console.log("all assets,", assets.length)
  _txt += "<b>🌟Stakingrewards assets</b>\n\n"
  for (var i in assets) {
    console.log("all assets,", assets[i].slug)
    _txt += "<a href='stakingrewards.com/asset/" + assets[i].slug + "'>" + assets[i].name + "</a>, "
    count++

    if (count % 90 === 0) {
      _promises.push(bot.sendMessage(msg.chat.id, _txt, options))
      _txt = ''
    }
  }


  Promise.all(_promises).then(r => {
    _txt += "\n\nUse command /staking [name] or /staking [symbol] or /staking [slug] to get reward information of your favorite network."
    bot.sendMessage(msg.chat.id, _txt, options)
  })
  // stakingInfo(msg, match)
})
bot.onText(/^\/[sS]taking(.+|\b)/, (msg, match) => {


  console.log("TRACKING INFO,", msg)
  stakingInfo(msg, match)
})
bot.onText(/^\/[sS]r(.+|\b)/, (msg, match) => {


  console.log("TRACKING INFO,", msg)
  stakingInfo(msg, match)
})
// setTimeout(() => {
//   // console.log(assets)
//   var promises = []
//   var count = 0
//   for (var i in assets) {
//     var msg = {
//       text: '/staking ' + assets[i].slug
//     }
//     //
//     // if (assets[i].name.toLowerCase() === 'tezos' ||
//     //   assets[i].name.toLowerCase() === 'cosmos' ||
//     //   assets[i].name.toLowerCase() === 'elrond') {
//     count++
//     promises.push(stakingInfo(msg, null, count))
//     // }
//
//   }
//   Promise.all(promises).then((r) => {
//     fs.writeFileSync("./json/stakingrewards.json", JSON.stringify(r, null, 4));
//
//   })
// }, 1000)
stakingInfo = function(msg, match, waitPeriod) {
  return new Promise((resolve, reject) => {
    var wait = 0
    if (waitPeriod !== undefined) {
      wait = 2000 * waitPeriod
    }
    setTimeout(() => {


      var split = msg.text.split(' ');

      //TODO PUT SOME ANTI SPAM CONTROLS
      if (split.length === 1 && msg.chat !== undefined) {
        bot.sendMessage(msg.chat.id, "You need to send an asset with a symbol like '/staking lto'");
      } else if (split.length > 2 && msg.chat !== undefined) {
        bot.sendMessage(msg.chat.id, "You can send only one symbol at a time");
      } else {
        if (msg.chat !== undefined)
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

        if (asset === null && msg.chat !== undefined) {
          bot.sendMessage(msg.chat.id, "No asset found for that symbol. Use command /assets to see all networks supported");
          return;
        }

        const options = {
          url: url + '/v1/assets/overview/' + asset.slug,
          headers: {
            'Authorization': key
          }
        };

        // console.log("options", options)

        request(options, function(error, response, body) {
          if (error === null) {
            const info = JSON.parse(body);
            console.log("Responsee", info)
            var options = {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              // reply_markup: JSON.stringify({
              //   inline_keyboard: _markup
              // })

            };

            getPriceCrypto(asset.symbol, msg).then((p) => {
              var price = ''
              if (p !== null && msg.chat !== undefined) {
                price = "$" + p
              }
              console.log('test', info)
              var _txt =
                "<b>" + asset.name + ' - ' + asset.symbol + '</b> - ' + info.algorithmType + '\n\n' +
                "Reward: " + info.reward.toFixed(2) + "%\n" +
                "Adj. Reward: " + info.adjReward.toFixed(2) + "%\n" +
                "Reward 24h change: " + ((info.reward24hChange.toFixed(2) > 0) ? '+' + info.reward24hChange.toFixed(2) : info.reward24hChange.toFixed(2)) + "%\n" +
                "Reward 30d change: " + ((info.reward30dChange.toFixed(2) > 0) ? '+' + info.reward30dChange.toFixed(2) : info.reward30dChange.toFixed(2)) + "%\n" +
                "Total Staked: " + info.totalStaked.toFixed(2) + "%\n"
              if (p !== null && msg.chat !== undefined)
                _txt += "Price: " + price + "\n"

              _txt +=
                "\n🌟 stakingrewards.com/asset/" + asset.slug + " \n❤️ ablock.io\n"

              if (msg.chat !== undefined) {
                bot.sendMessage(msg.chat.id, _txt, options).then(() => {
                  resolve({
                    asset: asset,
                    price: price,
                    info: info
                  })
                })
              } else {
                resolve({
                  asset: asset,
                  price: price,
                  info: info
                })
              }

            })
          }
        });
      }
    }, wait)
  })
}
// prepareAssets()