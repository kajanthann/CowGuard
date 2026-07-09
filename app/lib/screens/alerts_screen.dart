import 'package:flutter/material.dart';
import '../models/alert.dart';
import '../services/firebase_service.dart';
import '../widgets/alert_tile.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final _service = FirebaseService();
  List<AlertItem> _alerts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final alerts = await _service.fetchAlerts();
    if (!mounted) return;
    setState(() {
      _alerts = alerts;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_alerts.isEmpty) {
      return const Center(child: Text('No alerts right now 🎉'));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _alerts.length,
        itemBuilder: (context, i) {
          final alert = _alerts[i];
          return AlertTile(
            alert: alert,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Tapped alert for ${alert.cowName}')),
              );
            },
          );
        },
      ),
    );
  }
}