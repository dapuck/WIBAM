var config = require('./config'),
  fs = require('fs');
var app;
if(config.transport == "https") {
  app = require("https").createServer({
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert)
  },httpHandler);
} else 
  app = require("http").createServer(httpHandler);

var io = require('socket.io').listen(app),
  crypto = require('crypto');

app.listen(config.listenOn);

io.configure(function() {
  io.set('authorization', function(handShakeData, callback) {
    // debugger;
    if(handShakeData.query.k == "xyz")
      callback(null, true);
    else 
      callback("bad key", false);
  });
});

var nextID = 0;

console.log("WIBAM Server Start");
io.sockets.on('connection', function (socket) {
  socket.set('uid', nextID++, function(){});
  socket.get('uid', function(err, uid) {
    console.log("Client Connected: uid = " + uid);
  });
  socket.on('client config', function(config) {
    socket.get('uid', function(err, uid) {
      config.uid = uid;
      console.log("Recived config from " + config.uid);
      socket.broadcast.emit('client config', JSON.stringify(config));
    });
  });
  socket.on('bell', function() {
    socket.get('uid', function(err, uid) {
      console.log("DING! from " + uid);
      socket.broadcast.emit('bell', uid);
    });
  });
});

function httpHandler (req, res) {
  if(config.transport !== "https") {
    serveFile(req, res);
    return;
  }
  
  var authHeader = req.headers['authorization'] || '',
    token = authHeader.split(/\s+/).pop() || '',
    auth = new Buffer(token, 'base64').toString(),
    parts = auth.split(':'),
    username = parts[0],
    pass = parts[1];

  // Check username and pass
  if(!authHeader) {
    // no authorization header was sent
    // we should issue a challenge
    res.writeHead(401, "Unauthorized", {
      'WWW-Authenticate': 'Basic realm="WIBAM"'
    });
    return res.end("");
  }

  if(checkCred(username, pass)) {
    serveFile(req, res);
  } else {
    // username and password not recognized
    res.writeHead(401, "Unauthorized");
    return res.end("Unauthorized");
  }
}

function serveFile(req, res) {
  var file = (req.url.indexOf("zepto.min.js") > -1) ? "/zepto.min.js" : "/index.html";
  fs.readFile(__dirname + file, function (err, data) {
    if(err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }
    res.writeHead(200);
    res.end(data);
  });
}

var _authUsers = null;
function checkCred (username, pass) {
  debugger;
  if(!_authUsers) {
    _authUsers = {};
    // Load from config
    var data = fs.readFileSync(config.authFile, 'ASCII'),
      lines = data.split('\n');
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if(line) {
        var pair = line.split(':');
        _authUsers[pair[0]] = pair[1].replace('{SHA}','');
      }
    }
  }
  if(_authUsers[username]) {
    var shasum = crypto.createHash('sha1').update(pass).digest('base64');
    return (_authUsers[username] == shasum);
  } else 
    return false;
}
