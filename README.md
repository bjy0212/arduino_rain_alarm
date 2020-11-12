# 아두이노 비 알리미

***

# 백엔드 개요
> 시연용 서버는 heroku 무료 플랜으로 동작.  
> [Github 링크](https://github.com/bjy0212/arduino_rain_alarm_back)  
> 아직 기능은 미구현 상태.  

서버는 1개의 GET과 2개의 POST로 간단히 구성된다.

---

## Get

### ~/
메인 페이지, 소개 및 사용법 안내를 위한 페이지로 사용.

---

## POST

### ~/data
비 감지 센서에서 수집된 데이터를 서버로 전송.
###### 요청 헤더:
 - id: 비 알리미 기기별 고유 id
 - secret: 비 알리미 기기별 고유 secret code

###### 전송 데이터:
 - rain: 비 감지 센서에서 수집한 센서 데이터 (Char or Int)

***rain 데이터 예시***
```text
1
```

###### 내부 처리:
 - `Certificate(id, secret)` 함수를 호출해 id와 secret 코드를 인증한다.
 - `Manage(data, id, dates)` 함수를 호출해 body에서 받은 rain 데이터를 정리.  
> 마찬가지로 `JSON`형식을 사용하며, `./storage/rain/${id}/${date}.json`에 저장.  
> `time: 시간, data: 센서값`을 가지는 Object의 배열(Array) 형태로 저장하여, 추후에 빅데이터로 활용 하는 것 또한 가능.

***JSON 예시***
```json
[
    {"time": "0809", "data": "0"},
    {"time": "0819", "data": "0"},
    {"time": "0829", "data": "1"}
]
```

 - `RaintoLED(data, id, dates)` 함수를 호출해 `Manage(data, id, dates)`에서 저장한 비 센서 데이터와 `RSS(area)` 함수에서 저장한 rss 정보를 통합시켜서 최종적으로 LED의 **time**, **red**, **green**, **blue** 정보로 저장.

> `./storage/LED/${id}/${data}.json`에 저장.  
> led의 rgb값을 가지는 Object의 배열(Array) 형태로 저장.  
> 색상 코드는 총 2가지가 있으며, 각각 `(255, 25, 0)`, `(0, 84, 255)`.  

***JSON 예시***
```json
[
    {"time": "0809", "red": 255, "green": 25, "blue": 0},
    {"time": "0819", "red": 255, "green": 25, "blue": 0},
    {"time": "0829", "red": 0, "green": 84, "blue": 255}
]
```

###### 반환 데이터:
 - status: 처리 결과
 - prev: 이전에 비가 왔는지에 관한 데이터

> 0: 비가 오지 않음  
> 1: 비가 내리는 중  
> 2: 비가 오다가 멈춘 상태  

### ~/sync
LED 파트의  아두이노에 변형된 LED 정보를 전송.
###### 요청 헤더:
 - id: 비 알리미 기기별 고유 id
 - secret: 비 알리미 기기별 고유 secret code

###### 내부 처리:
 - `Certificate(id, secret)` 함수를 호출해 id와 secret 코드를 인증한다.
 - `./storage/LED/${id}/${date}.json`의 마지막 요소를 전송.

###### 반환 데이터:
 - red: rgb 데이터의 r값
 - green: rgb 데이터의 g값
 - blue: rgb 데이터의 b값

***

## status

### 200

ok. 전송 및 응답 성공

### 1

id와 secret 불일치

### 2

요청 헤더가 맞지 않음.

### 3

스토리지에 데이터가 없음.
~/data 이전에 ~/sync 요청을 보낸 경우.
