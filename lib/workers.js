const path = require('path')
const fs = require('fs')
const _data = require('./data')
const http = require('http')
const https = require('https')
const helpers = require('./helpers')
const url = require('url')
const { _tokens } = require('./handlers')



const workers = {}


workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks()
    }, 1000 * 60);
}


workers.gatherAllChecks = () => {
    _data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                _data.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        workers.validateCheckData(originalCheckData)
                    } else {
                        console.log("Error reading one of the check's data");
                    }
                })
            });
        } else {
            console.log("Error: Could not find any checks to process");
        }
    })
}


workers.validateCheckData = (originalCheckData) => {

    originalCheckData = typeof (originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {}

    originalCheckData.id = typeof (originalCheckData.id) == 'string' && originalCheckData.id.length == 20 ? originalCheckData.id.trim() : false;

    originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.length == 10 ? originalCheckData.userPhone.trim() : false;

    originalCheckData.url = typeof (originalCheckData.url) == 'string' && originalCheckData.id.length > 0 ? originalCheckData.url.trim() : false;

    originalCheckData.protocol = typeof (originalCheckData.protocol) == 'string' && ['https', 'http'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;

    originalCheckData.method = typeof (originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;

    originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;

    originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    originalCheckData.state = typeof (originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : down;

    originalCheckData.LastCheked = typeof (originalCheckData.LastCheked) == 'number' && originalCheckData.LastCheked > 0 ? originalCheckData.LastCheked : false;

    if (originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCodes && originalCheckData && timeoutSeconds) {
        workers.performCheck(originalCheckData)
    } else {
        console.log("Error one od the check is not properly formatted");
    }

}


workers.performCheck = (originalCheckData) => {
    let checkOutCome = {
        'error': false,
        'responceCode': false
    }

    let outComeSent = false

    let pasrsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true)

    let hostname = pasrsedUrl.hostname;

    let path = pasrsedUrl.path

    let requestDetails = {

        'protocol': originalCheckData.protocol + ":",
        'hostname': hostname,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000

    }


    let _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    let req = _moduleToUse.request(requestDetails, (res) => {
        let status = res.statusCode;

        checkOutCome.responceCode = status;
        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true
        }
    })


    req.on('error', (e) => {
        checkOutCome.error = {
            'Error': true,
            'value': e
        };
        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    })

    req.on('timeout', (e) => {
        checkOutCome.error = {
            'Error': true,
            'value': 'timeout'
        };
        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    })


    req.end();
}


workers.processCheckOutCome = (originalCheckData, checkOutCome) => {

    let state = !checkOutCome.error && checkOutCome.responceCode && originalCheckData.successCodes.indexOf(checkOutCome.responceCode) > 1 ? 'up' : 'down';

    let alertWarrented = originalCheckData.LastCheked && originalCheckData.state !== state ? true : false;

    

}



workers.init = () => {
    workers.gatherAllChecks()


    workers.loop()
}

module.exports = workers

