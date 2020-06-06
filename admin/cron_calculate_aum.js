var _db = require('../database/mongo_db.js')
var _dbftm = require('../database/mongo_db_ftm.js')
var _dblto = require('../database/mongo_db_lto.js')
var helper = require('../admin/helper.js')
var schedule = require('node-schedule');
var fget = require('../firebaseadmin/get.js')



var request = require('request');

var rulePricing = new schedule.RecurrenceRule();
rulePricing.hour = [0]
rulePricing.minute = [0]
rulePricing.second = [0]


setTimeout(() => {

})
var _everyday = schedule.scheduleJob(rulePricing, () => {
  var _promises = []

  _promises.push(prepareLTODatasMetrics())
  _promises.push(prepareFTMDatasMetrics())


  helper.getAllDatasNetwork().then((response) => {

    fget.setDataByCollection("metrics_ablock_opera", "general", response)
  })

  helper.getNode21Info().then((response) => {

    fget.setDataByCollection("metrics_ablock_opera", "21", response)
  })

  Promise.all(_promises).then(r => {

    let all = {
      amount: 0,
      stakers: 0

    }

    for (var i in r) {
      if (r[i].type === 'lto') {
        fget.setDataByCollection("metrics_ablock_lto", "general", {
          total: r[i].total,
          roi: r[i].roi[0].roi.yearly
        })
      }
      all.amount += r[i].amount
      all.stakers += r[i].stakers
    }


    fget.setDataByCollection("metrics_ablock_public", "all", all)
  })

})

var prepareLTODatasMetrics = function() {

  return new Promise(function(resolve, reject) {

    _db.find("pricingLTO", {}, {}, false).then((count) => {
      _dblto.find('charts', {
        _id: 'roi'
      }, {}, false).then((roi) => {

        _dblto.find('leasing_metrics', {

        }, {}, false).then((res) => {

          resolve({
            type: 'lto',
            roi: roi,
            total: res[0].totalLeased,
            amount: res[0].totalLeased * count[0].value / Math.pow(10, 8),
            stakers: res[0].leaser_unpaid.length

          })

        })
      })

    })

  })

}
var prepareFTMDatasMetrics = function() {

  return new Promise(function(resolve, reject) {


    _db.find("pricingFTM", {}, {}, false).then((count) => {
      console.log("ftm", count[0].value)

      _dbftm.find('validators', {

      }, {}, false).then((res) => {
        console.log(res[0]['20'])
        console.log("Total amount FTM USD", res[0]['20'].totalStakedAmount * count[0].value);

        var headersOpt = {
          "content-type": "application/json",
        };

        request({
            method: 'post',
            url: 'https://xapi1.fantom.network/api',
            body: {
              "operationName": "DelegationList",
              "variables": {
                "staker": "0x15",
                "cursor": null,
                "count": 40
              },
              "query": "query DelegationList($staker: Long!, $cursor: Cursor, $count: Int!) {\n  delegationsOf(staker: $staker, cursor: $cursor, count: $count) {\n    totalCount\n    pageInfo {\n      first\n      last\n      hasNext\n      hasPrevious\n      __typename\n    }\n    edges {\n      cursor\n      delegator {\n        address\n        amount\n        createdEpoch\n        createdTime\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
            },
            headers: headersOpt,
            json: true,
          },
          (error, response, body) => {
            if (!error) {
              console.log("Total Stakers FTM ", parseInt(response.body.data.delegationsOf.totalCount, 16));

              resolve({
                type: 'ftm',
                amount: res[0]['20'].totalStakedAmount * count[0].value,
                stakers: parseInt(response.body.data.delegationsOf.totalCount, 16)

              })
            }
          })
      });
    });


  })

}