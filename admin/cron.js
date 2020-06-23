var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var admin_board = require('../admin/admin_board.js')
var schedule = require('node-schedule');

var lto = require('../chains/lto.js')
var ftm = require('../chains/ftm.js')

var onceAday = new schedule.RecurrenceRule();
onceAday.hour = [0]
onceAday.minute = [5]
onceAday.second = [0]
var _everyday = schedule.scheduleJob(onceAday, () => {
  admin_board.getGroups()
})
setTimeout(function() {
  admin_board.getGroups()
  // admin_board.getGroupsName()



})
var rulePricing = new schedule.RecurrenceRule();
rulePricing.minute = [30]
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
  helper.getPrice('ONE', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }
    _db.set('pricingONE', 'one', null, _datas, true).then(() => {

    })


  })





})



var rulePricingPart2 = new schedule.RecurrenceRule();
rulePricingPart2.minute = [15]
rulePricingPart2.second = [0]

var _everyday = schedule.scheduleJob(rulePricingPart2, () => {



  helper.getPrice('XTZ', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }
    _db.set('pricingXTZ', 'one', null, _datas, true).then(() => {

    })


  })
  helper.getPrice('TOMO', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }
    _db.set('pricingTOMO', 'one', null, _datas, true).then(() => {

    })


  })


  helper.getPrice('ATOM', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }
    _db.set('pricingCOSMOS', 'one', null, _datas, true).then(() => {

    })


  })


  helper.getPrice('ERD', 'USD').then((response) => {

    var _datas = {
      unit: 'USD',
      amount: 1,
      value: response.data.quote['USD'].price
    }

    _db.set('pricingERD', 'ftm', null, _datas, true).then(() => {

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
//       value: response.data.quote['USD'].price
//     }
//     _db.set('pricingCOSMOS', 'one', null, _datas, true).then(() => {
//
//     })
//
//
//   })
// })

var _checkTx = schedule.scheduleJob(checkTx, () => {
  lto.checkNotificationTx()
  ftm.checkNotificationTx()

})