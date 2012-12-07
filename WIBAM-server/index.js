var app = require('http').createServer(httpHandler),
	io = require('socket.io').listen(app),
	fs = require('fs');
app.listen(8000);

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
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if(err) {
			res.writeHead(500);
			return res.end("Error loading index.html");
		}
		res.writeHead(200);
		res.end(data);
	});
}
