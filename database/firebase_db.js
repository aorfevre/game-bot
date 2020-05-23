var firebase = require('firebase');

global.ref;
module.exports.init = function() {

  var app = firebase.initializeApp({
    apiKey: "AIzaSyBx5-DgWTL1ty01H_pr0_r60iyAn9byyPE",
    authDomain: "maketokenairdropbot.firebaseapp.com",
    databaseURL: "https://maketokenairdropbot.firebaseio.com",
    projectId: "maketokenairdropbot",
    storageBucket: "maketokenairdropbot.appspot.com",
    messagingSenderId: "555479239616"
  });

  ref = firebase.app().database().ref();


}


module.exports.get = function(query,key){
  var _query = query +"/"+key
  return ref.child(query).once("value")
}

module.exports.set = function(query,key,item,value){
  if(item === null || item === undefined )
    item = ""

  return ref.child(query + "/" + key + "/" + item).set(value)
}
module.exports.update = function(query,key,item,value){
  if(item === null || item === undefined )
    item = ""

  return ref.child(query + "/" + key + "/" + item).update(value)
}


module.exports.find = function(query,field,value){
  return ref.child(query).orderByChild(field).equalTo(value).on("child_added")
}

module.exports.countUsers = function(query){
  return this.get(query).then(function(snapshot){
    _totalParticipants = snapshot.numChildren()
  })
}
