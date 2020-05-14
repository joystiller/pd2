  
// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;


var data;
var weather;
var api;
var cityID;
var key;
var sliderFX;
var sliderMX;
let valFX;
let valMX;

//Kan man fetcha 'url' på något sätt så att den inte behöver hårdkodas? 
const url = '192.168.1.219';



function setup() {
  createCanvas(400, 400);
  //noCanvas();
  background(100);

  api = "https://api.openweathermap.org/data/2.5/forecast?id=";
  cityID = 2673722;
  APIkey = "&units=metric&APPID=76754a491ae0cc7508163183ec8cd32a";

  refresh();
  setInterval(refresh, 600000);
  // Finns det bättre sätt att kalla på updateweather än med setTimeout?
  setTimeout(updateweather, 1000);
  angleMode(DEGREES);
  let d = createDiv();
  d.style('transform: rotate(' + 90 + 'deg);');
  sliderFX = createSlider();
  sliderMX = createSlider();
  sliderFX.input(updateslider);
  sliderMX.input(updateslider);
  d.child(sliderFX);
  d.child(sliderMX);
  
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  // Vad gör den här egentligen? 
  //
  socket = io.connect(url + ':7300');
  //socket = io.connect('http://localhost:7200');
  
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  //socket.on('mouse',
  //  // When we receive data
  //  function(data) {
  //    console.log("Got: " + data.x + " " + data.y);
  //   // Draw a blue circle
  //    fill(0,0,255);
  //    noStroke();
  //    ellipse(data.x, data.y, 20, 20);
  //  }
  //);
}

function gotData(data) {
  weather = data;
}

function refresh() {
  cleartext();
  var url = api + cityID + APIkey;
  loadJSON(url, gotData);
  updateweather();
}

function updateweather() {
  if (weather) {
    console.log('Temperature Stockholm: ' + weather.list[0].main.temp);
    console.log('Weather: ' + weather.list[0].weather[0].main);

    var data = {
      temp: weather.list[0].main.temp,
      currentWeather: weather.list[0].weather[0].main
    };

    console.log(data);
    socket.emit('stockholm', data); 
  }
  
}


function cleartext() {
  //Write something that clear all text before printing new
}

function draw() {
  if (weather) {
    textSize(24);
    text('Temperature Stockholm: ' + weather.list[0].main.temp + ' C', 10, 50);
    text('Weather: ' + weather.list[0].weather[0].main, 10, 100);
  }
}

function updateslider() {
  // How do I not both sliders? How to use .this() function? 
  sendslider(sliderFX.value(), sliderMX.value());
}

//function updateMX() {
  //console.log(sliderMX.value());
//}

//function mouseDragged() {
//  // Draw some white circles
//  fill(255);
//  noStroke();
//  ellipse(mouseX,mouseY,20,20);
//  // Send the mouse coordinates
//  sendmouse(mouseX,mouseY);
//}

function sendslider(fxval, mxval) {
  console.log("sendslider: " + fxval +" " + mxval);

    // Make a little object with fxval and mxval
    var data = {
      x: fxval,
      y: mxval
    };

  // Send that object to the socket
  socket.emit('mouse',data);

}

// Function for sending to the socket


//function sendmouse(xpos, ypos) {
  // We are sending!
//  console.log("sendmouse: " + xpos + " " + ypos);
  
  // Make a little object with  and y
//  var data = {
//    x: xpos,
//    y: ypos
//  };

  // Send that object to the socket
//  socket.emit('mouse',data);
//}
