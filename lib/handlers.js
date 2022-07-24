// const { config } = require('process');
let _data = require('./data')
let helpers = require('./helpers')
let handlers = {};
let config = require('../config')

// Ping handlers
handlers.ping = function (data, callback) {
  setTimeout(function () {
    callback(200, 'health check');
  }, 5000);
}

handlers.users = (data, callback) => {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {}

handlers._users.post = (data, callback) => {

  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, (err, data) => {
      if (err) {
        let hashedPassword = helpers.hash(password)


        if (hashedPassword) {

          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            'tosAgreement': 'true'
          }

          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err);
              callback(500, { 'Error': "Could not create the new user" })
            }
          })
        } else {
          callback(500, { 'Error': 'Could not hash password' })
        }
      } else {
        callback(400, { 'Error': 'A user with the phone number already exists' })
      }
    })
  } else {
    callback(400, { 'Eroor': 'Missing required fields' });
  }
}


handlers._users.get = (data, callback) => {
  let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
  if (phone) {

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    handlers._tokens.verifyToken(token, phone, (tokenIsVlid) => {
      if (tokenIsVlid) {
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data)
          } else {
            callback(404)
          }
        })
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is i' })
      }
    })


  } else {
    callback(400, { 'Error': "Missing required field" })
  }
}


handlers._users.put = (data, callback) => {
  let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false


  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (phone) {

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    handlers._tokens.verifyToken(token, phone, (tokenIsVlid) => {
      if (tokenIsVlid) {
        if (firstName || lastName || password) {
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }

              if (lastName) {
                userData.lastName = lastName;
              }

              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  console.log(200, data);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'could not update user' });

                }
              })
              callback(200, data);
            } else {
              callback(404, { 'Error': "user not exists" });
            }
          })
        } else {
          callback(400, { 'Error': "Missing fields to update" })
        }
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is i' })
      }
    })


  } else {
    callback(400, { 'Error': "Missing required field" })
  }
}


handlers._users.delete = (data, callback) => {
  let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false




  if (phone) {

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    handlers._tokens.verifyToken(token, phone, (tokenIsVlid) => {
      if (tokenIsVlid) {
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200)
              } else {
                callback(500, { 'Error': 'could not delete user' })
              }
            })
          } else {
            callback(404, { 'Error': ' user not found' })
          }
        })
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is i' })
      }
    })


  } else {
    callback(400, { 'Error': "Missing required field" })
  }
}



handlers.tokens = (data, callback) => {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.post = (data, callback) => {
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        let hashedPassword = helpers.hash(password)

        if (hashedPassword == userData.hashedPassword) {
          let tokenId = helpers.createRandomString(20);

          let expires = Date.now() + 1000 * 60 * 60;

          let tokenObj = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          _data.create('tokens', tokenId, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, { 'Error': 'could not creat token' })
            }
          });

        } else {
          callback(400, { 'Error': 'Incorrect password ' })
        }

      } else {
        callback(400, { "error": 'Could not find the user' })
      }
    })
  } else {
    callback(400, { "erorr": "required missing filed" })
  }
};



handlers._tokens.get = (data, callback) => {
  let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  console.log(id);
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires > Date.now() + 1000 * 60 * 60;

          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200, tokenData)
            } else {
              callback(500, { 'Error': 'Could not update token experation' })
            }
          })
        } else {
          callback(400, { "Error": "Token already expiree" })
        }
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'Error': "Missing required field" })
  }
};



handlers._tokens.put = (data, callback) => {
  let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false
  let extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  console.log(id, extend);
  if (id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s expiration.' });
            }
          });
        } else {
          callback(400, { "Error": "The token has already expired, and cannot be extended." });
        }
      } else {
        callback(400, { 'Error': 'Specified user does not exist.' });
      }
    })
  } else {
    callback(400, { 'Error': "Missing required field" })
  }



};



handlers._tokens.delete = (data, callback) => {
  let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false


  if (id) {
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { 'Error': 'could not delete token' })
          }
        })
      } else {
        callback(404, { 'Error': ' user not found' })
      }
    })
  } else {
    callback(400, { 'Error': "Missing required field" })
  }
};


handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup the token
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};



handlers.checks = (data, callback) => {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._checks = {};

handlers._checks.post = (data, callback) => {
  var protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;

  var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length == 10 ? data.payload.url.trim() : false;
  var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    console.log(token, 'token');
    _data.read('tokens', token, (err, tokenData) => {
      console.log(tokenData, 'tokenData');
      if (!err && tokenData) {
        var userPhone = tokenData.phone

        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {

            // var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
            let userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

            console.log('userChecks', userChecks, config.maxChecks);

            if (userChecks.length < config.maxChecks) {

              let checkId = helpers.createRandomString(20);

              let checkObject = {
                'id': checkId,
                userPhone,
                protocol,
                url,
                successCodes,
                timeoutSeconds,
                method
              };

              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {


                  userData.checks = userChecks;
                  userData.checks.push(checkId)

                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {

                      callback(200, checkObject);

                    } else {

                      callback(500, { 'Error': 'could not update the user with the new check' })
                    }
                  })

                } else {
                  callback(500, { "Error": 'could not create check user' })
                }
              })

            } else {
              callback(400, { 'Error': 'user Already ahve the maximum number of checks' })
            }

          } else (
            callback(403, { 'Error': 'userData not found' })
          )
        })
      } else {
        callback(403, { 'Error': err })
      }

    })


  } else {
    callback(400, { 'Error': 'Missing required input of input are invalid' })
  }


}



handlers._checks.get = (data, callback) => {
  let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id) {

    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {


        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false

        console.log('token', token);

        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsVlid) => {
          console.log('tokenValid?', tokenIsVlid);
          if (tokenIsVlid) {


            callback(200, checkData)

          } else {
            callback(403)
          }
        })



      } else {
        callback(403, {'Error' : 'invalid checkId'})
      }
    })




  } else {
    callback(400, { 'Error': "Missing required field" })
  }
}




// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};


module.exports = handlers