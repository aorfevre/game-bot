var mongojs = require('mongojs')


global._mdbftm;

module.exports.init = function() {

  return new Promise(function(resolve, reject) {
    var url = "ablock:5L3gXqPkLrwRrgVyvJqN7jJdA@localhost:27017/OperaNetwork?authSource=admin";

    if (isDev)
      url = "ablock:5L3gXqPkLrwRrgVyvJqN7jJdA@3.12.222.35:27017/OperaNetwork?authSource=admin";



    _mdbftm = mongojs(url, ['users', "airdrop", "metrics"], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 90000,
      keepAlive: true,
      socketTimeoutMS: 9000000
    })

    //
    // _mdbftm["users_participating_1"].getIndexes(function(r){
    //   console.log("INDEX",r)
    //   if(r===null){
    //     _mdbftm["users_participating_1"].createIndex({ airdrop_status: true })
    //     console.log("create")
    //   }
    // })

    resolve()

  })


}


module.exports.get = function(query, key) {
  console.log("GET", query, key)

  var _this = this
  var _query = query
  // console.log("GET here;", _query, key)

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {


      var _query = {}
      if (key !== null) {
        _query = {
          _id: (key)
        }
      }
      // console.log("FIND ",query,key,_query)

      _mdbftm[query].find(_query).toArray(function(err, items) {
        if (err) {
          reject(err);
        } else {
          // console.log("items", items)
          if (items !== undefined && items !== [] && items.length !== undefined && items[0] !== undefined) {

            if (key !== null) {
              resolve(items[0]);
            } else {
              resolve(items)
            }

          } else {

            resolve({})
          }
        }
      });


    })
  })
}

module.exports.find = function(collection, query, fields, count, extra) {
  console.log("FIND", collection, query)

  var _this = this
  var _query = query
  // console.log("GET here;", _query, key)

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {


      if (count) {
        _mdbftm[collection].find(query, fields).count(function(e, count) {

          resolve(count)
        })
      } else {

        if (extra === undefined) {
          extra = {
            sort: {},
            limit: 0,
            skip: 0
          }
        }
        console.log("EXTRA", extra)
        _mdbftm[collection].find(query, fields).sort(extra.sort).limit(extra.limit).skip(extra.skip).toArray(function(err, items) {

          if (err) {
            reject(err);
          } else {
            resolve(items)
          }
        });

        // console.log("FIND ",query,key,_query)

      }

    })
  })
}
module.exports.distrinctAndCountByDateCreation = function() {
  // console.log("SET", query, key, item, value, isGetMandatory)
  var _this = this



  return new Promise(function(resolve, reject) {
    _this.init().then(function() {

      var _tmp = [{
          "$match": {
            "status": "Reject"
          }
        },

        {
          "$group": {
            _id: "$dateupdate_timestamp",
            count: {
              $sum: 1
            }
          }



        },
        {
          "$sort": {
            "_id": -1
          }
        }
      ]


      _mdbftm['checklist'].aggregate(_tmp).toArray(function(err, r) {
        console.log("result", r)

        for (var i in r) {

          r[i].dateupdate = new Date(r[i]._id)
        }
        resolve(r)
      })
    })
  })


}
module.exports.set = function(query, key, item, value, isGetMandatory) {
  // console.log("SET", query, key, item, value, isGetMandatory)
  var _this = this
  if (item === null || item === undefined)
    item = ""



  return new Promise(function(resolve, reject) {
    _this.init().then(function() {

      var _tmp = {}


      if (item !== null && item !== "") {

        _tmp = {}
        _tmp[item] = value
      } else {
        _tmp = {}
        for (var i in value) {
          _tmp[i] = value[i]

        }
      }
      console.log("set update", _tmp)
      // for(var i in _tmp){
      //   if(i.indexOf('$$') !== -1)
      //    delete _tmp[i]
      //  else{
      //    for(var j in _tmp[i]){
      //      if(j.indexOf('$$') !== -1)
      //       delete _tmp[j]
      //    }
      //  }
      // }
      _mdbftm[query].update({
          _id: (key)
        }, {
          "$set": _tmp
        }, {
          upsert: true
        },
        function(error, controllerHandle) {
          console.log(error)
          if (error) reject(error);

          if (controllerHandle === undefined) {
            resolve()
          } else if (controllerHandle._id === undefined) {

            if (isGetMandatory !== undefined && isGetMandatory === true)
              resolve(_this.get(query, key))
            else {
              resolve()
            }
          } else {
            resolve(controllerHandle);
          }

        });



    })
  })

  // return ref.child(query + "/" + key + "/" + item).set(value)
}


module.exports.countUsers = function(query) {
  var _this = this
  _totalParticipants = 0
  // return _db.init().then(function(){
  return new Promise(function(resolve, reject) {
    _this.init().then(function() {

      _mdbftm[query].count(function(e, count) {
        _totalParticipants = count
        resolve(_totalParticipants)
      })


    })
  })

}
module.exports.delete = function(query, key) {

  var _this = this

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {

      var _tmp = {}

      var _query = {}
      if (key !== null) {
        _query = {
          _id: (key)
        }
      }
      // console.log("set update", query, _tmp)
      // console.log("{    _id:  "+key+"   }, {    $set: "+_tmp+"  }, {    upsert: true  }")
      // console.log(_tmp)
      resolve(_mdbftm[query].remove(_query))



    })
  })


}

module.exports.aggregate = function(query, key, array) {

  var _this = this

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {


      console.log("test", query, key, "----")
      // console.log("set update", query, _tmp)
      // console.log("{    _id:  "+key+"   }, {    $set: "+_tmp+"  }, {    upsert: true  }")
      // console.log(_tmp)
      var _key = key[0]
      if (array)
        _key = key
      _mdbftm[query].aggregate(_key, {
          allowDiskUse: true,
          cursor: {}
        },
        function(err, data) {

          if (err)
            throw err;

          resolve(data);

        }
      );





    })
  })


}