let environments = {}

environments.satgging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'satgging',
    'hashingSecret': 'thisIsahashingSecret',
    'maxChecks' : 5,
    'twilio' : {
    'accountSid' : 'AC3cc181e6aba70d8895fcda32886c12ef',
    'authToken' : '4ec028c8d6ae60d50cb22682b5fdf03f',
    'fromPhone' : '+15087197274'
    }
};

environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsahashingSecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : '',
        'authToken' : '',
        'fromPhone' : ''
    }
};


console.log(process.env.NODE_ENV);
let currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : '';
console.log(currentEnvironment);

let environmentsToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.satgging;

module.exports = environmentsToExport;