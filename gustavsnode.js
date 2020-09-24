var ip = '192.168.1.219';
var port = '3000';

var express = require('express')
var app = express()
var x = 0;
var dt = new Date();
dt.setHours(dt.getHours() + 2);


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
	async function sliderData(data){ 
		//socket.broadcast.emit('mouse', data);
		console.log(data);
		console.log(dt);

		x = data.x;	
		
		//fetch("http://192.168.1.219:3558", {
		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			body: ";slider1 " + x + ";"
		}).catch(err => console.error(err));	
	}

	socket.on('smhiToPd', smhi);

	async function smhi(data){
		pcat = data.pcat;

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			body: ";pcat " + pcat + ";"
		}).catch(err => console.error(err));
	}

	socket.on('sunToPd', sunData); 
	
	async function sunData(data){
		hoursRise = data.hoursRise;
		minutesRise = data.minutesRise;
		hoursSet = data.hoursSet;
		minutesSet = data.minutesSet;

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			body: ";hoursRise " + hoursRise + "; minutesRise " + minutesRise + "; hoursSet " + hoursSet + "; minutesSet " + minutesSet + ";"
		}).catch(err => console.error(err));
	}


	socket.on('checkboxToggle', mute);

	function mute(data) {
		console.log('return checkbox data: ' + data);
		console.log(dt);

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			//body: ";toggle " + 'symbol ' + data + ";"
			body: ";toggle " + data + ";"
		}).catch(err => console.error(err));
	}

	
}












