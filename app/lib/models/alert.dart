enum AlertType {
  boundaryViolation,
  lowBattery,
  gpsLoss,
  noMovement,
  abnormalSpeed,
}

enum AlertSeverity { info, warning, critical }

class AlertItem {
  final String id;
  final String cowId;
  final String cowName;
  final AlertType type;
  final AlertSeverity severity;
  final String message;
  final DateTime timestamp;
  final bool resolved;

  AlertItem({
    required this.id,
    required this.cowId,
    required this.cowName,
    required this.type,
    required this.severity,
    required this.message,
    required this.timestamp,
    this.resolved = false,
  });

  factory AlertItem.fromJson(Map<String, dynamic> json) {
    return AlertItem(
      id: json['id']?.toString() ?? '',
      cowId: json['cowId']?.toString() ?? '',
      cowName: json['cowName'] ?? 'Unknown',
      type: _typeFromString(json['type']),
      severity: _severityFromString(json['severity']),
      message: json['message'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      resolved: json['resolved'] ?? false,
    );
  }

  static AlertType _typeFromString(String? s) {
    switch (s) {
      case 'boundaryViolation':
        return AlertType.boundaryViolation;
      case 'lowBattery':
        return AlertType.lowBattery;
      case 'gpsLoss':
        return AlertType.gpsLoss;
      case 'noMovement':
        return AlertType.noMovement;
      case 'abnormalSpeed':
        return AlertType.abnormalSpeed;
      default:
        return AlertType.gpsLoss;
    }
  }

  static AlertSeverity _severityFromString(String? s) {
    switch (s) {
      case 'critical':
        return AlertSeverity.critical;
      case 'warning':
        return AlertSeverity.warning;
      default:
        return AlertSeverity.info;
    }
  }
}