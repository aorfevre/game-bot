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


  // helper.getAllDatasNetwork().then((response) => {
  //
  //   fget.setDataByCollection("metrics_ablock_opera", "general", response)
  // })

  // helper.getNode21Info().then((response) => {
  //   console.log("getNode21Info", response)
  //   fget.setDataByCollection("metrics_ablock_opera", "21", response)
  // })

  _promises.push(prepareAVAXDatasMetrics())
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


  // helper.getAllDatasNetwork().then((response) => {
  //
  //   fget.setDataByCollection("metrics_ablock_opera", "general", response)
  // })

  // helper.getNode21Info().then((response) => {
  //   console.log("getNode21Info", response)
  //   fget.setDataByCollection("metrics_ablock_opera", "21", response)
  // })

  _promises.push(prepareAVAXDatasMetrics())
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

}, 1000)
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
          console.log('resolve lto', {
            type: 'lto',
            roi: roi,
            total: res[0].totalLeased,
            amount: res[0].totalLeased * count[0].value,
            stakers: res[0].leaser_unpaid.length

          })
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
            url: 'https://xapi4.fantom.network/api',
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
            console.log("err", error)
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

              if (outputRes !== undefined && outputRes !== null && response.body.data !== undefined) {
                resolve({
                  type: 'ftm',
                  total: outputRes.totalStakedAmount,
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


setTimeout(() => {
  var headersOpt = {
    // "content-type": "application/json",
  };


  request({
      method: 'post',
      url: 'http://3.133.220.103:9650/ext/P',
      body: {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "platform.getCurrentValidators",
        "params": {

        }
      },
      headers: headersOpt,
      json: true,
    },
    (error, response, body) => {

      for (var i in response.body.result.validators) {
        if (response.body.result.validators[i].nodeID === 'NodeID-EkvXF2Sxi5XcHnscti1kYzdVCUA3WhdFW') {
          console.log(response.body.result.validators[i])
        }
      }
    })
})

var prepareAVAXDatasMetrics = function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://3.133.220.103:9650/ext/P',
        body: {
          "jsonrpc": "2.0",
          "id": 3,
          "method": "platform.getCurrentValidators",
          "params": {

          }
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        _db.find("pricingAVAX", {}, {}, false).then((count) => {

          var data = []
          var amount = 0
          for (var i in response.body.result.validators) {

            if (response.body.result.validators[i].nodeID === 'NodeID-EkvXF2Sxi5XcHnscti1kYzdVCUA3WhdFW') {
              console.log('response.body.result.validators[i', response.body.result.validators[i])
              console.log(Math.floor(Date.now() / 1000), Number(response.body.result.validators[i].startTime), Number(response.body.result.validators[i].endTime), "/", Math.floor(Date.now() / 1000) > Number(response.body.result.validators[i].startTime), Math.floor(Date.now() / 1000) < Number(response.body.result.validators[i].endTime))

              data.push(response.body.result.validators[i])
              // console.log('Date.now() - vali', Math.floor(Date.now() / 1000), Number(response.body.result.validators[i].startTime))
              if (Math.floor(Date.now() / 1000) > Number(response.body.result.validators[i].startTime) &&
                Math.floor(Date.now() / 1000) < Number(response.body.result.validators[i].endTime)
              ) {

                amount += Number(response.body.result.validators[i].stakeAmount)
              }


              // console.log('response.body.result', response.body.result.delegators)
              for (var j in response.body.result.validators[i].delegators) {
                // console.log('response.body.result.delegators[i', response.body.result.delegators[i])


                if (Math.floor(Date.now() / 1000) > Number(response.body.result.validators[i].delegators[j].startTime) &&
                  Math.floor(Date.now() / 1000) < Number(response.body.result.validators[i].delegators[j].endTime)
                ) {

                  amount += Number(response.body.result.validators[i].delegators[j].stakeAmount)
                }

              }


            }
          }

          var r = {
            type: 'avax',
            stakers: data.length,

            amount: amount * count[0].value / 1000000000,
            total: amount
          }
          _db.set('nodeAVAX', 'avax', null, {
            type: 'avax',
            stakers: data,

            amount: amount * count[0].value / 1000000000,

            total: amount
          }, true).then(() => {
            console.log('r', r)
            fget.setDataByCollection("metrics_avax", "general", r)
            resolve(r)
          })
        })

      })
  })

}