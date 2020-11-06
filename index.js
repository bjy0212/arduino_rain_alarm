const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = 3000;//process.env.PORT;

app.get("/", (req, res) => {
    //introducing page
});

app.get("/register", (req, res) => {
    //register page
})

app.post("/register", (req, res) => {
	//register rain alarm kit to server and set the area information
	const id = crypto.scryptSync(req.headers.code, req.headers.id, 64, { N: 1024 }).toString("hex");

});

app.post("/data", (req, res) => {
	//get rain sensor data from arduino and store it in storage
	const id = crypto.scryptSync(req.headers.code, req.headers.id, 64, { N: 1024 }).toString("hex");
});

app.post("/sync", (req, res) => {
	//returns color code from storage data
	const id = crypto.scryptSync(req.headers.code, req.headers.id, 64, { N: 1024 }).toString("hex");
});

function RSS(area) {
	//get rss data and edit data file
}

function Manage(data) {
	//data is a array of data read from rain sensor
}

function RaintoLED() {
	//change data in storage to color codes
}

app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));
