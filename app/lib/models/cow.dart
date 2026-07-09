class Cow {
  final String id;
  final String name;
  final String tagNumber;
  final double latitude;
  final double longitude;
  final double batteryLevel;   // 0-100
  final int signalStrength;    // 0-100 (RSSI mapped)
  final bool isInsideGeofence;
  final bool isMoving;
  final DateTime lastUpdated;

  Cow({
    required this.id,
    required this.name,
    required this.tagNumber,
    required this.latitude,
    required this.longitude,
    required this.batteryLevel,
    required this.signalStrength,
    required this.isInsideGeofence,
    required this.isMoving,
    required this.lastUpdated,
  });

  factory Cow.fromJson(Map<String, dynamic> json) {
    return Cow(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown',
      tagNumber: json['tagNumber'] ?? '-',
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
      batteryLevel: (json['batteryLevel'] ?? 0).toDouble(),
      signalStrength: (json['signalStrength'] ?? 0).toInt(),
      isInsideGeofence: json['isInsideGeofence'] ?? true,
      isMoving: json['isMoving'] ?? false,
      lastUpdated: json['lastUpdated'] != null
          ? DateTime.parse(json['lastUpdated'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'tagNumber': tagNumber,
      'latitude': latitude,
      'longitude': longitude,
      'batteryLevel': batteryLevel,
      'signalStrength': signalStrength,
      'isInsideGeofence': isInsideGeofence,
      'isMoving': isMoving,
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }
}