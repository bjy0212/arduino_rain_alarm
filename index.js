const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");
const request = require("request");
const app = express();

app.use(express.static("pages"));

const PORT = 3000;//process.env.PORT;

if(!fs.existsSync(__dirname + "/storage") || !fs.existsSync(__dirname + "/storage/LED")) {
	fs.mkdir(__dirname + "/storage");
	fs.writeFileSync(__dirname + "/storage/db.json", "{}");
	fs.mkdir(__dirname + "/storage/LED");
	fs.mkdir(__dirname + "/storage/rain");
}

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/data", (req, res) => {
	if(!Certificate(req.headers.id, req.headers.secret)) {
		res.json({status: 403, message: "Forbidden: id or secret is wrong"});
		return;
	}
	//get rain sensor data from arduino and store it in storage
    let rain = req.body.rain;


    //returns prev_rain data which could be 0, 1, 2
    /*
     * 0: 비가 오지 않음
     * 1: 비가 내리는 중
     * 2: 비가 오다가 멈춘 상태
    */
});

app.post("/sync", (req, res) => {
	if(!Certificate(req.headers.id, req.headers.secret)) {
		res.json({status: 403, message: "Forbidden: id or secret is wrong"});
		return;
	}
	//returns color data from storage data
    //색상 코드는 총 2가지 (255, 25, 0), (0, 84, 255).
});

function Certificate(id, secret) {
	const code = crypto.scryptSync(secret, id, 64, { N: 1024 }).toString("hex");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/db.json"));
	if(db[id] === code) return true;
	return false;
}

function Manage(data, id) {
	//data is a array of data read from rain sensor
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/rain/" + ));
}

function RaintoLED(id) {
	//change data in storage to color codes
}

app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));
