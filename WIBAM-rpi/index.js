var vlc = require('vlc')([
	'-I', 'idummy',
	'-V', 'vdummy',
	'-A', 'oss'
]);
var gpio = require('gpio');
var socket = require('socket.io-client').connect('imccallmacmini.local', { port: 8000 });

var mediaFile = "/home/pi/91924__benboncan__till-with-bell.wav";

var media = vlc.mediaFromFile(mediaFile);
media.parseSync();

var player = vlc.mediaplayer;
player.media = media;

var gpio4 = gpio.export(4, {
	direction: "in",
	ready: function() {
		var prev_state = gpio4.value;
		gpio4.on("change", function(val) {
			if(val != prev_state) {
				prev_state = val;
				console.log("pin state is now: " + val);
				if(val >= 1) {
					console.log("Ding!");
					socket.emit('bell');
					playSound();
				}
			}
		});
	}
});

socket.on('bell', function(uid) {
	console.log("Socket Ding!");
	playSound();
});

var poller = null;
function playSound() {
	if(player.is_playing) {
		console.log('Stoping player since so we can play again.');
		player.stop();
	}
	if(poller) {
		clearInterval(poller);
		poller = null;
	}
	console.log(typeof poller);
	console.log('Player start.');
	player.play();
	poller = setInterval(function () {
		console.log('Poll: ', player.position);
		if((player.position >= 1) || !player.is_playing) {
			player.stop();
			clearInterval(poller);
			poller = null;
			console.log('Player end. Audio has finished playing.');
		}
	}, 500);
}

process.on('SIGINT', dieWell);
function dieWell () {
	console.log("Recived exit signal.");
	player.stop();
	// console.log("Player stopped.");
	media.release();
	// console.log("Media released.");
	vlc.release();
	// console.log("VLC released.");
	if(poller)
		clearInterval(poller);
	gpio4.removeAllListeners('change');
	// console.log("Removed all listeners on gpio 4.");
	gpio4.reset();
	// console.log("Gpio 4 reset.");
	gpio4.unexport();
	// console.log("Gpio 4, unexported");
	process.exit(0);
}
