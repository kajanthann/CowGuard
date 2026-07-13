#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>


// ================= LoRa =================

#define SS_PIN    5
#define RST_PIN   14
#define DIO0_PIN  2

#define SCK_PIN   18
#define MISO_PIN  19
#define MOSI_PIN  23


// ================= WiFi =================

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";


// ================= HiveMQ Cloud MQTT =================

const char* MQTT_BROKER    = "YOUR_HIVEMQ_CLUSTER_URL";
const int   MQTT_PORT      = 8883;   // TLS port
const char* MQTT_USER      = "YOUR_MQTT_USERNAME";
const char* MQTT_PASSWORD  = "YOUR_MQTT_PASSWORD";

const char* MQTT_CLIENT_ID = "ESP32_CowGuard_Receiver";

const char* MQTT_TOPIC     = "cowguard/data";


WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);


// ================= WiFi Connect =================

void connectWiFi()
{
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi Connected. IP: ");
  Serial.println(WiFi.localIP());
}


// ================= MQTT Connect =================

void connectMQTT()
{
  while (!mqttClient.connected())
  {
    Serial.print("Connecting to HiveMQ Cloud...");

    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD))
    {
      Serial.println("Connected!");
    }
    else
    {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 3s...");
      delay(3000);
    }
  }
}


void setup()
{
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==============================");
  Serial.println("LoRa GPS RECEIVER + MQTT");
  Serial.println("==============================");

  // ---- WiFi ----
  connectWiFi();

  // ---- TLS ----
  // NOTE: setInsecure() skips certificate validation (fine for testing).
  // For production, use setCACert() with HiveMQ's root CA certificate.
  secureClient.setInsecure();

  // ---- MQTT ----
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  connectMQTT();

  // ---- LoRa ----
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  LoRa.setPins(SS_PIN, RST_PIN, DIO0_PIN);

  if (!LoRa.begin(433E6))
  {
    Serial.println("LoRa Failed!");
    while (1);
  }

  LoRa.setSyncWord(0xA5);
  LoRa.setSpreadingFactor(12);
  LoRa.setSignalBandwidth(125E3);
  LoRa.enableCrc();

  Serial.println("LoRa RX Ready");
}


// ================= ACK =================

void sendACK(int pktID)
{
  String ack = "ACK:" + String(pktID);

  LoRa.beginPacket();
  LoRa.print(ack);
  LoRa.endPacket();

  Serial.print("ACK Sent --> ");
  Serial.println(ack);
}


// ================= Extract Data =================

String getValue(String data, String key)
{
  int start = data.indexOf(key);
  if (start == -1) return "";

  start += key.length();

  int end = data.indexOf(",", start);
  if (end == -1) end = data.length();

  return data.substring(start, end);
}


// ================= Build JSON Payload =================

String buildJsonPayload(
  String deviceID, String packetIDStr, String latitude, String longitude,
  String altitude, String speed, String satellites, String hdop,
  String date, String time, float rssi, float snr)
{
  String json = "{";
  json += "\"deviceID\":\"" + deviceID + "\",";
  json += "\"packetID\":" + packetIDStr + ",";
  json += "\"latitude\":" + latitude + ",";
  json += "\"longitude\":" + longitude + ",";
  json += "\"altitude\":" + altitude + ",";
  json += "\"speed\":" + speed + ",";
  json += "\"satellites\":" + satellites + ",";
  json += "\"hdop\":" + hdop + ",";
  json += "\"date\":\"" + date + "\",";
  json += "\"time\":\"" + time + "\",";
  json += "\"rssi\":" + String(rssi, 1) + ",";
  json += "\"snr\":" + String(snr, 1);
  json += "}";

  return json;
}


void loop()
{
  // Keep MQTT connection alive
  if (!mqttClient.connected())
  {
    connectMQTT();
  }
  mqttClient.loop();


  int packetSize = LoRa.parsePacket();

  if (packetSize)
  {
    String data = "";

    while (LoRa.available())
    {
      data += (char)LoRa.read();
    }

    Serial.println();
    Serial.println("==============================");
    Serial.println("NEW GPS DATA RECEIVED");
    Serial.println("==============================");
    Serial.println(data);

    // -------- Extract Data --------
    String deviceID    = getValue(data, "ID:");
    String packetIDStr = getValue(data, "PKT:");
    String latitude    = getValue(data, "LAT:");
    String longitude   = getValue(data, "LON:");
    String altitude    = getValue(data, "ALT:");
    String speed       = getValue(data, "SPD:");
    String satellites  = getValue(data, "SAT:");
    String hdop        = getValue(data, "HDOP:");
    String date        = getValue(data, "DATE:");
    String time        = getValue(data, "TIME:");

    float rssi = LoRa.packetRssi();
    float snr  = LoRa.packetSnr();

    Serial.println("------------------------------");
    Serial.print("Device ID  : "); Serial.println(deviceID);
    Serial.print("Packet ID  : "); Serial.println(packetIDStr);
    Serial.print("Latitude   : "); Serial.println(latitude);
    Serial.print("Longitude  : "); Serial.println(longitude);
    Serial.print("Altitude   : "); Serial.print(altitude);   Serial.println(" m");
    Serial.print("Speed      : "); Serial.print(speed);      Serial.println(" m/s");
    Serial.print("Satellites : "); Serial.println(satellites);
    Serial.print("HDOP       : "); Serial.println(hdop);
    Serial.print("Date (SLST): "); Serial.println(date);
    Serial.print("Time (SLST): "); Serial.println(time);

    Serial.println("------------------------------");
    Serial.print("RSSI       : "); Serial.print(rssi); Serial.println(" dBm");
    Serial.print("SNR        : "); Serial.print(snr);  Serial.println(" dB");

    // -------- Publish to HiveMQ Cloud --------
    String payload = buildJsonPayload(
      deviceID, packetIDStr, latitude, longitude,
      altitude, speed, satellites, hdop, date, time, rssi, snr
    );

    if (mqttClient.publish(MQTT_TOPIC, payload.c_str()))
    {
      Serial.println("Published to HiveMQ --> " + payload);
    }
    else
    {
      Serial.println("MQTT Publish Failed!");
    }

    // -------- Send ACK --------
    if (packetIDStr != "")
    {
      sendACK(packetIDStr.toInt());
    }
  }
}