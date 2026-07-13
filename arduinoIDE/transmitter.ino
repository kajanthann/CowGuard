#include <SPI.h>
#include <LoRa.h>
#include <TinyGPSPlus.h>


// ================= LoRa =================

#define SS_PIN    5
#define RST_PIN   14
#define DIO0_PIN  2

#define SCK_PIN   18
#define MISO_PIN  19
#define MOSI_PIN  23


// ================= GPS =================

#define GPS_RX 16
#define GPS_TX 17

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

int packetID = 0;
String cowID = "COW01";

// ================= Timing =================
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000;   // send every 5 sec, non-blocking


void setup()
{
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==============================");
  Serial.println("GPS + LoRa Cow Tracker");
  Serial.println("==============================");

  // GPS UART
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // LoRa SPI
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  LoRa.setPins(SS_PIN, RST_PIN, DIO0_PIN);

  if (!LoRa.begin(433E6))
  {
    Serial.println("LoRa Failed!");
    while (1);
  }

  LoRa.setSyncWord(0xA5);
  LoRa.setTxPower(20);           // PA_BOOST pin used by default
  LoRa.setSpreadingFactor(12);
  LoRa.setSignalBandwidth(125E3);
  LoRa.enableCrc();

  Serial.println("LoRa Ready");
}


// Converts GPS UTC date/time to Sri Lanka Time (UTC +5:30)
// and returns zero-padded strings (YYYY-MM-DD, HH:MM:SS)
void getLocalDateTime(String &dateStr, String &timeStr)
{
  int year   = gps.date.year();
  int month  = gps.date.month();
  int day    = gps.date.day();
  int hour   = gps.time.hour();
  int minute = gps.time.minute();
  int second = gps.time.second();

  // Add Sri Lanka offset: +5 hours 30 minutes
  minute += 30;
  hour   += 5;

  if (minute >= 60)
  {
    minute -= 60;
    hour += 1;
  }

  if (hour >= 24)
  {
    hour -= 24;
    day += 1;

    int daysInMonth[] = {31,28,31,30,31,30,31,31,30,31,30,31};
    bool leap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
    if (leap) daysInMonth[1] = 29;

    if (day > daysInMonth[month - 1])
    {
      day = 1;
      month += 1;
      if (month > 12)
      {
        month = 1;
        year += 1;
      }
    }
  }

  char dateBuf[11];
  sprintf(dateBuf, "%04d-%02d-%02d", year, month, day);
  dateStr = String(dateBuf);

  char timeBuf[9];
  sprintf(timeBuf, "%02d:%02d:%02d", hour, minute, second);
  timeStr = String(timeBuf);
}


void loop()
{
  // Always keep feeding the GPS parser - never block this with delay()
  while (gpsSerial.available())
  {
    gps.encode(gpsSerial.read());
  }

  // Non-blocking 5-second interval
  if (millis() - lastSendTime >= SEND_INTERVAL)
  {
    lastSendTime = millis();

    if (!gps.location.isValid())
    {
      Serial.println("Waiting for GPS fix...");
      return;
    }

    float latitude  = gps.location.lat();
    float longitude = gps.location.lng();
    float altitude  = gps.altitude.isValid() ? gps.altitude.meters() : 0.0;
    float speed     = gps.speed.isValid() ? gps.speed.mps() : 0.0;
    int   satellites = gps.satellites.isValid() ? gps.satellites.value() : 0;

    // NOTE: TinyGPSPlus does not expose a hdop() function.
    // gps.hdop.value() returns HDOP * 100, so divide by 100.0
    float hdop = gps.hdop.isValid() ? gps.hdop.value() / 100.0 : 0.0;

    String date, time;
    getLocalDateTime(date, time);

    String packet =
      "ID:" + cowID +
      ",PKT:" + String(packetID) +
      ",LAT:" + String(latitude, 6) +
      ",LON:" + String(longitude, 6) +
      ",ALT:" + String(altitude, 1) +
      ",SPD:" + String(speed, 2) +
      ",SAT:" + String(satellites) +
      ",HDOP:" + String(hdop, 2) +
      ",DATE:" + date +
      ",TIME:" + time;

    Serial.println("------------------------------");
    Serial.println(packet);

    LoRa.beginPacket();
    LoRa.print(packet);
    LoRa.endPacket();

    Serial.println("Packet Sent");

    packetID++;
  }
}
