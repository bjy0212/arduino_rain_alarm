const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const request = require("request");
const app = express();

/*app.use(function(req, res, next) {
    res.setHeader('Connection', 'close');
    next();
});*/

//app.use(express.static("pages"));

const PORT = process.env.PORT ? process.env.PORT : 3000;

if(!fs.existsSync(__dirname + "/storage/")) {
	fs.mkdirSync(__dirname + "/storage/");
	fs.writeFileSync(__dirname + "/storage/db.json", "{}");
}

if(!fs.existsSync(__dirname + "/storage/rain")) {
	fs.mkdirSync(__dirname + "/storage/rain");
}

app.get("/", (req, res) => {
	res.send("*h");
	console.log("get requested");
});

app.post("/data", (req, res) => {
	console.log("*data added to " + req.headers.id);
	if(!Certificate(req.headers.id, req.headers.secret)) {
		res.send("*e");
		return;
	}
	//get rain sensor data from arduino and store it in storage
    let data = req.headers.rain * 1;
	if(data === undefined) {
		res.send("*e");
		return;
	}

	const date = new Date();
	const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());
	const times = two(date.getHours()) + two(date.getMinutes());

	let rained = Manage(data, req.headers.id, dates, times) * 1;

	res.send("*"+rained);
});

app.post("/sync", (req, res) => {
	console.log("*sync requested for " + req.headers.id);
	if(!Certificate(req.headers.id, req.headers.secret)) {
		res.send("*e");
		return;
	}

	const date = new Date();
	const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());
	const times = two(date.getHours()) + two(date.getMinutes());
	//returns color data from storage data
    //색상 코드는 총 2가지 (255, 25, 0), (0, 84, 255).

	let db = [];

	if(!fs.existsSync(__dirname + "/storage/rain/" + req.headers.id + "/" + dates + ".json")) {
		const dir = fs.readdirSync(__dirname + "/storage/rain/");
		if(!dir.length === 0) db = JSON.parse(fs.readFileSync(__dirname + "/storage/rain/" + req.headers.id + "/" + dir[dir.length - 1]));
	} else {
		db = JSON.parse(fs.readFileSync(__dirname + "/storage/rain/" + req.headers.id + "/" + dates + ".json"));
	}

	if(db.length === 0) {
		res.send("*m");
		return;
	}

	const led = db[db.length - 1].data;

	res.send("*" + led);
});

function Certificate(id, secret) {
	const code = crypto.scryptSync(secret, id, 64, { N: 1024 }).toString("hex");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/db.json"));
	if(!db[id]) {
		db[id] = code;
		fs.mkdirSync(__dirname + "/storage/rain/" + id + "/");
		fs.writeFileSync(__dirname + "/storage/db.json", JSON.stringify(db));
		console.log(id + " added");
	}
	if(db[id] === code) return true;
	return false;
}

function Manage(data, id, dates, times) {
	//data is a array of data read from rain sensor
	if(!fs.existsSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json")) fs.writeFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json", "[]");
	const db = JSON.parse(fs.readFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json"));
	db.push({time: times, data: data});

	fs.writeFileSync(__dirname + "/storage/rain/" + id + "/" + dates + ".json", JSON.stringify(db));

	let len = db.length;
	if(len === 1) return db[0].data;
	return db[len - 1].data;
}

function two(n) {
	if(n < 10) {
		return "0" + n;
	} else if(n > 99) {
		return (n % 100) + "";
	}
	return n + "";
}

const server = app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));
server.keepAliveTimeout = 0;
