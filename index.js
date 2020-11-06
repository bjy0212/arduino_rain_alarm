const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");
const request = require("request");
const app = express();
const PORT = 3000;//process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    //introducing page
});

app.get("/register", (req, res) => {
    //register page
});

app.post("/register", (req, res) => {
	//register rain alarm kit to server and set the area information
	const id = crypto.scryptSync(req.headers.secret, req.headers.id, 64, { N: 1024 }).toString("hex");
    const area = req.headers.area;
});

app.post("/data", (req, res) => {
	//get rain sensor data from arduino and store it in storage
	const id = crypto.scryptSync(req.headers.secret, req.headers.id, 64, { N: 1024 }).toString("hex");
    let data = req.body.data;
});

app.post("/sync", (req, res) => {
	//returns color data from storage data
	const id = crypto.scryptSync(req.headers.secret, req.headers.id, 64, { N: 1024 }).toString("hex");
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
