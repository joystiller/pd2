const fetch = require("node-fetch");
fetch("http://localhost:7205", {
			method: "PUT", 
			body: ";slider1 32; slider2 42;"
		});	