const crypto = require('crypto')
const config = require('../config')


let helpers = {}

helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 1){
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash
    } else {
        return false
    }
}


helpers.parseJsonToObject = function(str){
   
    try{
      var obj = JSON.parse(str);
      return obj;
    } catch(e){
      return {};
    }
  };

module.exports = helpers