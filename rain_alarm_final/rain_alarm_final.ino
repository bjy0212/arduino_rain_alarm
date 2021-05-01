#include <SoftwareSerial.h> 
#define BT_RXD 10
#define BT_TXD 9 
SoftwareSerial esp(BT_RXD, BT_TXD); 

//LED 시작
#include <Adafruit_NeoPixel.h>              // 네오픽셀 라이브러리를 불러옵니다.
#define INPUT_PIN 2     // 디지털핀 어디에 연결했는지 입력

#define ledcount 15

Adafruit_NeoPixel strip = Adafruit_NeoPixel(ledcount, INPUT_PIN, NEO_GRB + NEO_KHZ800);
int pir = 7;
char val = NULL;
int pirState=LOW;
//LED 끝

boolean connected = false;

#define SSID    "00"
#define PASS    "06270000"
#define IP      "192.168.43.2"
#define PORT    3000

#define id      "leeeunji"
#define secret  "leeubin"

void led_change(int c, int r, int g, int b, int s = 0) {
    for(int i=s; i<c; i++){
        strip.setPixelColor(i, r, g, b);  // (A,R,G,B) A번째 LED를 RGB (0~255) 만큼의 밝기로 켭니다.
    }
    strip.show();
}

void setup() { 
    pinMode(pir,INPUT);
    strip.begin();
    led_change(ledcount,255,255,255);
    unsigned int i = 0;
    //Serial.begin(9600); 
    esp.begin(9600); 
    esp.setTimeout(10000);

    

    esp.println("AT");
    if(!esp.find("OK")) {
        //Serial.print("ESP8266 is alive\n");
    //else {
        //Serial.print("Module have no response\r\n");
        while(1);
    }
    //Serial.print("OK");
    
    esp.println("AT+RST");
    if(!esp.find("Ready"))
        //Serial.print("Reset is done\n");
    //else {
        //Serial.print("Reset failed\r\n");
        while(1);
    //}

    while(1){
        esp.println("AT+CWMODE=1");
        if(!esp.find("FAIL")) {
            //Serial.print("Station mode done\n");
            break;
        } /*else {
            //Serial.print("Station mode failed\r\n");
        }*/
    }

    esp.println("AT+CWQAP");

    boolean connected = false;
    for(int i = 0; i < ledcount; i++) {
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
        //Serial.write(esp.read());
        if(i++ > 4000) break;
    }

    esp.println("AT+CIPMUX=0");
    //Serial.println("\r\nsingle connection mode\r\n");
    //Serial.println("Strip OK");

    while(!connected) {
        Connect();
    }

    String cmd;
    
    cmd = "POST /sync HTTP/1.1\r\nid:";
    cmd += id;
    cmd += "\r\nsecret:";
    cmd += secret;
    //cmd += "\r\nrain:";
    //cmd += rain;
    cmd += "\r\n\r\n";
    //cmd = "GET / HTTP/1.1\r\n\r\n";
    
    esp.print("AT+CIPSEND=");
    esp.println(cmd.length());
    //Serial.print("AT+CIPSEND=");
    //Serial.println(cmd.length());

    if(esp.find(">")) {
        //Serial.print(">");
    } else {
        esp.println("AT+CIPCLOSE");
        //Serial.println("connection timeout");
        connected = false;
        return;
    }

    esp.print(cmd);
    //Serial.print(cmd);

    i = 0;
    char ch = NULL;
    boolean flag = false;
    while(i < 60000) {
        i++;
        if(esp.available()){
            int buff = esp.read();
            //Serial.write(buff);
            if(flag) {
                ch = (char)(buff);
                flag = false;
            }
            if((char)(buff) == '*') {
                flag = true;
            }
        }
    }

    while(!connected) {
        Connect();
    }

    led_change(ledcount,0,255,255);
} 

void Connect() {
    String cmd = "AT+CIPSTART=\"TCP\",\"";
    cmd += IP;
    cmd += "\",";
    cmd += PORT;
    esp.println(cmd);
    //Serial.println(cmd);

    if(esp.find("Error")) connected = false;
    else connected = true;
}

int input = 0;//와이파이 값 받는 부분!
int time = 0;
int light = 0;

void loop() { 
    time++;
    if(light > 0) light--;
    
    //모션 LED 시작
    int val = digitalRead(pir);
    //Serial.println(val);
    
    //input=//Serial.parseInt();
    ////Serial.print("input");
    ////Serial.println(input);
    //  if(val == HIGH) time = 15;
    if(val==1){
        light = 50;
        if(input==1){
            for(int i=0; i<ledcount; i++) { 
                strip.setPixelColor(i, 0, 84, 225);
            }
            strip.show();
        }
        else{
            for(int i=0; i<ledcount; i++) {
                strip.setPixelColor(i, 255, 25, 0);
            }
            strip.show();  
        }
    }
    else{
        for(int i=0; i<ledcount; i++) { 
            strip.setPixelColor(i, 0, 0, 0);
        }
        strip.show();   
    }
    //모션 LED 끝

    if(light == 0) {
        for(int i=0; i<ledcount; i++){
            strip.setPixelColor(i, 0, 0, 0);  // (A,R,G,B) A번째 LED를 RGB (0~255) 만큼의 밝기로 켭니다.
        }
        strip.show();
    }

    if(time == 100) {
        led_change(ledcount, 0, 255, 0);
        time = 0;

        if(!connected) Connect();
    
        //send

        String cmd;
    
        cmd = "POST /sync HTTP/1.1\r\nid:";
        cmd += id;
        cmd += "\r\nsecret:";
        cmd += secret;
        //cmd += "\r\nrain:";
        //cmd += rain;
        cmd += "\r\n\r\n";
        //cmd = "GET / HTTP/1.1\r\n\r\n";
        
        esp.print("AT+CIPSEND=");
        esp.println(cmd.length());
        //Serial.print("AT+CIPSEND=");
        //Serial.println(cmd.length());
    
        if(esp.find(">")) {
            //Serial.print(">");
        } else {
            esp.println("AT+CIPCLOSE");
            //Serial.println("connection timeout");
            connected = false;
            return;
        }
    
        esp.print(cmd);
        //Serial.print(cmd);
    
        unsigned int i = 0;
        char ch = NULL;
        boolean flag = false;
        while(i < 60000) {
            i++;
            if(esp.available()){
                int buff = esp.read();
                //Serial.write(buff);
                if(flag) {
                    ch = (char)(buff);
                    flag = false;
                }
                if((char)(buff) == '*') {
                    flag = true;
                }
            }
        }
        //Serial.println("\n[출력]");
        //Serial.println((String)ch == NULL ? "통신 오류" : (String)ch);

        if(ch <= '9' && ch >= '0') {
            input = (int)(ch - '0');
        }

        led_change(ledcount, 0, 0, 0);
    }
    
    delay(100);
}

boolean connectWiFi() {
    String cmd = "AT+CWJAP=\"";
    cmd += SSID;
    cmd += "\",\"";
    cmd += PASS;
    cmd += "\"";

    //Serial.println(cmd);
    esp.println(cmd);

    if(esp.find("OK")) {
        //Serial.println("OK, Connected to WiFi");
        return true;
    } else {
        //Serial.println("Can not connect to the WiFi");
        return false;
    }
}
