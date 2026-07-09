import '../models/cow.dart';
import '../models/device.dart';
import '../models/alert.dart';

/// Placeholder data service.
///
/// Right now this returns mock data so the UI is runnable immediately.
/// Swap the method bodies for either:
///   1) Firebase Realtime Database streams (firebase_database package), or
///   2) HTTP calls to your Node.js REST endpoints (see ApiConfig).
///
/// Keeping this as a single class means screens don't care which one you pick.
class FirebaseService {
  // ---- COWS ----
  Stream<List<Cow>> cowsStream() async* {
    // TODO: replace with real-time listener, e.g.:
    // FirebaseDatabase.instance.ref('cows').onValue.map((event) => ...);
    while (true) {
      yield _mockCows();
      await Future.delayed(const Duration(seconds: 5));
    }
  }

  Future<List<Cow>> fetchCows() async => _mockCows();

  List<Cow> _mockCows() {
    return [
      Cow(
        id: 'cow1',
        name: 'Bella',
        tagNumber: 'TAG-001',
        latitude: 6.9271,
        longitude: 79.8612,
        batteryLevel: 82,
        signalStrength: 76,
        isInsideGeofence: true,
        isMoving: true,
        lastUpdated: DateTime.now(),
      ),
      Cow(
        id: 'cow2',
        name: 'Daisy',
        tagNumber: 'TAG-002',
        latitude: 6.9285,
        longitude: 79.8625,
        batteryLevel: 18,
        signalStrength: 45,
        isInsideGeofence: false,
        isMoving: false,
        lastUpdated: DateTime.now(),
      ),
      Cow(
        id: 'cow3',
        name: 'Moo',
        tagNumber: 'TAG-003',
        latitude: 6.9260,
        longitude: 79.8600,
        batteryLevel: 64,
        signalStrength: 88,
        isInsideGeofence: true,
        isMoving: false,
        lastUpdated: DateTime.now(),
      ),
    ];
  }

  // ---- DEVICES ----
  Future<List<Device>> fetchDevices() async {
    return [
      Device(
        id: 'dev1',
        cowId: 'cow1',
        deviceCode: 'ESP32-A1B2',
        status: DeviceStatus.online,
        batteryLevel: 82,
        lastSeen: DateTime.now(),
      ),
      Device(
        id: 'dev2',
        cowId: 'cow2',
        deviceCode: 'ESP32-C3D4',
        status: DeviceStatus.lowBattery,
        batteryLevel: 18,
        lastSeen: DateTime.now().subtract(const Duration(minutes: 12)),
      ),
      Device(
        id: 'dev3',
        cowId: 'cow3',
        deviceCode: 'ESP32-E5F6',
        status: DeviceStatus.offline,
        batteryLevel: 64,
        lastSeen: DateTime.now().subtract(const Duration(hours: 2)),
      ),
    ];
  }

  // ---- ALERTS ----
  Future<List<AlertItem>> fetchAlerts() async {
    return [
      AlertItem(
        id: 'a1',
        cowId: 'cow2',
        cowName: 'Daisy',
        type: AlertType.boundaryViolation,
        severity: AlertSeverity.critical,
        message: 'Daisy has left the geofenced boundary',
        timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
      ),
      AlertItem(
        id: 'a2',
        cowId: 'cow2',
        cowName: 'Daisy',
        type: AlertType.lowBattery,
        severity: AlertSeverity.warning,
        message: 'Device battery at 18%',
        timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
      ),
      AlertItem(
        id: 'a3',
        cowId: 'cow3',
        cowName: 'Moo',
        type: AlertType.noMovement,
        severity: AlertSeverity.info,
        message: 'No movement detected for 30 minutes',
        timestamp: DateTime.now().subtract(const Duration(minutes: 35)),
      ),
    ];
  }
}