const express = require("express");
const app = express();
const PORT = 3000;//process.env.PORT;

app.post("/register", (req, res) => {
	const id = req.headers.id;
});

app.post("/data", (req, res) => {
	const id = req.headers.id;
});

app.post("/sync", (req, res) => {
	const id = req.headers.id;
});

app.listen(PORT, _=> console.log(`* Listening at ${PORT}`));
