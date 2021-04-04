//LED 시작
#include <Adafruit_NeoPixel.h>              // 네오픽셀 라이브러리를 불러옵니다.
#define INPUT_PIN 2   

#define ledcount 19

Adafruit_NeoPixel strip = Adafruit_NeoPixel(ledcount, INPUT_PIN, NEO_GRB + NEO_KHZ800);

void led_change(int c, int r, int g, int b, int s = 0) {
  for(int i=s; i<c; i++){
    strip.setPixelColor(i, r, g, b);  // (A,R,G,B) A번째 LED를 RGB (0~255) 만큼의 밝기로 켭니다.
  }
  strip.show();
}
//LED 끝

void setup() {
  strip.begin();
  led_change(ledcount,255,0,0);

}

void loop() {
  // put your main code here, to run repeatedly:

}
