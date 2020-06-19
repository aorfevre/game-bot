const request = require('request');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJldnA3eVJha2h5ZDRlZ2VhRnIzRm9TZlNkTE8yIiwiaWF0IjoxNTkyMzg0MjIyLCJpc3MiOiJTdGFraW5ncmV3YXJkcyBQdWJsaWMgQVBJIn0.g8O3AuqUCkWfWygubM1vVaX57dSrfrOGDquYm5iuXac'
const url = 'https://api-beta.stakingrewards.com'

global.assets = []

prepareAssets = function() {
  const options = {
    url: url + '/v1/list/assets',
    headers: {
      'Authorization': key
    }
  };


  request(options, function(error, response, body) {
    if (error === null) {
      const info = JSON.parse(body);
      // console.log(info)
      assets = info
    }
  });
}
prepareAssets()


bot.onText(/^\/[sS]taking(.+|\b)/, (msg, match) => {
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

        console.log("asset", asset)
        var _txt =
          "<b>" + asset.name + '(' + asset.symbol + ') </b>- ' + info.algorithmType + '\n\n' +
          "Reward: " + info.reward.toFixed(2) + "%\n" +
          "Adj. Reward: " + info.adjReward.toFixed(2) + "%\n" +
          "Reward 24h change: " + info.reward24hChange.toFixed(2) + "%\n" +
          "Reward 30d change: " + info.reward30dChange.toFixed(2) + "%\n" +
          "Total Staked: " + info.totalStaked.toFixed(2) + "%" +
          "\n\nSource <a href='https://www.stakingrewards.com/asset/" + asset.slug + "'>stakingrewards.com/assets/" + asset.slug + "</a> \nCooked with ❤️ by <a href='https://ablock.io'>ablock.io</a>\n"

        bot.sendMessage(msg.chat.id, _txt, options)
      }
    });
  }
}
// prepareAssets()