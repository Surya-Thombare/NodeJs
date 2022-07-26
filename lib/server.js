/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
const  https = require("https");
var StringDecoder = require('string_decoder').StringDecoder;
let config = require('../config')
const fs = require("fs")
const _data = require("./data");
// const { default: helpers } = require('./lib/helpers');
// const { default: handlers } = require('./lib/handlers').default;
const handlers = require('./handlers');
const helpers = require('./helpers')
const path = require('path')


const server = {};



helpers.sendTwilioSms ('8591061262', 'Hello!', function(err) {
console.log('this was the error', err);
})

_data.create('test', 'newFile', {'foo':'bar'},(err) =>{
  console.log(err);
})

// console.log('_data',_data);

// 
server.unifiedserver = (req, res) => {
   // Parse the url
   var parsedUrl = url.parse(req.url, true);

   // Get the path
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace(/^\/+|\/+$/g, '');
 
   // Get the query string as an object
   var queryStringObject = parsedUrl.query;
 
   // Get the HTTP method
   var method = req.method.toLowerCase();
 
   //Get the headers as an object
   var headers = req.headers;
 
   // Get the payload,if any
   var decoder = new StringDecoder('utf-8');
   var buffer = '';
   req.on('data', function(data) {
       buffer += decoder.write(data);
   });
   req.on('end', function() {
       buffer += decoder.end();
 
       // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
       var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
 
       // Construct the data object to send to the handler
       console.log(queryStringObject);
       var data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : queryStringObject,
         'method' : method,
         'headers' : headers,
         'payload' : helpers.parseJsonToObject(buffer)
       };
 
       // Route the request to the handler specified in the router
       chosenHandler(data,function(statusCode,payload){
 
         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
 
         // Use the payload returned from the handler, or set the default payload to an empty object
         payload = typeof(payload) == 'object'? payload : {};
 
         // Convert the payload to a string
         var payloadString = JSON.stringify(payload);
 
         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);
         console.log("Returning this response: ",statusCode,payloadString);
 
       });
 
   });
}

 // Configure the server to respond to all requests with a string
 server.httpServer = http.createServer(function(req,res){
  server.unifiedserver(req, res)
 
});




server.httpsServerOptions ={
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req,res) => {
  server.unifiedserver(req,res)
})


// Define all the handlers

// Define the request router
server.router = {
  'ping' : handlers.ping,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
}


server.init = () => {
  // Start the server
server.httpServer.listen(config.httpPort,() => {
  console.log(`The server is up and running on port ${config.httpPort} on ${config.envName} envionment`);
});

// Start the server
server.httpsServer.listen(config.httpsPort,() => {
  console.log(`The server is up and running on port ${config.httpsPort} on ${config.envName} envionment`);
});

}


module.exports  = server