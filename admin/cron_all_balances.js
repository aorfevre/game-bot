var _db = require('../database/mongo_db.js')
var helper = require('../admin/helper.js')
var schedule = require('node-schedule');
var moment = require('moment');
var ux = require('../admin/ux.js')


var ruleDaily = new schedule.RecurrenceRule();
ruleDaily.minute = [0]
ruleDaily.second = [0]

var _everyday = schedule.scheduleJob(ruleDaily, () => {
  dailyFunction()

})


var ruleWeek = new schedule.RecurrenceRule();
// ruleWeek.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
ruleWeek.dayOfWeek = [1];

ruleWeek.minute = 0;
ruleWeek.second = 0;

var _everyweek = schedule.scheduleJob(ruleWeek, function() {
  weeklyFunction()
})




var ruleMonth = new schedule.RecurrenceRule();
ruleMonth.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
ruleMonth.date = 1;
ruleMonth.minute = 0;
ruleMonth.second = 0;

var _everyweek = schedule.scheduleJob(ruleMonth, function() {
  monthFunction()
})


notifyUser = function(i, user) {

  wait = 0;
  if (i % 29 === 0) {
    console.log("29th", i / 29)
    wait = 1000 * i / 29
  };

  setTimeout(() => {
    var _msg = {
      chat: {
        id: user._id
      }
    }
    // console.log(_msg)
    ux.getAllMyBallances(_msg, user)
  }, wait)
}

dailyFunction = function() {

  _db.find('users_participating', {
    $and: [{
        human_smiley: 'approved'
      },
      {
        $and: [{
          notifyDaily: {
            $exists: true
          }
        }, {
          notifyDaily: true
        }]
      }
    ]

  }, {}, false).then((r) => {
    evaluateIfNotifyUsers(r)

  })
}

weeklyFunction = function() {

  _db.find('users_participating', {
    $and: [{
        human_smiley: 'approved'
      },
      {
        $or: [{
          notifyWeekly: {
            $exists: false
          }
        }, {
          notifyWeekly: true
        }]
      }
    ]

  }, {}, false).then((r) => {
    evaluateIfNotifyUsers(r)

  })
}

monthlyFunction = function() {

  _db.find('users_participating', {
    $and: [{
        human_smiley: 'approved'
      },
      {
        $and: [{
          notifyMonth: {
            $exists: true
          }
        }, {
          notifyMonth: true
        }]
      }
    ]

  }, {}, false).then((r) => {
    evaluateIfNotifyUsers(r)

  })
}
evaluateIfNotifyUsers = function(r) {
  var arrayToNotify = [];
  for (var i in r) {
    if (r[i].notifyHour === undefined) {
      r[i].notifyHour = 12
    }

    if (r[i].notifyHour === moment().hours()) {
      var _founded = false;
      for (var j in REQUIREMENTS) {
        // console.log("--", REQUIREMENTS[j])
        if (r[i].settings[REQUIREMENTS[j].type] === true &&
          r[i][REQUIREMENTS[j].type] !== undefined &&
          r[i][REQUIREMENTS[j].type].length > 0) {

          _founded = true
        }
      }
      if (_founded)
        arrayToNotify.push(r[i])
    }

  }

  for (var i in arrayToNotify) {
    notifyUser(i, arrayToNotify[i])
  }
  // console.log(arrayToNotify.length, moment().hours(), moment())

}

setTimeout(() => {
  // dailyFunction()
})