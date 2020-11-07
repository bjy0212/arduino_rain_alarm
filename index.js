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

app.post("/data", (req, res) => {
	//get rain sensor data from arduino and store it in storage
	const id = crypto.scryptSync(req.headers.secret, req.headers.id, 64, { N: 1024 }).toString("hex");
    let rain = req.body.rain;

    //returns prev_rain data which could be 0, 1, 2
    /*
     * 0: 비가 오지 않음
     * 1: 비가 내리는 중
     * 2: 비가 오다가 멈춘 상태
    */
});

app.post("/sync", (req, res) => {
	//returns color data from storage data
	const id = crypto.scryptSync(req.headers.secret, req.headers.id, 64, { N: 1024 }).toString("hex");
});

function Manage(data) {
	//data is a array of data read from rain sensor
}

function RaintoLED(id) {
	//change data in storage to color codes
}

app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));