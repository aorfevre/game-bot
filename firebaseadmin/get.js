var admin = require("firebase-admin");

var serviceAccount = require("../credentials/ablock-credentials.json");

var _this = this;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stakingablock.firebaseio.com"
});

module.exports.database = function() {
  return admin.firestore();
}
module.exports.getCollection = function(collection) {
  var db = admin.firestore();
  return db.collection(collection);
}
module.exports.getElementById = function(collection, id) {
  var db = admin.firestore();
  return db.collection(collection)
    .doc(id).get()
}

module.exports.setDataByCollection = function(collection, key, datasJson) {
  var db = admin.firestore();
  var ref = db.collection(collection)
    .doc(key)
    // var datas = ref.child(key);
    .set(datasJson);
}