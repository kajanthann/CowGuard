#include <WiFi.h>
#include <TinyGPS++.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi
#define WIFI_SSID "Kajanthan"
#define WIFI_PASSWORD "trok0001"

// Firebase
#define API_KEY "AIzaSyDEzrhNyhBegR070CP8r2VjJhNwR3WN4w"
#define DATABASE_URL "https://cowguard-16b25-default-rtdb.asia-southeast1.firebasedatabase.app/"

// GPS
TinyGPSPlus gps;
HardwareSerial GPS_Serial(2);

#define RXD2 16
#define TXD2 17

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {

  Serial.begin(115200);

  GPS_Serial.begin(9600, SERIAL_8N1, RXD2, TXD2);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected ✔");

  // Firebase config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // IMPORTANT FIX
  auth.user.email = "";
  auth.user.password = "";

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase Ready ✔");
}

void loop() {

  while (GPS_Serial.available()) {
    gps.encode(GPS_Serial.read());
  }

  if (gps.location.isUpdated()) {

    String base = "/devices/device01/";

    Serial.println("\n========== GPS DATA ==========");
    Serial.print("Latitude  : "); Serial.println(gps.location.lat(), 6);
    Serial.print("Longitude : "); Serial.println(gps.location.lng(), 6);
    Serial.print("Speed     : "); Serial.println(gps.speed.kmph());
    Serial.print("Altitude  : "); Serial.println(gps.altitude.meters());
    Serial.print("Satellites: "); Serial.println(gps.satellites.value());
    Serial.println("===============================");

    bool ok1 = Firebase.RTDB.setFloat(&fbdo, base + "latitude", gps.location.lat());
    bool ok2 = Firebase.RTDB.setFloat(&fbdo, base + "longitude", gps.location.lng());

    Firebase.RTDB.setFloat(&fbdo, base + "speed", gps.speed.kmph());
    Firebase.RTDB.setFloat(&fbdo, base + "altitude", gps.altitude.meters());
    Firebase.RTDB.setInt(&fbdo, base + "satellites", gps.satellites.value());

    if (ok1 && ok2) {
      Serial.println("Firebase Upload ✔ SUCCESS");
    } else {
      Serial.println("Firebase Upload ❌ FAILED");
      Serial.println(fbdo.errorReason());
    }

    Serial.println("-------------------------------");
  }
}