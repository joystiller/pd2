  
// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

var socket;
var data;
var weather;
var api;
var cityID;
var key;
var sliderFX;
var sliderMX;
let valMX;
var toggle;
const url = '192.168.1.219';




function setup() {
  noCanvas();

  /*
   //following steps on: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
  let requestURL = 'https://www.yr.no/place/Sweden/Stockholm/Stockholm/external_box_stripe.js'
  let request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    const yrWeather = request.response;
    populateHeader(yrWeather);
    showHeroes(yrWeather);
    console.log('yrweather loading complete!')
    }
    */
    


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


  // The hashtag selects the toggle in the html file
  toggle = select("#toggle");
  toggle.changed(changeToggle);
  sliderMX = createSlider(0, 127, 0);
  sliderMX.input(updateslider);
  //d.child(sliderMX);
  //button.style("position", "center");

  // Start a socket connection to the server

  socket = io.connect('192.168.1.219:3000');

  //var timer = createP("");
  //timer.id('demo');
}

function gotData(data) {
  weather = data;
}

function refresh() {
  cleartext();
  var url = api + cityID + APIkey;
  //var url = 'https://www.yr.no/place/Sweden/Stockholm/Stockholm/external_box_stripe.js'
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
}

function draw() {
  if (weather) {
    textSize(24);
    text('Temperature Stockholm: ' + weather.list[0].main.temp + ' C', 10, 50);
    text('Weather: ' + weather.list[0].weather[0].main, 10, 100);
  }
}

function updateslider() {
  sendslider(sliderMX.value());
}

function sendslider(mxval) {
  console.log("sendslider: " + mxval);

  var data = {
    x: mxval
  };

  socket.emit('Slider',data);

}

function changeToggle() {
  var data = toggle.checked();
  socket.emit('checkboxToggle', data);
  if (data){
    return stopCountdown();
  } else startCountdown();
}

function startCountdown() {
  var counter = 0;
  var distance = 3600000;
  document.getElementById("demo").innerHTML = "01:00:00";
  var i = setInterval(function() { 
    if (toggle.checked()) {
      clearInterval(i);
    } else {

      distance = distance - 1000;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("demo").innerHTML = (hours).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":"
    + (minutes).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + (seconds).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    counter++;
    if (counter === 3600) {
      clearInterval(i);
      stopCountdown();
    }
  }
}, 1000);
}

function stopCountdown () {
  document.getElementById("toggle").checked = true;
  socket.emit('checkboxToggle', toggle.checked());
  document.getElementById("demo").innerHTML = "Click toggle to mute";

}

