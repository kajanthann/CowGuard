import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/device.dart';
import '../services/firebase_service.dart';
import '../utils/constants.dart';

class DevicesScreen extends StatefulWidget {
  const DevicesScreen({super.key});

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  final _service = FirebaseService();
  List<Device> _devices = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final devices = await _service.fetchDevices();
    if (!mounted) return;
    setState(() {
      _devices = devices;
      _loading = false;
    });
  }

  Color _statusColor(DeviceStatus status) {
    switch (status) {
      case DeviceStatus.online:
        return AppColors.primary;
      case DeviceStatus.lowBattery:
        return AppColors.warning;
      case DeviceStatus.offline:
        return AppColors.danger;
    }
  }

  String _statusLabel(DeviceStatus status) {
    switch (status) {
      case DeviceStatus.online:
        return 'Online';
      case DeviceStatus.lowBattery:
        return 'Low Battery';
      case DeviceStatus.offline:
        return 'Offline';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_devices.isEmpty) {
      return const Center(child: Text('No devices registered yet'));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        itemCount: _devices.length,
        itemBuilder: (context, i) {
          final device = _devices[i];
          final color = _statusColor(device.status);
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 6),
            elevation: 1.5,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: color.withOpacity(0.15),
                child: Icon(Icons.sensors, color: color),
              ),
              title: Text(device.deviceCode,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text(
                'Last seen: ${DateFormat('MMM d, HH:mm').format(device.lastSeen)}',
                style: const TextStyle(fontSize: 12),
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _statusLabel(device.status),
                      style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('${device.batteryLevel.toInt()}% batt',
                      style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}