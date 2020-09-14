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

var _everyday = schedule.scheduleJob(rulePricing, () => {
  var _promises = []



  helper.getAllDatasNetwork().then((response) => {

    fget.setDataByCollection("metrics_ablock_opera", "general", response)
  })

  helper.getNode21Info().then((response) => {
    console.log("getNode21Info", response)
    fget.setDataByCollection("metrics_ablock_opera", "21", response)
  })

  _promises.push(prepareLTODatasMetrics())
  _promises.push(prepareFTMDatasMetrics())

  Promise.all(_promises).then(r => {

    let all = {
      amount: 0,
      stakers: 0

    }
    console.log('r', r)
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
    console.log('all', all)

    fget.setDataByCollection("metrics_ablock_public", "all", all)
  })

})

setTimeout(() => {
  var _promises = []

  _promises.push(prepareLTODatasMetrics())
  _promises.push(prepareFTMDatasMetrics())


  helper.getAllDatasNetwork().then((response) => {
    console.log('getAllDatasNetwork response', response)
    if (response !== null)
      fget.setDataByCollection("metrics_ablock_opera", "general", response)
  })

  helper.getNode21Info().then((response) => {
    console.log("getNode21Info", response)
    fget.setDataByCollection("metrics_ablock_opera", "21", response)
  })

  Promise.all(_promises).then(r => {
    console.log('promise all', r)
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
    console.log('post final', all)

    fget.setDataByCollection("metrics_ablock_public", "all", all)
  })
})
var prepareLTODatasMetrics = function() {

  return new Promise(function(resolve, reject) {
    console.log('start lto')
    _db.find("pricingLTO", {}, {}, false).then((count) => {
      console.log('count pricing', count)
      _dblto.find('charts', {
        _id: 'roi'
      }, {}, false).then((roi) => {
        console.log('charts', roi)
        _dblto.find('leasing_metrics', {

        }, {}, false).then((res) => {
          console.log('resolve lto')
          resolve({
            type: 'lto',
            roi: roi,
            total: res[0].totalLeased,
            amount: res[0].totalLeased * count[0].value,
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
        // console.log(res[0]['20'])
        // console.log("Total amount FTM USD", res[0]);

        var headersOpt = {
          "content-type": "application/json",
        };

        request({
            method: 'post',
            url: 'https://xapi2.fantom.network/api',
            body: {
              "operationName": "DelegationList",
              "variables": {
                "staker": "0x15",
                "cursor": null,
                "count": 40
              },
              "query": "query DelegationList($staker: Long!, $cursor: Cursor, $count: Int!) {\n  delegationsOf(staker: $staker, cursor: $cursor, count: $count) {\n    totalCount\n    pageInfo {\n      first\n      last\n      hasNext\n      hasPrevious\n      __typename\n    }\n    edges {\n      cursor\n      delegation {\n        address\n        amount\n        createdEpoch\n        createdTime\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
            },
            headers: headersOpt,
            json: true,
          },
          (error, response, body) => {
            if (!error) {
              // console.log("Total Stakers FTM ", parseInt(response.body.data.delegationsOf.totalCount, 16));
              // console.log(response.body.data)
              outputRes = null
              for (var i in res[0]) {
                if (res[0][i].website === 'https://ablock.io/') {
                  outputRes = res[0][i]
                }
              }

              console.log('response.body.data FTM', outputRes, response.body.data)

              if (outputRes !== undefined && outputRes !== null) {
                resolve({
                  type: 'ftm',
                  amount: outputRes.totalStakedAmount * count[0].value,
                  stakers: parseInt(response.body.data.delegationsOf.totalCount, 16)

                })
              } else {
                resolve({
                  type: 'ftm',
                  amount: 0,
                  stakers: 0

                })
              }

            }
          })
      });
    });


  })

}