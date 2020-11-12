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
    let data = req.body.rain;

	const date = new Date();
	const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());
	const times = two(date.getHours) + two(date.getMinutes);

	let rained = Manage(data, req.headers.id, dates, times);

	res.json({
		status: 200,
		message: "ok",
		prev: rained
	});

	RaintoLED(data, req.headers.id, dates, times);
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

	const date = new Date();
	const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());
	const times = two(date.getHours) + two(date.getMinutes);
	//returns color data from storage data
    //색상 코드는 총 2가지 (255, 25, 0), (0, 84, 255).

	let db = [];

	if(!fs.readFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json")) {
		const dir = fs.readdirSync(__dirname + "/storage/LED/");
		if(!dir.length === 0) db = JSON.parse(fs.readFileSync(__dirname + "/storage/LED/" + id + "/" + dir[dir.length - 1]));
	} else {
		db = JSON.parse(fs.readFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json"));
	}

	const led = db[db.length - 1];

	res.json({
		status: 200,
		message: "ok",
		red: led.red,
		green: led.green,
		blue: led.blue
	});
});

function Certificate(id, secret) {
	const code = crypto.scryptSync(secret, id, 64, { N: 1024 }).toString("hex");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/db.json"));
	if(db[id] === code) return true;
	return false;
}

function Manage(data, id, dates, times) {
	//data is a array of data read from rain sensor
	if(!fs.readFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json")) fs.writeFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json", "[]");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json"));
	db.push({time: times, data: data});

	fs.writeFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json", JSON.stringify(db));

	let len = db.length;
	if(len === 1) return db[0];
	return db[len - 1] === 0 ? (db[len - 2] === 0 ? 0 : 2) : 1;
}

function RaintoLED(data, id, dates, times) {
	//change data in storage to color codes
	if(!fs.readFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json")) fs.writeFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json", "[]");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json"));

	const led = data === 0 ? {red: 0, green: 84, blue: 255} : {red: 255, green: 25, blue: 0};
	led.time = times;
	db.push(led);

	fs.writeFileSync(__dirname + "/storage/LED/" + id + "/" + dates + ".json", JSON.stringify(db));
}

function two(n) {
	if(n < 10) {
		return "0" + n;
	} else if(n > 99) {
		return (n % 100) + "";
	}
	return n + "";
}

app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));
