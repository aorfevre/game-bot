var mongojs = require('mongojs')

global._mdb;

module.exports.init = function() {

  return new Promise(function(resolve, reject) {
    // var url = "ablock:5L3gXqPkLrwRrgVyvJqN7jJdA@localhost:27017/ablockBot?authSource=admin";
    //
    // if (isDev)
    url = "ablock:5L3gXqPkLrwRrgVyvJqN7jJdA@3.12.222.35:27017/ablockBot?authSource=admin";



    _mdb = mongojs(url, [])

    //
    // _mdb["users_participating_1"].getIndexes(function(r){

    //   if(r===null){
    //     _mdb["users_participating_1"].createIndex({ airdrop_status: true })

    //   }
    // })





    resolve()

  })


}


module.exports.get = function(query, key) {
  // console.log("GET", query, key)

  var _this = this
  var _query = query
  // console.log("GET here;", _query, key)

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {


      var _query = {}
      if (key !== null) {
        _query = {
          _id: Number(key)
        }
      }
      // console.log("FIND ",query,key,_query)
      _mdb[query].find(_query).toArray(function(err, items) {
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

module.exports.find = function(collection, query, fields, count) {
  // console.log("FIND", collection, query)

  var _this = this
  var _query = query
  // console.log("GET here;", _query, key)

  return new Promise(function(resolve, reject) {
    _this.init().then(function() {


      if (count) {
        _mdb[collection].find(query, fields).count(function(e, count) {

          resolve(count)
        })
      } else {



        // console.log("FIND ",query,key,_query)
        _mdb[collection].find(query, fields, function(err, items) {

          if (err) {
            reject(err);
          } else {
            resolve(items)
          }
        });
      }

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
      // console.log("set update", query, _tmp)

      _mdb[query].update({
          _id: Number(key)
        }, {
          "$set": _tmp
        }, {
          upsert: true
        },
        function(error, controllerHandle) {
          if (error) reject(error);

          if (controllerHandle._id === undefined) {

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

      _mdb[query].count(function(e, count) {
        _totalParticipants = count
        resolve(_totalParticipants)
      })


    })
  })

}