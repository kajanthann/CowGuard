// ================= server.js =================

import 'dotenv/config';
import mqtt from 'mqtt';
import { createRequire } from 'module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import sendEmail from './middleware/sendEmail.js';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// ================= Firebase Setup =================

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = getDatabase();


// ================= Farm Boundary =================

const BOUNDARY = [
  { lat: 6.853737, lng: 79.905842 },
  { lat: 6.852922, lng: 79.90577 },
  { lat: 6.851838, lng: 79.905475 },
  { lat: 6.851726, lng: 79.904571 },
  { lat: 6.851275, lng: 79.904172 },
  { lat: 6.851579, lng: 79.902837 },
  { lat: 6.851493, lng: 79.901925 },
  { lat: 6.852037, lng: 79.90164 },
  { lat: 6.851706, lng: 79.90075 },
  { lat: 6.851882, lng: 79.899242 },
  { lat: 6.852811, lng: 79.89972 },
  { lat: 6.852645, lng: 79.901454 },
  { lat: 6.852713, lng: 79.903075 },
  { lat: 6.855174, lng: 79.903442 },
  { lat: 6.855224, lng: 79.903987 },
  { lat: 6.855348, lng: 79.904339 },
  { lat: 6.855046, lng: 79.90641 },
];

function isInsideBoundary(point, polygon) {
  let inside = false;
  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
    j = i;
  }

  return inside;
}

// Track last known boundary status per cow (avoids duplicate alerts every packet)
const lastInsideStatus = {};


// ================= MQTT Setup (HiveMQ Cloud) =================

const MQTT_HOST   = process.env.MQTT_HOST;
const MQTT_PORT   = 8883;
const MQTT_USER   = process.env.MQTT_USER;
const MQTT_PASS   = process.env.MQTT_PASSWORD;
const MQTT_TOPIC  = 'cowguard/data';

const mqttOptions = {
  host: MQTT_HOST,
  port: MQTT_PORT,
  protocol: 'mqtts',
  username: MQTT_USER,
  password: MQTT_PASS,
  clientId: 'nodejs_backend_' + Math.random().toString(16).slice(2, 8),
  reconnectPeriod: 3000,
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

  if (!data.deviceID || data.latitude === undefined || data.longitude === undefined) {
    console.error('Missing required fields, skipping message');
    return;
  }

  console.log('');
  console.log('==============================');
  console.log('NEW DATA RECEIVED');
  console.log('==============================');
  console.log('Device ID   :', data.deviceID);
  console.log('Packet ID   :', data.packetID);
  console.log('Latitude    :', data.latitude);
  console.log('Longitude   :', data.longitude);
  console.log('Speed       :', data.speed, 'm/s');
  console.log('Date        :', data.date);
  console.log('Time        :', data.time);
  console.log('------------------------------');

  try {
    await saveToFirebase(data);
    console.log(`Saved to Firebase --> cows/${data.deviceID}`);
  } catch (err) {
    console.error('Firebase write failed:', err.message);
  }

  try {
    await checkGeofenceAndAlert(data);
  } catch (err) {
    console.error('Alert check failed:', err.message);
  }

  console.log('==============================');
});


// ================= Firebase Write Logic (cow data) =================

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

  await db.ref(`cows/${cowID}`).set(record);
}


// ================= Geofence Alert Logic =================

async function checkGeofenceAndAlert(data) {
  const cowID = data.deviceID;

  const point = { lat: data.latitude, lng: data.longitude };
  const inside = isInsideBoundary(point, BOUNDARY);

  const previousInside = lastInsideStatus[cowID];

  // Only fire when status CHANGES (prevents duplicate alerts/emails every packet)
  if (previousInside !== undefined && previousInside !== inside) {
    if (!inside) {
      // Cow just left the boundary
      const alertData = {
        type: 'GEOFENCE_EXIT',
        message: `${cowID} has left the farm boundary`,
        latitude: data.latitude,
        longitude: data.longitude,
        date: data.date,
        time: data.time,
      };

      await pushAlert(cowID, alertData);
      console.log(`ALERT --> ${cowID} left the boundary!`);

      await sendBoundaryAlertEmail(cowID, alertData);

    } else {
      // Cow returned inside the boundary
      const alertData = {
        type: 'GEOFENCE_ENTER',
        message: `${cowID} has returned inside the farm boundary`,
        latitude: data.latitude,
        longitude: data.longitude,
        date: data.date,
        time: data.time,
      };

      await pushAlert(cowID, alertData);
      console.log(`${cowID} returned inside the boundary`);

      // Email not sent for re-entry, only for exit. Remove the 'if' below to also email on entry.
    }
  }

  lastInsideStatus[cowID] = inside;
}


// ================= Push Alert to Firebase =================

async function pushAlert(cowID, alertData) {
  const alertRecord = {
    ...alertData,
    createdAt: Date.now(),
  };

  await db.ref(`alerts/${cowID}`).push(alertRecord);
}


// ================= Send Email Notification =================

async function sendBoundaryAlertEmail(cowID, alertData) {
  const toEmail = process.env.ALERT_EMAIL_TO;

  if (!toEmail) {
    console.error('ALERT_EMAIL_TO not set in .env, skipping email');
    return;
  }

  const subject = `CowGuard Alert: ${cowID} left the farm boundary`;

  const html = `
    <h2>Boundary Alert</h2>
    <p><b>Cow ID:</b> ${cowID}</p>
    <p><b>Status:</b> Left the farm boundary</p>
    <p><b>Latitude:</b> ${alertData.latitude}</p>
    <p><b>Longitude:</b> ${alertData.longitude}</p>
    <p><b>Date:</b> ${alertData.date}</p>
    <p><b>Time:</b> ${alertData.time}</p>
    <p>Please check the CowGuard dashboard for live location.</p>
  `;

  try {
    await sendEmail(toEmail, subject, html);
    console.log(`Email sent to ${toEmail} for ${cowID}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}


// ================= Graceful Shutdown =================

process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.end(true, () => {
    console.log('MQTT client disconnected');
    process.exit(0);
  });
});