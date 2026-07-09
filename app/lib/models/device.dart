enum DeviceStatus { online, offline, lowBattery }

class Device {
  final String id;
  final String cowId;
  final String deviceCode;   // e.g. ESP32 MAC or LoRa node ID
  final DeviceStatus status;
  final double batteryLevel;
  final DateTime lastSeen;

  Device({
    required this.id,
    required this.cowId,
    required this.deviceCode,
    required this.status,
    required this.batteryLevel,
    required this.lastSeen,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id']?.toString() ?? '',
      cowId: json['cowId']?.toString() ?? '',
      deviceCode: json['deviceCode'] ?? '-',
      status: _statusFromString(json['status']),
      batteryLevel: (json['batteryLevel'] ?? 0).toDouble(),
      lastSeen: json['lastSeen'] != null
          ? DateTime.parse(json['lastSeen'])
          : DateTime.now(),
    );
  }

  static DeviceStatus _statusFromString(String? s) {
    switch (s) {
      case 'online':
        return DeviceStatus.online;
      case 'lowBattery':
        return DeviceStatus.lowBattery;
      default:
        return DeviceStatus.offline;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cowId': cowId,
      'deviceCode': deviceCode,
      'status': status.name,
      'batteryLevel': batteryLevel,
      'lastSeen': lastSeen.toIso8601String(),
    };
  }
}