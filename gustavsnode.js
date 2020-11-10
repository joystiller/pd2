// TODO:
// Is there a way to sort of "run sketch.js" on server startup? Otherwise the user 
// have to manually hit the refresh button on the html page. 

// Replace slider to another checkbox. 

var ip = '192.168.68.157';
// var os = require('os')
// console.log(os.networkInterfaces())
var port = '3000';
var express = require('express')
var app = express()
var x = 0;
var dt = new Date();
dt.setHours(dt.getHours() + 2);

const AbortController = require("abort-controller")

// Gustavs Pd-fetch
const fetch = require("node-fetch");



// Set up the server
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static(__dirname + '/public'));

console.log("Server up and running!");

var socket = require('socket.io');

var io = socket(server, {
	handlePreflightRequest: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
			"Access-Control-Allow-Credentials": true
		};
		res.writeHead(200, headers);
		res.end();
	}
});


// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);

// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);

	socket.on('Slider', sliderData);

	// When this user emits, client side: socket.emit('otherevent',some data);
	async function sliderData(data) {
		//socket.broadcast.emit('mouse', data);
		console.log(data);
		console.log(dt);

		x = data.x;


		// fetch("http://" + ip + ":" + 3558, {
		// 	method: "PUT", 
		// 	body: ";slider1 " + x + ";"
		// }).catch(err => console.error(err));	
	}

	socket.on('smhiToPd', smhi);

	async function smhi(data) {
		pcat = data.pcat;

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT",
			body: ";pcat " + pcat + ";"
		}).catch(err => console.error(err));
		console.log('Sending pcat value "' + pcat + '" from Node server to Pd.');
	}

	// socket.on('sunSocket', sendSun);

	// async function sendSun(data) {
	// 	console.log('printing from sunSocket, sunStatus = ' + data)
	// 	fetch("http://" + ip + ":" + 3558, {
	// 		method: "PUT",
	// 		body: ";pcat " + pcat + ";"
	// 	}).catch(err => console.error(err));
	// }


	socket.on('sunToPd', sunData);

	async function sunData(data) {
		hoursRise = data.hoursRise;
		minutesRise = data.minutesRise;
		hoursSet = data.hoursSet;
		minutesSet = data.minutesSet;
		sunStatus = data.sunStatus;

		console.log('sending sundata to pd')

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT",
			body: ";hoursRise " + hoursRise + "; minutesRise " + minutesRise + "; hoursSet " + hoursSet + "; minutesSet " + minutesSet + "; sunStatus " + sunStatus + ";"
		}).catch(err => console.error(err));
	}
	// require('os');
	// var os = new 

	// function send2Pd(message = '') {
	// 	os.system("echo '" + 3 + "' | pdsend 3000 localhost udp");
	// }



	socket.on('checkboxToggle', mute);
	socket.on('musicboxToggle', activateMusic);

	async function mute(data) {
		if (data) {
			dt2 = new Date();
			console.log('Weather installation was unmuted at ' + dt2.toLocaleDateString() + ' ' + dt2.toLocaleTimeString('en-US'));
		} else {
			dt2 = new Date();
			console.log('Weather installation was muted at ' + dt2.toLocaleDateString() + ' ' + dt2.toLocaleTimeString('en-US'));
		}

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT",
			body: ";toggle " + data + ";"
		}).catch(err => console.error(err));
	}

	async function activateMusic(data) {
		console.log('Music checkbox was set to ' + data + ' at ' + dt);

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT",
			body: ";musictoggle " + data + ";"
		}).catch(err => console.error(err));
	}

	// }.catch(response => console.error(response));

	// const controller = new AbortController();
	// const signal = controller.signal;


	// const fetchPromise = fetch("http://" + ip + ":" + 3558, {
	// 	signal,
	// 	method: "PUT",
	// 	body: ";toggle " + data + ";"
	// });

	// timeout(3000, fetch("http://" + ip + ":" + 3558, {
	// 	signal,
	// 	method: "PUT",
	// 	body: ";toggle " + data + ";"
	// })).then(function (response) {
	// 	console.log("RESPONSE_FETCHED", response)
	// }).catch(function (error) {
	// 	console.log("ERROR_TIME_OUT", error.message);
	// });

	// closeSockets();
}

//now we just need to fix this closeSockets-function so that it actually closes the sockets in Pd. is that the main connection above?
// function closeSockets() {
// 	socket.on('disconnect', function () {
// 		console.log("DISCONNECTED_SOCKET!");
// 		socket.close();
// 	});
// }


function timeout(ms, promise) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			reject(new Error("timeout"))
		}, ms)
		promise.then(resolve, reject)
	})
}


// var osc = require("osc");

// var getIPAddresses = function () {
//     var os = require("os"),
//         interfaces = os.networkInterfaces(),
//         ipAddresses = [];

//     for (var deviceName in interfaces) {
//         var addresses = interfaces[deviceName];
//         for (var i = 0; i < addresses.length; i++) {
//             var addressInfo = addresses[i];
//             if (addressInfo.family === "IPv4" && !addressInfo.internal) {
//                 ipAddresses.push(addressInfo.address);
//             }
//         }
//     }

//     return ipAddresses;
// };

// var udpPort = new osc.UDPPort({
//     localAddress: "0.0.0.0",
//     localPort: 57121
// });

// udpPort.on("ready", function () {
//     var ipAddresses = getIPAddresses();

//     console.log("Listening for OSC over UDP.");
//     ipAddresses.forEach(function (address) {
//         console.log(" Host:", address + ", Port:", udpPort.options.localPort);
//     });
// });

// udpPort.on("message", function (oscMessage) {
//     console.log(oscMessage);
// });

// udpPort.on("error", function (err) {
//     console.log(err);
// });

// udpPort.open();

// trying to send msg with UDP. Not working... 
// https://nodejs.org/api/dgram.html


// const dgram = require('dgram');
// const message = Buffer.from(';Some bytes;');
// const client = dgram.createSocket('udp4');
// client.connect(41234, "localhost", (err) => {
// 	client.send(message, (err) => {
// 		client.close();
// 	});
// });