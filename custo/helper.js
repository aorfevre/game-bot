var CryptoJS = require("crypto-js");


// create a function to encode using a Private Key an object 
module.exports.encode = (data) =>{

    return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.PRIVATE_KEY).toString();
  }
  
  
  // create a function to decode using a public key an object 
  module.exports.decode = (data) =>{
    try{
        var bytes  = CryptoJS.AES.decrypt(data, process.env.PRIVATE_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }catch(e){
        console.log('error',e);
        return null;
    }

  }