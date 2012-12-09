var config = {};

//config.transport = "http";
config.transport = "https";
config.key = "./server.key"
config.cert = "./server.crt"

config.listenOn = 8000;

config.authFile = "/Users/imccall/WIBAM/WIBAM-server/passwd"

module.exports = config;