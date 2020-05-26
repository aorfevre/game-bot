var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var schedule = require('node-schedule');


var rulePricing = new schedule.RecurrenceRule();
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