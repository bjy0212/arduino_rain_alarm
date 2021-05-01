'use-strict'
//#region imports
const fs = require('fs');
const crypto = require('crypto');
const app = require('./app');
//#endregion

const PORT = process.env.PORT ? process.env.PORT : 3000;

//#region 폴더 초기화
if(!fs.existsSync(__dirname + '/storage/')) {
	fs.mkdirSync(__dirname + '/storage/');
	fs.writeFileSync(__dirname + '/storage/db.json', '{}');
}

if(!fs.existsSync(__dirname + '/storage/rain')) {
	fs.mkdirSync(__dirname + '/storage/rain');
}
//#endregion

// 서버 켜기
const server = app.listen(PORT, _ => console.log(`* Listening at ${PORT}`));

// 타임아웃으로 인해 연결이 끊어지는 것을 방지.
// 테스트용임
server.keepAliveTimeout = 0;