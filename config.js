var config = {};

config.transport = "http";
//config.transport = "https";
//config.key = "./server.key"
//config.cert = "./server.crt"

config.listenOn = process.env.OPENSHIFT_NODEJS_PORT || 4444;

//config.authFile = "./passwd"

module.exports = config;
