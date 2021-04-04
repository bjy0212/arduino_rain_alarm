#include <SoftwareSerial.h> 
#define BT_RXD 10
#define BT_TXD 9 
SoftwareSerial esp(BT_RXD, BT_TXD); 

#define SSID    "A90"
#define PASS    "20000212"
#define IP      "54.180.155.96"
#define PORT    53266

#define id      "leeeungi"
#define secret  "leeubin"

void setup() { 
  unsigned int i = 0;
  Serial.begin(9600); 
  esp.begin(9600); 
  esp.setTimeout(10000);

  esp.println("AT");
  if(esp.find("OK"))
    Serial.print("ESP8266 is alive\n");
  else {
    Serial.print("Module have no response\r\n");
    while(1);
  }
  
  esp.println("AT+RST");
  if(esp.find("Ready"))
    Serial.print("Reset is done\n");
  else {
    Serial.print("Reset failed\r\n");
    while(1);
  }

  while(1){
    esp.println("AT+CWMODE=1");
    if(!esp.find("FAIL")) {
      Serial.print("Station mode done\n");
      break;
    }
    else {
      Serial.print("Station mode failed\r\n");
    }
  }

  esp.println("AT+CWQAP");

  boolean connected = false;
  for(int i = 0; i < 5; i++) {
    if(connectWiFi()) {
      connected = true;
      break;
    }
  }

  if(!connected) {while(1);}
  delay(2000);

  esp.println("AT+CIFSR");
  while(1) {
    if(esp.available()) 
      Serial.write(esp.read());
    if(i++ > 4000) break;
  }

  esp.println("AT+CIPMUX=0");
  Serial.println("\r\nsingle connection mode\r\n");
} 

int is_rain = 0;

void loop() {
  //비센서 시작
  int time = 0;
  int waterSensorVal;
  int data[10] = {0};
  int inNum;
  int i;
  int index = 0;
  int up_check = 0;
  int down_check = 0;
  int count500 = 0;
  int flag = 0;
  while(time < 10){
    waterSensorVal = analogRead(A0);
    data[time] = waterSensorVal;
    Serial.println(waterSensorVal);
    delay(1000);
    time++;
  }
  for (i = 0; i < time-1; i++) {
    if(data[0]==0&&data[i]>=400){
       flag=1; 
       break;
    }
    if (data[i] >= 500) {
      count500++;
    }
    if (data[i] < data[i + 1]) {//증가할때 
      up_check++;
    }
    if (data[i] >= data[i + 1]) {//감소할때 
      down_check++;
    }
  }

  if(flag==1){
    is_rain=1;
    Serial.print(is_rain);
    Serial.println("//비가 안오다가 오기 시작함 ");
  } else {
    if (count500 >= 7) {
      if (down_check >= 6){
        is_rain = 0; //비가 그침
        Serial.print(is_rain);
        Serial.println(" //비가 내리다가 그침");
      } else {
        is_rain = 1;
        Serial.print(is_rain);
        Serial.println(" //비가 많이 내림 ");
      }
    } else if (up_check >= 5) {   //값이 증가 7이상 보이면
      is_rain = 1;    //비가 적당히 내림 400-500사이 
      Serial.print(is_rain);
      Serial.println(" //비가 적당히 내림 400~500사이 ");
    } else {
      is_rain = 0;
      Serial.print(is_rain);
      Serial.println(" //비가 안옴 ");
    }
  }
  //비센서 끝
  
  String cmd = "AT+CIPSTART=\"TCP\",\"";
    
  cmd += IP;
  cmd += "\",";
  cmd += PORT;
  esp.println(cmd);
  Serial.println(cmd);

  if(esp.find("Error")) return;

  //char rain = '1';

  cmd = "POST /data HTTP/1.1\r\nid:";
  cmd += id;
  cmd += "\r\nsecret:";
  cmd += secret;
  cmd += "\r\nrain:";
  cmd += (char)(is_rain + '0');
  cmd += "\r\n\r\n";
  //cmd = "GET / HTTP/1.1\r\n\r\n";
  
  esp.print("AT+CIPSEND=");
  esp.println(cmd.length());
  Serial.print("AT+CIPSEND=");
  Serial.println(cmd.length());

  if(esp.find(">")) {
    Serial.print(">");
  } else {
    esp.println("AT+CIPCLOSE");
    Serial.println("connection timeout");
    delay(1000);
    return;
  }

  esp.print(cmd);
  Serial.print(cmd);

  i = 0;
  char ch = NULL;
  boolean fla = false;
  while(i < 60000) {
    i++;
    if(esp.available()){
      int buff = esp.read();
      Serial.write(buff);
      if(fla) {
        ch = (char)(buff);
        fla = false;
        break;
      }
      if((char)(buff) == '*') {
        fla = true;
      }
    }
  }
  Serial.println("[출력]");
  Serial.println((String)ch == NULL ? "통신 오류" : (String)ch);
}
  
boolean connectWiFi() {
  String cmd = "AT+CWJAP=\"";
  cmd += SSID;
  cmd += "\",\"";
  cmd += PASS;
  cmd += "\"";

  Serial.println(cmd);
  esp.println(cmd);

  if(esp.find("OK")) {
    Serial.println("OK, Connected to WiFi");
    return true;
  } else {
    Serial.println("Can not connect to the WiFi");
    return false;
  }
}
