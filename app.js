'use-strict'
//#region imports
const express = require('express');
require('dotenv');
//#endregion

// express app 선언
const app = express();

//#region 필요한 함수들
/**id와 secret 검증
 * @param {string} id 고유 id
 * @param {string} secret 고유 secret
 * @returns {boolean} 성공 여부
 */
function Certificate(id, secret) {
    // secret을 암호화 하여 hex 코드로 변환
    const code = crypto.scryptSync(secret, id, 64, { N: 1024 }).toString('hex');

    // 유저 정보를 읽어옴
    // 간단한 테스트이므로, 별도의 db 사용 없이 파일 시스템을 사용
    const db = JSON.parse(fs.readFileSync(__dirname + '/storage/db.json'));

    // db에 아이디가 존재 하지 않을 경우 id와 secret을 이용해 새 유저 정보를 추가.
    if (!db[id]) {
        db[id] = code;
        fs.mkdirSync(__dirname + '/storage/rain/' + id + '/');
        fs.writeFileSync(__dirname + '/storage/db.json', JSON.stringify(db));

        // 로깅
        console.log(id + ' added');
    }

    // 유저 정보가 일치하면 true를 반환
    if (db[id] === code) return true;

    // 유저 정보가 불일치하므로 false를 반환
    return false;
}

/**데이터 추가 함수
 * @param {number} data 데이터 베이스에 적을 데이터
 * @param {string} id 고유 id
 * @param {string} dates 현재 날짜 정보
 * @param {string} times 시간 정보
 * @returns {Object} 마지막 데이터
 */
function Manage(data, id, dates, times) {
    // 파일이 없으면 생성 및 초기화
    if (!fs.existsSync(__dirname + '/storage/rain/' + id + '/' + dates + '.json')) fs.writeFileSync(__dirname + '/storage/rain/' + id + '/' + dates + '.json', '[]');

    /**해당하는 dates를 기반으로 불러온 정보
     * @type {Object[]}
     */
    const db = JSON.parse(fs.readFileSync(__dirname + '/storage/rain/' + id + '/' + dates + '.json'));

    // db에 정보 추가
    db.push({ time: times, data: data });

    // db를 덮어 쓰기
    fs.writeFileSync(__dirname + '/storage/rain/' + id + '/' + dates + '.json', JSON.stringify(db));

    /**db의 전체 길이
     * @type {number}
     */
    let len = db.length;

    // 마지막 데이터를 반환
    return db[len - 1].data;
}

/**
 * 한자리 숫자를 감지하여 앞에 0을 붙여 문자열로 반환
 * @param {number} n 두 자리로 변환할 숫자
 * @returns {string} 두 자리로 변환된 문자열
 */
function two(n) {
    if (n < 10) {
        return '0' + n;
    } else if (n > 99) {
        return (n % 100) + '';
    }
    return n + '';
}
//#endregion

//#region 라우팅
// 서버가 작동 중인지
app.get('/', (req, res) => {
    res.send('*h');
    console.log('get requested');
});

// 데이터 추가
app.post('/data', (req, res) => {
    // 로깅
    console.log('*data added to ' + req.headers.id);

    // 인증 실패시 오류 처리
    if (!Certificate(req.headers.id, req.headers.secret)) {
        res.send('*e');
        return;
    }
    
    // 전송 받은 데이터를 수로 변환
    let data = req.headers.rain * 1;

    // 데이터가 없으면 오류 처리
    if (data === undefined) {
        res.send('*e');
        return;
    }

    /**날짜 object
     * @type {Date}
     */
    const date = new Date();
    /**날짜 정보
     * @type {string}
     */
    const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());
    /**시간 정보
     * @type {string}
     */
    const times = two(date.getHours()) + two(date.getMinutes());

    let rained = Manage(data, req.headers.id, dates, times) * 1;

    res.send('*' + rained);
});

// 데이터 동기화
app.post('/sync', (req, res) => {
    // 로깅
    console.log('*sync requested for ' + req.headers.id);

    // 인증 실패 처리
    if (!Certificate(req.headers.id, req.headers.secret)) {
        res.send('*e');
        return;
    }

    /**날짜 object
     * @type {Date}
     */
    const date = new Date();
    /**날짜 정보
     * @type {string}
     */
    const dates = two(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate());

    //returns color data from storage data

    let db = [];

    if (!fs.existsSync(__dirname + '/storage/rain/' + req.headers.id + '/' + dates + '.json')) {
        const dir = fs.readdirSync(__dirname + '/storage/rain/');
        if (!dir.length === 0) db = JSON.parse(fs.readFileSync(__dirname + '/storage/rain/' + req.headers.id + '/' + dir[dir.length - 1]));
    } else {
        db = JSON.parse(fs.readFileSync(__dirname + '/storage/rain/' + req.headers.id + '/' + dates + '.json'));
    }

    if (db.length === 0) {
        res.send('*m');
        return;
    }

    // 가장 최신의 데이터
    const led = db[db.length - 1].data;

    // led 정보를 보냄
    res.send('*' + led);
});
//#endregion

// 모듈 export
module.exports = app;