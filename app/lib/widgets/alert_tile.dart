import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/alert.dart';
import '../utils/constants.dart';

class AlertTile extends StatelessWidget {
  final AlertItem alert;
  final VoidCallback? onTap;

  const AlertTile({super.key, required this.alert, this.onTap});

  IconData _iconFor(AlertType type) {
    switch (type) {
      case AlertType.boundaryViolation:
        return Icons.fence;
      case AlertType.lowBattery:
        return Icons.battery_alert;
      case AlertType.gpsLoss:
        return Icons.gps_off;
      case AlertType.noMovement:
        return Icons.pause_circle_outline;
      case AlertType.abnormalSpeed:
        return Icons.speed;
    }
  }

  Color _colorFor(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.critical:
        return AppColors.danger;
      case AlertSeverity.warning:
        return AppColors.warning;
      case AlertSeverity.info:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _colorFor(alert.severity);
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.15),
          child: Icon(_iconFor(alert.type), color: color),
        ),
        title: Text(alert.cowName,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(alert.message),
        trailing: Text(
          DateFormat('HH:mm').format(alert.timestamp),
          style: const TextStyle(fontSize: 12, color: AppColors.textLight),
        ),
      ),
    );
  }
}