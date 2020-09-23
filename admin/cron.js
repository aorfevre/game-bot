var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var admin_board = require('../admin/admin_board.js')
var schedule = require('node-schedule');

var lto = require('../chains/lto.js')
var ftm = require('../chains/ftm.js')

var request = require('request');

// curl - d 'id=9&name=baeldung' https: //graphql.avascan.info

// curl -X POST -H "Content-Type: application/json" --data '@./testCurl.json' https://graphql.avascan.info
var getAVAXTx = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      "content-type": "application/json"
    };

    request({
        method: 'post',
        url: 'https://graphql.avascan.info/',
        body: {
          ooperationName: null,
          query: "{↵  blockchains {↵    count↵  }↵}↵",
          variables: {}
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {
        console.log('response', response.body)
        resolve(response)

      })
  })

}
getAVAXTx()

var onceAday = new schedule.RecurrenceRule();
onceAday.hour = [0]
onceAday.minute = [5]
onceAday.second = [0]
var _everyday = schedule.scheduleJob(onceAday, () => {
  admin_board.getGroups()
})
// setTimeout(function() {
//   // admin_board.getGroups()
//   admin_board.getGroupsName()
//
//
//
// })





var rulePricing = new schedule.RecurrenceRule();

rulePricing.second = [0]


helper.getPrice('avalanche', 'USD').then((response) => {

  var _datas = {
    unit: 'USD',
    amount: 1,
    value: response
  }

  _db.set('pricingAVAX', 'avax', null, _datas, true).then(() => {

  })


})
var _everyday = schedule.scheduleJob(rulePricing, () => {

  helper.getPrice('fantom', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }

    _db.set('pricingFTM', 'ftm', null, _datas, true).then(() => {

    })


  })

  helper.getPrice('lto-network', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }
    _db.set('pricingLTO', 'lto', null, _datas, true).then(() => {

    })


  })
  helper.getPrice('harmony', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }
    _db.set('pricingONE', 'one', null, _datas, true).then(() => {

    })


  })





})



var rulePricingPart2 = new schedule.RecurrenceRule();
rulePricingPart2.minute = [0]
rulePricingPart2.second = [0]

var _everyday = schedule.scheduleJob(rulePricingPart2, () => {



  helper.getPrice('tezos', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }
    _db.set('pricingXTZ', 'xtz', null, _datas, true).then(() => {

    })


  })
  helper.getPrice('tomochain', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }
    _db.set('pricingTOMO', 'tomo', null, _datas, true).then(() => {

    })


  })


  helper.getPrice('cosmos', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }
    _db.set('pricingCOSMOS', 'atom', null, _datas, true).then(() => {

    })


  })


  helper.getPrice('elrond', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response
    }

    _db.set('pricingERD', 'erd', null, _datas, true).then(() => {

    })


  })



})


var checkTx = new schedule.RecurrenceRule();
checkTx.second = [0]

//
// setTimeout(() => {
//   // ftm.checkNotificationTx()
//   helper.getPrice('ATOM', 'USD').then((response) => {
//
//     var _datas = {
//       unit: 'USD',
//       amount: 1,
//       value: response
//     }
//     _db.set('pricingCOSMOS', 'one', null, _datas, true).then(() => {
//
//     })
//
//
//   })
// })
setTimeout(() => {
  // ftm.checkNotificationTx()
})
var _checkTx = schedule.scheduleJob(checkTx, () => {
  lto.checkNotificationTx()
  ftm.checkNotificationTx()

})