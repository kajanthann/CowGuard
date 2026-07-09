import 'package:flutter/material.dart';
import '../models/cow.dart';
import '../services/firebase_service.dart';
import '../widgets/cow_card.dart';
import '../utils/constants.dart';

class CowsScreen extends StatefulWidget {
  const CowsScreen({super.key});

  @override
  State<CowsScreen> createState() => _CowsScreenState();
}

class _CowsScreenState extends State<CowsScreen> {
  final _service = FirebaseService();
  List<Cow> _cows = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final cows = await _service.fetchCows();
    if (!mounted) return;
    setState(() {
      _cows = cows;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_cows.isEmpty) {
      return const Center(child: Text('No cows registered yet'));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _cows.length,
        itemBuilder: (context, i) {
          final cow = _cows[i];
          return CowCard(
            cow: cow,
            onTap: () => _showCowDetail(context, cow),
          );
        },
      ),
    );
  }

  void _showCowDetail(BuildContext context, Cow cow) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(cow.name,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(cow.tagNumber, style: const TextStyle(color: AppColors.textLight)),
            const Divider(height: 24),
            _detailRow('Battery', '${cow.batteryLevel.toInt()}%'),
            _detailRow('Signal', '${cow.signalStrength}%'),
            _detailRow('Status', cow.isInsideGeofence ? 'Inside boundary' : 'Outside boundary'),
            _detailRow('Movement', cow.isMoving ? 'Moving' : 'Idle'),
            _detailRow('Location', '${cow.latitude.toStringAsFixed(5)}, ${cow.longitude.toStringAsFixed(5)}'),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textLight)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}