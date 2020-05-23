global._fb_firebase = require('./firebase_db.js')
var _db = require('../database/mongo_db.js')

var fs = require('fs');

_fb_firebase.init()
  var _migrate = function(value){
    _fb_firebase.get(array[value],null).then(function(snapshot){
      var _data = JSON.stringify(snapshot)

        // console.log("Loading done")

      var _filename = array[value].replace(/\//g, '_');
      var _myjson = "jsondb/"+_filename+"_db.json"
      fs.writeFile(_myjson, _data, function(err) {

        var _mydatas = {}
        fs.readFile(_myjson, 'utf8', function(err, data) {
          if (err) throw err;

          _mydatas = JSON.parse(data);
          for(var i in _mydatas){
          //  console.log(i,_mydatas[i])


            if( array[value].indexOf("users_participating_") !== -1){

              var _referrals = []
              for (var j in _mydatas[i].referrals){
                _referrals.push(_mydatas[i].referrals[j])
              }
              _mydatas[i].referrals = _referrals

            //  _db.set(array[value],Number(i),"referrals",_referrals,false)
            }
             _db.set(array[value],Number(i),null,_mydatas[i],false)



        }
        });

      });
    })
  }
  //"airdrop","metrics","users",
  // global.array = ["airdrop","metrics","users","users_participating_1"]
  // for(var j =0;j<array.length;j++){
  //
  //   _migrate(j)
  // }
