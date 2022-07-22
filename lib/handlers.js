let _data = require('./data')
let helpers = require('./helpers')
let handlers = {};

// Ping handlers
handlers.ping = function(data,callback){
  setTimeout(function(){
    callback(200,'health check');
  },5000);
}

handlers.users = (data, callback) => {
    let acceptableMethods = ['post','get','put','delete']
    if(acceptableMethods.indexOf(data.method) > -1 ){
      handlers._users[data.method](data, callback);
    }else{
      callback(405);
    }
  };

handlers._users = {}

handlers._users.post = (data, callback) => {

  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    _data.read('users', phone, (err, data) => {
      if(err){
        let hashedPassword = helpers.hash(password)


        if(hashedPassword){

          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            'tosAgreement': 'true'
          }
  
          _data.create('users', phone, userObject, (err) =>{
            if(!err){
              callback(200)
            } else {
              console.log(err);
              callback(500, {'Error': "Could not create the new user"})
            }
          } )
        } else {
          callback(500, {'Error' : 'Could not hash password'})
        }
      } else {
        callback(400, {'Error' : 'A user with the phone number already exists'})
      }
    })
  }else{
    callback(400, {'Eroor' : 'Missing required fields'});
  }
}


handlers._users.get = (data, callback) => {
  console.log(data.queryStringObject.phone);
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
  if(phone){
    _data.read('users', phone, (err, data) => {
      if(!err && data){
        delete data.hashedPassword;
        callback(200, data)
      }else{
        callback(404)
      }
    })
  } else{
    callback(400,{'Error' : "Missing required field"})
  }
}


handlers._users.put = (data, callback) => {
  
}
 

handlers._users.delete = (data, callback) => {
  
}

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};


module.exports = handlers