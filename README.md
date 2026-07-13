# CowGuard - Smart Livestock Monitoring System

CowGuard is a comprehensive IoT solution for real-time monitoring and tracking of livestock (cattle) across farms. It combines GPS tracking, LoRa wireless communication, cloud infrastructure, and intuitive user interfaces to provide farmers with complete visibility over their herds.

## 📋 Project Overview

CowGuard consists of multiple integrated components working together to deliver real-time livestock tracking:

```
┌─────────────────────────────────────────────────────────────┐
│                    CowGuard Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [GPS+LoRa Trackers]  ──LoRa──>  [Base Station (ESP32)]     │
│  (On Cows)                        (PlatformIO)              │
│        ↓                                ↓                   │
│    433 MHz                          MQTT (8883)             │
│                                        ↓                    │
│                          [HiveMQ Cloud Broker]              │
│                                        ↓                    │
│                    [Backend Server (Node.js)]               │
│                       Firebase Admin SDK                    │
│                                        ↓                    │
│                    [Firebase Realtime Database]             │
│                                                             │
│                                   ↓                         │
│                            [Web Dashboard]                  │
│                             (React + Vite)                  │
│                               Leaflet Maps                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Project Structure

### Core Components

- **`backend/`** - Node.js MQTT broker subscriber and Firebase gateway
- **`dashboard/`** - Web-based admin dashboard (React + Vite)
- **`BaseStation/`** - ESP32 LoRa receiver (PlatformIO)
- **`arduinoIDE/`** - Arduino sketches for wearable LoRa GPS trackers

## 🔧 Component Details

### 1. **GPS + LoRa Trackers** (`arduinoIDE/`)

**Purpose**: Real-time location tracking of individual cows

**Files**:
- `transmitter.ino` - Main tracker firmware
- `receiver.ino` - LoRa receiver logic (base station)

**Key Features**:
- **GPS Module Integration**: Reads real-time coordinates via TinyGPS+ library
- **LoRa Communication**: Transmits position data at 433 MHz (non-blocking intervals)
- **Local Time Conversion**: Converts UTC to Sri Lanka Time (UTC +5:30)
- **Data Fields Transmitted**:
  - Device ID (e.g., COW01)
  - Packet ID (sequence counter)
  - Latitude & Longitude
  - Altitude
  - Speed
  - Satellite count
  - HDOP (horizontal dilution of precision)
  - Date & Time

**Hardware**:
- ESP32 microcontroller
- GPS module (9600 baud UART on pins 16/17)
- LoRa module (SPI pins: SCK=18, MISO=19, MOSI=23, SS=5)
- LoRa control pins: RST=14, DIO0=2
- Transmission: 433 MHz, 20 dBm power, SF12, 125 kHz bandwidth

---

### 2. **Base Station** (`BaseStation/`)

**Purpose**: Receives LoRa transmissions and forwards to MQTT broker

**Technology**: PlatformIO + Arduino framework for ESP32

**Key Features**:
- Listens to incoming LoRa packets from cow trackers
- Parses and validates GPS data
- Publishes to HiveMQ Cloud MQTT broker
- Automatic reconnection (3-second intervals)

**Configuration**: `platformio.ini`
```
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
```

---

### 3. **Backend Server** (`backend/`)

**Purpose**: Central hub that receives MQTT data and stores in Firebase

**Technology**: Node.js with Express, Firebase Admin SDK, and MQTT

**Key Dependencies**:
- `firebase-admin` - Firebase Realtime Database
- `mqtt` - MQTT client for HiveMQ Cloud subscription
- `dotenv` - Environment configuration

**Data Flow**:
1. Subscribes to MQTT topic: `cowguard/data`
2. Receives GPS coordinates from base station
3. Validates data integrity (deviceID, latitude, longitude required)
4. Stores in Firebase Realtime Database
5. Logs received data for monitoring

**MQTT Configuration**:
- Broker: HiveMQ Cloud (MQTTS - TLS encrypted)
- Port: 8883
- Topic: `cowguard/data`
- Auto-reconnection enabled (3-second intervals)

**Authentication**:
- JWT token-based authentication via `authAdmin` middleware
- Email notification support via `sendEmail` middleware

**Environment Variables** (`.env` required):
```
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
MQTT_HOST=xxxxxxxx.s1.eu.hivemq.cloud
MQTT_USER=your_mqtt_user
MQTT_PASSWORD=your_mqtt_password
JWT_SECRET=your_jwt_secret
```

**Scripts**:
```bash
npm run start  # Run server.js
npm run dev    # Run with nodemon (development)
```

---

### 4. **Web Dashboard** (`dashboard/`)

**Purpose**: Real-time visualization and management interface for farmers

**Technology**: React 19 + Vite with Tailwind CSS

**Key Dependencies**:
- `react-leaflet` - Interactive maps with location display
- `firebase` - Real-time data synchronization
- `react-router-dom` - Multi-page navigation
- `tailwindcss` - Utility-first styling
- `react-icons` - UI icons

**Pages**:
- **Login** (`pages/Login.jsx`) - Authentication screen
- **Live Map** (`pages/LiveMap.jsx`) - Real-time cow locations on interactive map
- **Cows** (`pages/Cows.jsx`) - Cow inventory management
- **Devices** (`pages/Devices.jsx`) - Tracker hardware management
- **Alerts** (`pages/Alerts.jsx`) - Geofence and anomaly alerts

**Components**:
- `Header.jsx` - Top navigation bar
- `Sidebar.jsx` - Desktop side menu (hidden on mobile)
- `BottomNav.jsx` - Mobile bottom navigation
- `MobileSummaryBar.jsx` - Mobile dashboard summary
- `FarmMap.jsx` - Map display logic
- `CowMapModal.jsx` - Cow details popup
- `AddCow.jsx` - Cow registration form
- `Boundary.jsx` - Error boundary component

**Firebase Integration**: Reads real-time cow positions from database

**Responsive Design**:
- Desktop: Sidebar + main content
- Mobile: Full-width with bottom navigation

**Scripts**:
```bash
npm run dev     # Vite dev server
npm run build   # Production build
npm run lint    # ESLint validation
npm run preview # Preview production build
```



## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+) - Backend server
- **Arduino IDE** or **VS Code + PlatformIO** - Firmware upload
- **Firebase Project** - Real-time database setup
- **HiveMQ Cloud Account** - MQTT broker

### Installation

#### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your credentials
npm run dev
```

#### 2. Dashboard Setup

```bash
cd dashboard
npm install
npm run dev  # Starts on http://localhost:5173
```

#### 3. Firmware Upload

**Base Station (ESP32)**:
```bash
cd BaseStation
platformio run --target upload  # or use VS Code
```

**Cow Trackers (Arduino)**:
- Open `arduinoIDE/transmitter.ino` in Arduino IDE
- Select board: ESP32 Dev Module
- Configure COM port and upload

### Environment Configuration

Create `.env` files in `backend/` and `dashboard/`:

**backend/.env**:
```
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
MQTT_HOST=broker.hivemq.cloud
MQTT_USER=your_username
MQTT_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

**dashboard/.env**:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_DATABASE_URL=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx
```

---

## 📊 Data Flow

1. **Cow Tracker** sends GPS + LoRa packet every 5 seconds
2. **Base Station** receives LoRa transmission → converts to JSON
3. **MQTT Publish** to HiveMQ Cloud: `cowguard/data`
4. **Backend Server** subscribes and validates data
5. **Firebase Write** updates cow location in Realtime Database
6. **Dashboard** listens for real-time updates
7. **Map Display** updates with new coordinates

**Sample Data Packet**:
```json
{
  "deviceID": "COW01",
  "packetID": 42,
  "latitude": 6.9271,
  "longitude": 80.7789,
  "altitude": 542,
  "speed": 2.1,
  "satellites": 12,
  "hdop": 0.8,
  "date": "2026-07-13",
  "time": "14:35:22"
}
```

---

## 🔐 Security

- **JWT Authentication**: Token-based API access
- **MQTT over TLS**: Encrypted broker communication (port 8883)
- **Firebase Rules**: Restrict database access to authenticated users
- **Environment Variables**: Sensitive credentials never committed to git

---

## 📱 Supported Platforms

| Component | Platforms |
|-----------|-----------|
| Backend | Linux, macOS, Windows (Node.js) |
| Dashboard | Chrome, Firefox, Safari, Edge |

| Base Station | ESP32 boards |
| Trackers | Arduino-compatible microcontrollers |

---

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon
```

### Dashboard Development
```bash
cd dashboard
npm run dev  # Hot reload enabled
npm run lint # Check code quality
```

### Firmware Development
Use PlatformIO extension in VS Code for ESP32, or Arduino IDE for Arduino boards.

---

## 🐛 Troubleshooting

### MQTT Connection Issues
- Verify HiveMQ Cloud credentials in `.env`
- Check internet connectivity
- Ensure firewall allows port 8883 (TLS)

### Firebase Connection Errors
- Verify `serviceAccountKey.json` is present in `backend/`
- Check database URL format
- Confirm Firebase rules allow read/write

### Map Not Loading (Dashboard)
- Verify Leaflet/Google Maps API keys
- Check internet connectivity
- Clear browser cache

### LoRa Reception Problems
- Verify antenna connections on trackers and base station
- Check frequency (433 MHz) matches between devices
- Reduce distance between devices for testing
- Review console logs for LoRa initialization errors

---

## 📈 Performance Metrics

- **GPS Update Interval**: 5 seconds (configurable)
- **MQTT Latency**: <500ms (depends on internet)
- **Firebase Sync**: Real-time (milliseconds)
- **Map Refresh**: Near real-time on all clients
- **LoRa Range**: Up to 10km (open field, optimal conditions)

---

## 📝 License

ISC

---

## 👥 Authors & Contributors

- CowGuard Development Team

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push to branch
5. Create Pull Request

---

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository or contact the development team.

---

## 🔄 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Backend Server | 256MB RAM | 512MB+ RAM |
| Dashboard | 100MB disk | 500MB+ disk |
| Base Station | ESP32 board | ESP32-DevKitC |
| Trackers | Arduino-compatible | ESP32 or Arduino Uno |

---

## 📚 Documentation

For detailed component documentation:
- Backend: See `backend/middleware/` for authentication details
- Dashboard: See `dashboard/src/pages/` for page structures
- Firmware: See `BaseStation/src/main.cpp` for ESP32 configuration

---

**Last Updated**: July 2026  
**Status**: Active Development
