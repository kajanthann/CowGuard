import 'package:flutter/material.dart';
import '../models/cow.dart';
import '../utils/constants.dart';

class CowCard extends StatelessWidget {
  final Cow cow;
  final VoidCallback? onTap;

  const CowCard({super.key, required this.cow, this.onTap});

  Color _batteryColor() {
    if (cow.batteryLevel < 20) return AppColors.danger;
    if (cow.batteryLevel < 50) return AppColors.warning;
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: cow.isInsideGeofence
                    ? AppColors.primary.withOpacity(0.15)
                    : AppColors.danger.withOpacity(0.15),
                child: const Text('🐄', style: TextStyle(fontSize: 22)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(cow.name,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(cow.tagNumber,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textLight)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.battery_std, size: 15, color: _batteryColor()),
                        const SizedBox(width: 3),
                        Text('${cow.batteryLevel.toInt()}%',
                            style: const TextStyle(fontSize: 12)),
                        const SizedBox(width: 12),
                        const Icon(Icons.signal_cellular_alt,
                            size: 15, color: AppColors.textLight),
                        const SizedBox(width: 3),
                        Text('${cow.signalStrength}%',
                            style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: cow.isInsideGeofence
                          ? AppColors.primary.withOpacity(0.1)
                          : AppColors.danger.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      cow.isInsideGeofence ? 'Inside' : 'Outside',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: cow.isInsideGeofence
                            ? AppColors.primary
                            : AppColors.danger,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Icon(
                    cow.isMoving ? Icons.directions_walk : Icons.pause_circle_outline,
                    size: 16,
                    color: AppColors.textLight,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}