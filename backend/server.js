// ================= server.js =================

import 'dotenv/config';
import mqtt from 'mqtt';
import { createRequire } from 'module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// ================= Firebase Setup =================

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = getDatabase();


// ================= MQTT Setup (HiveMQ Cloud) =================

const MQTT_HOST   = process.env.MQTT_HOST;   // xxxxxxxx.s1.eu.hivemq.cloud
const MQTT_PORT   = 8883;
const MQTT_USER   = process.env.MQTT_USER;
const MQTT_PASS   = process.env.MQTT_PASSWORD;
const MQTT_TOPIC  = 'cowguard/data';

const mqttOptions = {
  host: MQTT_HOST,
  port: MQTT_PORT,
  protocol: 'mqtts',       // TLS
  username: MQTT_USER,
  password: MQTT_PASS,
  clientId: 'nodejs_backend_' + Math.random().toString(16).slice(2, 8),
  reconnectPeriod: 3000,   // auto-reconnect every 3s if dropped
};

const client = mqtt.connect(mqttOptions);

client.on('connect', () => {
  console.log('Connected to HiveMQ Cloud');

  client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
    if (err) {
      console.error('Subscribe failed:', err);
    } else {
      console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
    }
  });
});

client.on('error', (err) => {
  console.error('MQTT Connection Error:', err);
});

client.on('reconnect', () => {
  console.log('Reconnecting to HiveMQ Cloud...');
});

client.on('close', () => {
  console.log('MQTT connection closed');
});


// ================= Handle Incoming Messages =================

client.on('message', async (topic, message) => {
  let data;

  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    console.error('Invalid JSON, skipping message:', err.message);
    return;
  }

  // Basic validation
  if (!data.deviceID || data.latitude === undefined || data.longitude === undefined) {
    console.error('Missing required fields, skipping message');
    return;
  }

  // -------- Print formatted data to console --------
  console.log('');
  console.log('==============================');
  console.log('NEW DATA RECEIVED');
  console.log('==============================');
  console.log('Topic       :', topic);
  console.log('Device ID   :', data.deviceID);
  console.log('Packet ID   :', data.packetID);
  console.log('Latitude    :', data.latitude);
  console.log('Longitude   :', data.longitude);
  console.log('Altitude    :', data.altitude, 'm');
  console.log('Speed       :', data.speed, 'm/s');
  console.log('Satellites  :', data.satellites);
  console.log('HDOP        :', data.hdop);
  console.log('Date        :', data.date);
  console.log('Time        :', data.time);
  console.log('RSSI        :', data.rssi, 'dBm');
  console.log('SNR         :', data.snr, 'dB');
  console.log('------------------------------');

  try {
    await saveToFirebase(data);
    console.log(`Saved to Firebase --> cows/${data.deviceID}`);
  } catch (err) {
    console.error('Firebase write failed:', err.message);
  }

  console.log('==============================');
});


// ================= Firebase Write Logic =================

async function saveToFirebase(data) {
  const cowID = data.deviceID;
  const timestamp = Date.now();

  const record = {
    packetID: data.packetID,
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    speed: data.speed,
    satellites: data.satellites,
    hdop: data.hdop,
    date: data.date,
    time: data.time,
    rssi: data.rssi,
    snr: data.snr,
    receivedAt: timestamp
  };

  // Write directly under cows/{cowID} - only the latest data for that cow
  await db.ref(`cows/${cowID}`).set(record);
}


// ================= Graceful Shutdown =================

process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.end(true, () => {
    console.log('MQTT client disconnected');
    process.exit(0);
  });
});