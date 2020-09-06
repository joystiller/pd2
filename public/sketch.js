  
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
const url = '192.168.0.102';
var Wsymb2;
var pcat;




function setup() {
  noCanvas();

  // Start a socket connection to the server
  socket = io.connect(url + ':3000');
  
  const api_url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.102919/lat/59.336600/data.json';
  const sun_url = 'https://api.sunrise-sunset.org/json?lat=59.336600&lng=18.102919'
  
  async function getSun() {
    var dtRise = new Date();
    var dtSet = new Date();

    const response = await fetch(sun_url);
    var hms = await response.json();

    // Calculations for sunrise
    var a = hms.results.sunrise.split(':');
    var b = a[2].split(' ');

    var hoursRise = parseInt(a[0]) + 2;
    var minutesRise = parseInt(a[1]);
    var secondsRise = parseInt(b[0]);

    if (b[1] == 'PM') {
      hoursRise = hoursRise + 12;
    } else if (b[1] == 'AM') {
    }

    dtRise.setHours(hoursRise);
    dtRise.setMinutes(minutesRise);
    dtRise.setSeconds(secondsRise);

    console.log('Sun rises at: ' + dtRise);

    // Calculations for sunset
    var c = hms.results.sunset.split(':');
    var d = c[2].split(' ');

    var hoursSet = parseInt(c[0]) + 2;
    var minutesSet = parseInt(c[1]);
    var secondsSet = parseInt(d[0]);

    if (d[1] == 'PM') {
      hoursSet = hoursSet + 12;
    } else if (d[1] == 'AM') {
    }

    dtSet.setHours(hoursSet);
    dtSet.setMinutes(minutesSet);
    dtSet.setSeconds(secondsSet);
    console.log('Sun sets at: ' + dtSet);

    
    var sunData = {
      hoursRise: hoursRise,
      minutesRise: minutesRise,
      hoursSet: hoursSet,
      minutesSet: minutesSet
    };
    socket.emit('sunToPd', sunData); 

  }

  async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    console.log(data.timeSeries[2].validTime);

    var smhiData = {
      pcat: data.timeSeries[2].parameters[2].level,
      sunUp: 6,
      sunDown: 20
    };
    socket.emit('smhiToPd', smhiData); 

    Wsymb2 = data.timeSeries[2].parameters[18].values;
    if (Wsymb2 == 1) {
      document.getElementById('Wsymb2').innerHTML = 'Clear sky';  
    } else if (Wsymb2 == 2) {
      document.getElementById('Wsymb2').innerHTML = 'Nearly clear sky'; 
    } else if (Wsymb2 == 3) {
      document.getElementById('Wsymb2').innerHTML = 'Variable cloudiness'; 
    } else if (Wsymb2 == 4) {
      document.getElementById('Wsymb2').innerHTML = 'Halfclear sky';   
    } else if (Wsymb2 == 5) {
      document.getElementById('Wsymb2').innerHTML = 'Cloudy sky'; 
    } else if (Wsymb2 == 6) {
      document.getElementById('Wsymb2').innerHTML = 'Overcast'; 
    } else if (Wsymb2 == 7) {
      document.getElementById('Wsymb2').innerHTML = 'Fog';   
    } else if (Wsymb2 == 8) {
      document.getElementById('Wsymb2').innerHTML = 'Light rain showers'; 
    } else if (Wsymb2 == 9) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate rain showers'; 
    } else if (Wsymb2 == 10) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy rain showers';   
    } else if (Wsymb2 == 11) {
      document.getElementById('Wsymb2').innerHTML = 'Thunderstorm'; 
    } else if (Wsymb2 == 12) {
      document.getElementById('Wsymb2').innerHTML = 'Light sleet showers'; 
    } else if (Wsymb2 == 13) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate sleet showers';   
    } else if (Wsymb2 == 14) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy sleet showers'; 
    } else if (Wsymb2 == 15) {
      document.getElementById('Wsymb2').innerHTML = 'Light snow showers'; 
    } else if (Wsymb2 == 16) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate snow showers';   
    } else if (Wsymb2 == 17) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy snow showers'; 
    } else if (Wsymb2 == 18) {
      document.getElementById('Wsymb2').innerHTML = 'Light rain'; 
    } else if (Wsymb2 == 19) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate rain';   
    } else if (Wsymb2 == 20) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy rain'; 
    } else if (Wsymb2 == 21) {
      document.getElementById('Wsymb2').innerHTML = 'Thunder';   
    } else if (Wsymb2 == 22) {
      document.getElementById('Wsymb2').innerHTML = 'Light sleet'; 
    } else if (Wsymb2 == 23) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate sleet'; 
    } else if (Wsymb2 == 24) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy sleet';   
    } else if (Wsymb2 == 25) {
      document.getElementById('Wsymb2').innerHTML = 'Light snowfall'; 
    } else if (Wsymb2 == 26) {
      document.getElementById('Wsymb2').innerHTML = 'Moderate snowfall'; 
    } else if (Wsymb2 == 27) {
      document.getElementById('Wsymb2').innerHTML = 'Heavy snowfall';   
    } 
    

  }

  getISS();
  getSun();
  // setInterval(getISS, 60000);
  setInterval(function () {
    getISS();
    getSun();
}, 60000);
  

  angleMode(DEGREES);
  let d = createDiv();
  d.style('transform: rotate(' + 90 + 'deg);');


  // The hashtag selects the toggle in the html file
  toggle = select("#toggle");
  toggle.changed(changeToggle);
  sliderMX = createSlider(0, 127, 0);
  sliderMX.input(updateslider);



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
  document.getElementById("demo").innerHTML = "Commencing countdown...";
  var i = setInterval(function() { 
    if (toggle.checked()) {
      clearInterval(i);
    } else {

      distance = distance - 1000;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("demo").innerHTML = "Muted - Fade in begins in: " + (hours).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":"
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

