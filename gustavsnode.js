// TODO:
// Is there a way to sort of "run sketch.js" on server startup? Otherwise the user 
// have to manually hit the refresh button on the html page. 

// Replace slider to another checkbox. 

var ip = '192.168.1.13';
// var os = require('os')
// console.log(os.networkInterfaces())
var port = '3000';
var express = require('express')
var app = express()
var x = 0;
var dt = new Date();
dt.setHours(dt.getHours() + 2);
var timeIndex = 0;

// SMHIs api_url
const api_url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.102919/lat/59.336600/data.json';
const sun_url = 'https://api.sunrise-sunset.org/json?lat=59.336600&lng=18.102919'

var socket;
var weather;
var api;
var cityID;
var key;
var sliderFX;
var sliderMX;
let valMX;
var toggle;
var musictoggle;
const url = '192.168.1.219';
var Wsymb2;
var pcat;
var startupSunrise;
var dtRise = new Date();
var dtSet = new Date();
var sunStatus;
var pcatIndex;



// const io2 = require('socket.io')(3001);
// io2.on('connect', socket => {
// 	// either with send()
// 	socket.send('Hello!');


// 	socket.on('message', (data) => {
// 		console.log(data);
// 	});
// });




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
			"Access-Control-Allow-Origin": req.headers.origin,
			"Access-Control-Allow-Credentials": true
		};
		res.writeHead(200, headers);
		res.end();
	}
});






// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);






async function getSun() {

	const response = await fetch(sun_url);
	var hms = await response.json();

	// Calculations for sunrise
	var a = hms.results.sunrise.split(':');
	var b = a[2].split(' ');

	var hoursRise = parseInt(a[0]) + 1;
	var minutesRise = parseInt(a[1]);
	var secondsRise = parseInt(b[0]);

	if (b[1] == 'PM') {
		hoursRise = hoursRise + 12;
	} else if (b[1] == 'AM') {}

	dtRise.setHours(hoursRise);
	dtRise.setMinutes(minutesRise);
	dtRise.setSeconds(secondsRise);

	console.log('Sun rises at: ' + dtRise);

	var dt2 = new Date();
	if (dtRise > dt2.getTime()) {
		console.log('dtRise is bigger than current time, which means that the sun has not risen yet');
		sunStatus = true;
		//console.log('variable x: ' + x)
		//socket.emit('sunSocket', x);
	} else {
		console.log('dtRise is not bigger than current time, which means that the program was started after sunrine');
		sunStatus = false;
		//console.log('variable x: ' + x)
		//socket.emit('sunSocket', x);
	}

	// Calculations for sunset
	var c = hms.results.sunset.split(':');
	var d = c[2].split(' ');

	var hoursSet = parseInt(c[0]) + 1;
	var minutesSet = parseInt(c[1]);
	var secondsSet = parseInt(d[0]);

	if (d[1] == 'PM') {
		hoursSet = hoursSet + 12;
	} else if (d[1] == 'AM') {
		// Do nothing
	}

	dtSet.setHours(hoursSet);
	dtSet.setMinutes(minutesSet - 24);
	// The -24 is 24 minutes from Pd's 2 minutes per fader movement * 12 faders. 
	// Because of this, The fade will be completed by the time the sun has set.
	dtSet.setSeconds(secondsSet);
	console.log('Sun sets at: ' + dtSet);

	var hoursSet = dtSet.getHours();
	var minutesSet = dtSet.getMinutes();

	var sunData = {
		hoursRise: hoursRise,
		minutesRise: minutesRise,
		hoursSet: hoursSet,
		minutesSet: minutesSet,
		sunStatus: sunStatus
	};
	sunData2(sunData);

}

// const alligator = ["thick scales", 80, "4 foot tail", "rounded snout"];

// alligator.indexOf("rounded snout"); // returns 3

// Idea: Make a "for loop", go through every index, search for "pcat", if true, then 
// return the number of the index.





async function updatePcat() {
	const response = await fetch(api_url);
	const data = await response.json();

	var i;
	for (i = 0; i < data.timeSeries[timeIndex].parameters.length; i++) {
		const param = data.timeSeries[timeIndex].parameters[i];
		if (param.name === 'pcat') {
			pcatIndex = i;
		}
	}
	// Updating pcat with the new updated pcatIndex.
	pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;

	console.log('pcat index is: ' + pcatIndex);
	console.log('pcat value is: ' + pcat);
	console.log('approved time: ' + data.approvedTime);
	console.log('referenceTime: ' + data.referenceTime);

	// If there's rain on startup, send rain on. Otherwise, do nothing.
	if (pcat != 0) {
		var smhiData = {
			pcat: data.timeSeries[timeIndex].parameters[pcatIndex].level,
		}
		smhi(smhiData);
		console.log('emitting to gustavsnode, pcat not equal to 0');
	}
}

async function getISS() {
	const response = await fetch(api_url);
	const data = await response.json();

	var i;
	for (i = 0; i < data.timeSeries[timeIndex].parameters.length; i++) {
		const param = data.timeSeries[timeIndex].parameters[i];
		if (param.name === 'pcat') {
			pcatIndex = i;
		}
	}
	// Updating pcat with the new updated pcatIndex.
	pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;

	console.log('Current time series is: ' + data.timeSeries[timeIndex].validTime);

	console.log('pcatIndex = ' + pcatIndex);
	if (pcat != data.timeSeries[timeIndex].parameters[pcatIndex].level) {
		var smhiData = {
			pcat: data.timeSeries[timeIndex].parameters[pcatIndex].level,
		};
		console.log('this should only be called if there is a change in pcat');
		smhi(smhiData);
		pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;
	}

	if (data.timeSeries[timeIndex].parameters[pcatIndex].level != 0) {
		console.log('it is raining, call the socket.emit!');
		// Does it ever start raining? getISS() is called once every hour,
		// but this function should only be called on server startup, 
		// then if pcat changes. Need to write a new global function. 
	}

	// '.' First, store pcat in a variable. Then, once every hour, call the API, 
	// compare the pcat value from the API with the one stored in the variable. 
	// If they do not equal, call the socket.emit. 



}

updatePcat();
getISS();
getSun();

//At first, getISS (that is, get the weather) and getSun is called. 
//Then, getSun updates once every 24 hours. 
//getISS should update once every hour, but it should only send data to Pd
//whenever it starts or stops raining.

setInterval(function () {
	getSun();
}, 86400000);

setInterval(function () {
	getISS();
}, 3600000)







// Moving this function out of newConnection(socket)
async function sunData2(data) {
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





// Moving this function out of newConnection(socket)
async function smhi(data) {
	pcat = data.pcat;

	fetch("http://" + ip + ":" + 3558, {
		method: "PUT",
		body: ";pcat " + pcat + ";"
	}).catch(err => console.error(err));
	console.log('Sending pcat value "' + pcat + '" from Node server to Pd.');
}






// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);

	let counter = 0;
	setInterval(() => {
		socket.emit('hello', ++counter);
	}, 3000);

	// socket.emit('getISS');

	socket.on('Slider', sliderData);
	// var y = 3;
	// socket.emit('updateWsymb2');
	// //socket.emit('checkboxToggle', data);

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



	// socket.on('sunSocket', sendSun);

	// async function sendSun(data) {
	// 	console.log('printing from sunSocket, sunStatus = ' + data)
	// 	fetch("http://" + ip + ":" + 3558, {
	// 		method: "PUT",
	// 		body: ";pcat " + pcat + ";"
	// 	}).catch(err => console.error(err));
	// }


	socket.on('sunToPd', sunData2);


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