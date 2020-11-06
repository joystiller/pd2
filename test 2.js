const fetch = require("node-fetch");
fetch("http://localhost:5020", {
	method: "PUT", 
	body: ";slider1 10; slider2 400;"
});	
