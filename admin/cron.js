var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var schedule = require('node-schedule');


var rulePricing = new schedule.RecurrenceRule();
rulePricing.hour = [0, 3, 6, 9, 12, 15, 18, 21]
rulePricing.minute = [0]
rulePricing.second = [0]

var _everyday = schedule.scheduleJob(rulePricing, () => {

  helper.getPrice('FTM', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }

    _db.set('pricingFTM', 'ftm', null, _datas, true).then(() => {

    })


  })

  helper.getPrice('LTO', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }
    _db.set('pricingLTO', 'lto', null, _datas, true).then(() => {

    })


  })

})


var checkTx = new schedule.RecurrenceRule();
checkTx.second = [0]


setTimeout(() => {
  _db.find('notifyTxLTO', {
    notified: false
  }, {}, false).then((r) => {
    var options = {
      parse_mode: "HTML",
      disable_web_page_preview: true,


    };
    _db.find("pricingLTO", {

    }, {}, false).then((count) => {
      // for each tx
      for (var i in r) {

        // for each user receiving the notification

        for (var j in r[i]) {

          if (j !== '_id' && j !== 'notified' && j !== 'masstx' && j !== 'cancel' && j !== 'origin') {
            var tx = r[i][j]
            if (tx.type === 4) {
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW TRANSFER</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + tx.sender + "</a>\n" +
                "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n" +
                "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)
            } else if (tx.type === 8) {
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW LEASE</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + tx.sender + "'>" + tx.sender + "</a>\n" +
                "To: <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n" +
                "Amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)
            } else if (r[i].masstx !== undefined && r[i].masstx.type === 11) {


              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + tx.id + "'>NEW MASS TRANSFER </a>\n\n" +
                "From <a href='https://explorer.lto.network/addresses/" + r[i].masstx.sender + "'>" + r[i].masstx.sender + "</a>\n" +
                "To <a href='https://explorer.lto.network/addresses/" + tx.recipient + "'>" + tx.recipient + "</a>\n\n" +
                r[i].masstx.transferCount + " transfers totalizing " + helper.numberWithCommas(r[i].masstx.totalAmount / 100000000) + " LTO ($" + helper.numberWithCommas(count[0].value * r[i].masstx.totalAmount / 100000000) + ")\n" +

                "Your wallet transferred amount: <b>" + helper.numberWithCommas(tx.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * tx.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)



            } else if (r[i][j].cancel !== undefined && r[i][j].cancel.type === 9) {
              console.log("'cancel'")
              var _txt = "🚨 <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.id + "'>NEW LEASE CANCEL</a>\n" +
                "From <a href='https://explorer.lto.network/addresses/" + r[i][j].cancel.sender + "'>" + r[i][j].cancel.sender + "</a>\n" +

                "Lease id : <a href='https://explorer.lto.network/transactions/" + r[i][j].cancel.leaseId + "'>" + r[i][j].cancel.leaseId + "</a>\n" +
                "Cancelled leased amount :<b>" + helper.numberWithCommas(r[i][j].original.amount / 100000000) + "</b> LTO ($" + helper.numberWithCommas(count[0].value * r[i][j].original.amount / 100000000) + ")\n"

              bot.sendMessage(Number(j), _txt, options)


            }


          }

        }

        _db.set('notifyTxLTO', r[i]._id, "notified", true, true)

      }
    })
  })
})

var _checkTx = schedule.scheduleJob(checkTx, () => {


})