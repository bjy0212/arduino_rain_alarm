# 아두이노 비 알리미

***

# 백엔드 개요
> 시연용 서버는 heroku 무료 플랜으로 동작합니다.  
> [Github 링크](https://github.com/bjy0212/arduino_rain_alarm_back)  
> 아직 기능은 미구현 상태입니다.  

서버는 2개의 GET과 3개의 POST로 간단히 구성됩니다.

---

## Get

### ~/
메인 페이지, 소개 및 사용법 안내를 위한 페이지로 사용됩니다.

### ~/register
등록 페이지

---

## POST

### ~/register
등록 페이지에서 등록시 사용된다.
###### 요청 헤더:
 - id: 비 알리미 기기별 고유 id
 - secret: 비 알리미 기기별 고유 secret code
 - area: 지역 코드

###### 내부 처리:
 - id와 secret을 crypto 모듈의 scryptSync 메소드로 암호화 한 후, 서버의 저장소에 area 코드와 함께 저장한다.
> 저장 형태는 `JSON`으로, `./storage/registered/areaCodes.json`에 저장된다. (임시)

###### 반환 데이터:
 - status: 처리 결과

### ~/data
비 감지 센서에서 수집된 데이터를 서버로 전송한다.
###### 요청 헤더:
 - id: 비 알리미 기기별 고유 id
 - secret: 비 알리미 기기별 고유 secret code

###### 전송 데이터:
 - rain: 비 감지 센서에서 수집한 센서 데이터 (String)

***rain 텍스트 데이터 예시***
```text
08시 00분: 35
08시 01분: 35
08시 02분: 35
08시 03분: 140
08시 04분: 750
08시 05분: 750
08시 06분: 750
08시 07분: 340
08시 08분: 280
08시 09분: 200
```

###### 내부 처리:
 - `RSS(area)` 함수를 호출해 시간대별 rss 정보를 업데이트하여, `./storage/rss/${id}.json`에 저장한다.
 - `Manage(data)` 함수를 호출해 body에서 받은 rain 데이터를 정리한다.  
> 마찬가지로 `JSON`형식을 사용하며, `./storage/rain/${id}/${date}.json`에 저장한다.  
> `time: 시간, data: 센서값`을 가지는 Object의 배열(Array) 형태로 저장하여, 추후에 빅데이터로 활용 하는 것 또한 가능하다.

***JSON 예시***
```json
[
    {"time": "0800", "data": "35"},
    {"time": "0801", "data": "35"},
    {"time": "0802", "data": "416"},
    {"time": "0803", "data": "426"},
    {"time": "0804", "data": "398"},
    {"time": "0805", "data": "387"},
    {"time": "0806", "data": "458"},
    {"time": "0807", "data": "499"},
    {"time": "0808", "data": "530"},
    {"time": "0809", "data": "564"}
]
```

 - `RaintoLED(id)` 함수를 호출해 `Manage(data)`에서 저장한 비 센서 데이터와 `RSS(area)` 함수에서 저장한 rss 정보를 통합시켜서 최종적으로 LED의 **time**, **red**, **green**, **blue** 정보로 저장한다.

> `./storage/LED/${id}/${data}.json`에 저장한다.  
> led의 rgb값을 가지는 Object의 배열(Array) 형태로 저장한다.  
> 색상 코드는 총 2가지가 있으며, 각각 `(255, 25, 0)`, `(0, 84, 255)`이다.

***JSON 예시***
```json
[
    {"time": "0800", "red": 255, "green": 25, "blue": 0},
    {"time": "0801", "red": 255, "green": 25, "blue": 0},
    {"time": "0802", "red": 255, "green": 25, "blue": 0},
    {"time": "0803", "red": 255, "green": 25, "blue": 0},
    {"time": "0804", "red": 255, "green": 25, "blue": 0},
    {"time": "0805", "red": 255, "green": 25, "blue": 0},
    {"time": "0806", "red": 0, "green": 84, "blue": 255},
    {"time": "0807", "red": 0, "green": 84, "blue": 255},
    {"time": "0808", "red": 0, "green": 84, "blue": 255},
    {"time": "0809", "red": 0, "green": 84, "blue": 255}
]
```

###### 반환 데이터:
 - status: 처리 결과
 - prev: 이전에 비가 왔는지에 관한 데이터

> 0: 비가 오지 않음  
> 1: 비가 내리는 중  
> 2: 비가 오다가 멈춘 상태  

### ~/sync
LED 파트의  아두이노에 변형된 LED 정보를 보낸다.
###### 요청 헤더:
 - id: 비 알리미 기기별 고유 id
 - secret: 비 알리미 기기별 고유 secret code

###### 내부 처리:
 - `./storage/LED/${id}/${date}.json`의 마지막 요소를 전송한다.

###### 반환 데이터:
 - red: rgb 데이터의 r값
 - green: rgb 데이터의 g값
 - blue: rgb 데이터의 b값

***